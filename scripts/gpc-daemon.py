#!/usr/bin/env python3
# I push live gaming PC stats (CPU, GPU, current game) to Upstash Redis every 60 seconds so my portfolio dashboard can show real-time hardware usage and what game I am playing.
"""
Gaming PC daemon - writes CPU%, GPU%, current game and timestamp to Upstash Redis every 60s.
No battery - desktop only. Runs as a Windows service via NSSM.
GPU: NVIDIA GeForce RTX 4060 via pynvml.

I detect the current game using five tiers in priority order:
  1. KNOWN_GAMES hardcoded dict           - instant, zero API calls, zero false positives
  2. Steam Web API (GetPlayerSummaries)   - any Steam game, needs STEAM_API_KEY + STEAM_ID
  3. Epic Games local manifests           - reads C:\\ProgramData\\Epic manifests, automatic
  4. EA App local manifests               - reads C:\\ProgramData\\EA Desktop, automatic
  5. Process name -> IGDB fuzzy search    - catches anything else with a readable exe name

For tiers 2 and 3, I look up the game's cover art via the IGDB external_games endpoint
using the Steam App ID or Epic Catalog ID - more reliable than searching by name.
All other tiers use IGDB name search with a similarity filter to avoid false positives.
Results are cached in memory so IGDB is only hit once per game per daemon session.

Setup:
  pip install psutil requests pynvml

Required env vars:
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Optional env vars:
  IGDB_CLIENT_ID      - Twitch developer app client ID (dev.twitch.tv/console)
  IGDB_CLIENT_SECRET  - Twitch developer app client secret
  STEAM_API_KEY       - Free from steamcommunity.com/dev/apikey
  STEAM_ID            - Your Steam64 ID from your Steam profile URL or steamid.xyz
                        Profile must have Game Details set to Public in Steam Privacy Settings

NSSM setup (admin PowerShell, all vars in ONE call):
  nssm set gpc-daemon AppEnvironmentExtra ^
    UPSTASH_REDIS_REST_URL=https://... ^
    UPSTASH_REDIS_REST_TOKEN=... ^
    IGDB_CLIENT_ID=... ^
    IGDB_CLIENT_SECRET=... ^
    STEAM_API_KEY=... ^
    STEAM_ID=76561198xxxxxxxxx
  nssm restart gpc-daemon
"""

import os
import sys
import json
import time
import socket
import re
import glob
import difflib
import xml.etree.ElementTree as ET

import requests

try:
    import psutil
except ImportError:
    print("Missing dependency. Run: pip install psutil requests pynvml", flush=True)
    sys.exit(1)

try:
    import pynvml
    pynvml.nvmlInit()
    # I grab the NVML handle once at startup to avoid repeated driver calls on every poll
    _nvml_handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    NVML_AVAILABLE = True
except Exception as e:
    # I fall back gracefully so the daemon still runs on machines without NVIDIA drivers
    print(f"pynvml not available or no NVIDIA GPU found: {e}", flush=True)
    NVML_AVAILABLE = False

UPSTASH_URL   = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
IGDB_CLIENT_ID     = os.environ.get("IGDB_CLIENT_ID")
IGDB_CLIENT_SECRET = os.environ.get("IGDB_CLIENT_SECRET")
STEAM_API_KEY = os.environ.get("STEAM_API_KEY")
STEAM_ID      = os.environ.get("STEAM_ID")
# I poll every 60s - frequent enough for a live widget but light on the free Upstash command
# budget. The /now page reads come from a CDN cache, so this write cadence is the main cost.
INTERVAL = 60

if not UPSTASH_URL or not UPSTASH_TOKEN:
    print("Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars first.", flush=True)
    sys.exit(1)

DEVICE = socket.gethostname()

# =============================================================================
# Tier 1 - Hardcoded known games
# I check this first: fastest path, no API calls, guaranteed correct results.
# Add new games here as "Display Name": "executable.exe"
# =============================================================================
KNOWN_GAMES = {
    "Fortnite":      "fortniteclient-win64-shipping.exe",
    "Minecraft":     "javaw.exe",
    "GTA V":         "gta5.exe",
    "GTA VI":        "gtavi.exe",
    "FiveM":         "fivem.exe",
    "FC 26":         "fc26.exe",
    "FC 27":         "fc27.exe",
    "Call of Duty":  "cod.exe",
    "Apex Legends":  "r5apex.exe",
    "Rocket League": "rocketleague.exe",
    "Overwatch 2":   "overwatch.exe",
}

# IGDB name map for tier 1 games whose IGDB title differs from our short display name
IGDB_NAME_MAP = {
    "GTA V":         "Grand Theft Auto V",
    "GTA VI":        "Grand Theft Auto VI",
    "FC 26":         "EA Sports FC 26",
    "FC 27":         "EA Sports FC 27",
    "FiveM":         "Grand Theft Auto V",
    "Overwatch 2":   "Overwatch 2",
    "Call of Duty":  "Call of Duty",
}

# Fallback images used when IGDB is not configured or a lookup fails
FALLBACK_IMAGES = {
    "GTA V":         "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    "Apex Legends":  "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
    "Rocket League": "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
    "Overwatch 2":   "https://cdn.cloudflare.steamstatic.com/steam/apps/2357570/header.jpg",
    "Minecraft":     "https://cdn.cloudflare.steamstatic.com/steam/apps/2566040/header.jpg",
    "FiveM":         "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    "GTA VI":        "https://cdn.cloudflare.steamstatic.com/steam/apps/2394830/header.jpg",
    "FC 26":         "https://media.contentapi.ea.com/content/dam/ea/eafc/eafc-26/common/eafc26-mobile-header.jpg.adapt.1920w.jpg",
    "FC 27":         "https://media.contentapi.ea.com/content/dam/ea/eafc/eafc-27/common/eafc27-mobile-header.jpg.adapt.1920w.jpg",
    "Fortnite":      "https://cdn2.unrealengine.com/en-14br-egs-launcher-sectionbanner-1920x1080-1920x1080-264983321.jpg",
}

# =============================================================================
# Tier 3 & 4 - Local manifest paths (Windows standard locations)
# =============================================================================
_EPIC_MANIFESTS_DIR = r"C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests"
_EA_INSTALL_DIR     = r"C:\ProgramData\EA Desktop\InstallData"

# =============================================================================
# Tier 5 - Process blocklist for fuzzy detection
# I skip these names so common non-game processes never trigger IGDB searches.
# =============================================================================
_NON_GAME_BLOCKLIST = {
    # Browsers
    "chrome", "firefox", "msedge", "brave", "opera", "vivaldi", "iexplore",
    # Communication
    "discord", "slack", "teams", "zoom", "skype", "telegram", "signal", "whatsapp",
    # Development
    "code", "cursor", "devenv", "pycharm64", "idea64", "clion64", "webstorm64",
    "androidstudio64", "rider64", "goland64", "datagrip64", "vim", "nvim",
    # System processes
    "svchost", "taskhost", "taskhostw", "taskmgr", "explorer", "dwm", "conhost",
    "searchhost", "searchindexer", "lsass", "winlogon", "csrss", "smss", "wininit",
    "services", "spoolsv", "audiodg", "runtimebroker", "sihost", "ctfmon",
    "shellexperiencehost", "startmenuexperiencehost", "fontdrvhost", "dllhost",
    "msdtc", "vssvc", "msiexec", "regsvr32", "werfault", "wermgr",
    # Media (not games)
    "spotify", "vlc", "obs64", "obs", "streamlabs", "audacity", "foobar2000",
    # Game launchers (not the games themselves)
    "steam", "steamwebhelper", "gameoverlayui", "steamservice",
    "epicgameslauncher", "eoscredentialshost", "eosservicehost",
    "origin", "eadesktop", "eabackgroundservice",
    "galaxyclient", "battlenet", "ubisoftconnect", "upc",
    "riotclientservices", "riotclientux",
    # Common apps
    "notepad", "calc", "mspaint", "winword", "excel", "powerpnt", "onenote",
    "outlook", "msedgewebview2",
    # Python / Node / Git
    "python", "python3", "pythonw", "node", "npm", "git",
    # NVIDIA / AMD driver helpers
    "nvcontainer", "nvtelemetrycontainer", "nvcplui", "nvspcaps64",
    "igcc", "igcctray", "radeonsoftware", "amdow",
    # Security
    "malwarebytes", "mbam", "msmpeng",
}

print(
    f"GPC daemon started on {DEVICE}. Polling every {INTERVAL}s.\n"
    f"  IGDB:      {'enabled' if IGDB_CLIENT_ID else 'disabled (set IGDB_CLIENT_ID + IGDB_CLIENT_SECRET)'}\n"
    f"  Steam API: {'enabled' if STEAM_API_KEY and STEAM_ID else 'disabled (set STEAM_API_KEY + STEAM_ID)'}\n"
    f"  Epic/EA:   auto (local manifest scan)\n"
    "Press Ctrl+C to stop.",
    flush=True,
)

# =============================================================================
# IGDB helpers
# =============================================================================

_igdb_token: str | None = None
_igdb_token_expiry: float = 0.0
# I cache cover art results keyed by (source, external_id or game_name) so IGDB
# is only called once per game per daemon session.
_game_image_cache: dict[str, str | None] = {}


def _get_igdb_token() -> str | None:
    global _igdb_token, _igdb_token_expiry
    if _igdb_token and time.time() < _igdb_token_expiry:
        return _igdb_token
    if not IGDB_CLIENT_ID or not IGDB_CLIENT_SECRET:
        return None
    try:
        resp = requests.post(
            "https://id.twitch.tv/oauth2/token",
            params={
                "client_id": IGDB_CLIENT_ID,
                "client_secret": IGDB_CLIENT_SECRET,
                "grant_type": "client_credentials",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        _igdb_token = data["access_token"]
        # I subtract 60s from expiry so we refresh before it actually expires
        _igdb_token_expiry = time.time() + data["expires_in"] - 60
        print(f"[igdb] new token, expires in {data['expires_in']}s", flush=True)
        return _igdb_token
    except Exception as e:
        print(f"[igdb] token fetch failed: {e}", flush=True)
        return None


def _igdb_art_by_name(game_name: str) -> str | None:
    """
    Search IGDB by title and return a LANDSCAPE image so the gaming PC card matches the look of
    the PS5 card. I prefer an official artwork (key art) and fall back to the portrait cover.
    I pick the most-rated match so a DLC, season or crew-pack entry never wins over the base game
    (e.g. searching "Fortnite" otherwise returns a "Fortnite Crew Pack" with no artwork).
    """
    token = _get_igdb_token()
    if not token:
        return None
    igdb_title = IGDB_NAME_MAP.get(game_name, game_name)
    try:
        resp = requests.post(
            "https://api.igdb.com/v4/games",
            headers={
                "Client-ID": IGDB_CLIENT_ID,
                "Authorization": f"Bearer {token}",
                # IGDB requires Content-Type text/plain for Apicalypse query bodies
                "Content-Type": "text/plain",
            },
            data=(
                f'search "{igdb_title}"; '
                "fields name, total_rating_count, artworks.image_id, cover.image_id; "
                "where (artworks != null | cover != null); limit 6;"
            ),
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json()
        if not results:
            return None
        # I pick the most-rated entry so the base game beats same-named DLC/season packs
        best = max(results, key=lambda r: r.get("total_rating_count") or 0)
        base = "https://images.igdb.com/igdb/image/upload"
        artworks = best.get("artworks")
        if artworks:
            # t_720p is landscape (1280x720) and crops cleanly into the square card
            url = f"{base}/t_720p/{artworks[0]['image_id']}.jpg"
            print(f"[igdb] artwork '{best.get('name')}': {url}", flush=True)
            return url
        cover = best.get("cover")
        if cover:
            url = f"{base}/t_cover_big/{cover['image_id']}.jpg"
            print(f"[igdb] cover '{best.get('name')}': {url}", flush=True)
            return url
    except Exception as e:
        print(f"[igdb] art search failed for '{game_name}': {e}", flush=True)
    return None


def get_game_image(game_name: str, source: str | None = None, external_id: str | None = None) -> str | None:
    """
    Return a landscape image URL for game_name so EVERY gaming PC game matches the look of the
    PS5 card. The card renders into a small square slot with object-cover, where a portrait cover
    crops to an ugly vertical slice - so I want landscape key art for all of them. The same path
    runs for every detected game (hardcoded, Steam, Epic, EA and fuzzy), so they are consistent.
    Priority:
      1. IGDB artwork (landscape key art) for any game, picking the most-rated match
      2. Steam header (exact by App ID) as a reliable backstop if IGDB has nothing
      3. A curated fallback last (some publisher CDNs hotlink-block with 403)
    """
    cache_key = f"{source}:{external_id or game_name}"
    if cache_key in _game_image_cache:
        return _game_image_cache[cache_key]

    url: str | None = None

    # 1. IGDB landscape artwork - the good one, run for EVERY game
    if IGDB_CLIENT_ID and IGDB_CLIENT_SECRET:
        url = _igdb_art_by_name(game_name)

    # 2. Steam header - exact match by App ID, reliable when IGDB drew a blank
    if url is None and source == "steam" and external_id:
        url = f"https://cdn.cloudflare.steamstatic.com/steam/apps/{external_id}/header.jpg"
        print(f"[image] steam header for appid={external_id}", flush=True)

    # 3. Curated fallback - last resort only
    if url is None:
        url = FALLBACK_IMAGES.get(game_name)
        if url:
            print(f"[image] curated fallback for '{game_name}'", flush=True)

    _game_image_cache[cache_key] = url
    return url


# =============================================================================
# Tier 1 - KNOWN_GAMES detection
# =============================================================================

def _get_running_exes() -> set[str]:
    """Return lowercase exe names for all running processes."""
    try:
        return {p.info["name"].lower() for p in psutil.process_iter(["name"]) if p.info["name"]}
    except Exception:
        return set()


def _detect_known(running: set[str]) -> str | None:
    for name, exe in KNOWN_GAMES.items():
        if exe.lower() in running:
            return name
    return None


# =============================================================================
# Tier 2 - Steam Web API
# I call GetPlayerSummaries which returns gameid + gameextrainfo when the user
# is in-game. This covers 100% of Steam games with zero local file access.
# =============================================================================

def _detect_steam() -> tuple[str | None, str | None]:
    """Returns (game_name, steam_appid) or (None, None)."""
    if not STEAM_API_KEY or not STEAM_ID:
        return None, None
    try:
        resp = requests.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
            params={"key": STEAM_API_KEY, "steamids": STEAM_ID},
            timeout=10,
        )
        resp.raise_for_status()
        players = resp.json().get("response", {}).get("players", [])
        if not players:
            return None, None
        player = players[0]
        # gameid is only present in the response when the player is actively in a game
        appid = str(player.get("gameid", ""))
        if not appid or appid == "0":
            return None, None
        # gameextrainfo is the game name shown in the Steam friend list - most reliable source
        game_name = player.get("gameextrainfo") or f"Steam Game {appid}"
        print(f"[steam] playing appid={appid} '{game_name}'", flush=True)
        return game_name, appid
    except Exception as e:
        print(f"[steam] detection failed: {e}", flush=True)
        return None, None


# =============================================================================
# Tier 3 - Epic Games local manifests
# Each installed Epic game has a .item JSON file with DisplayName and
# LaunchExecutable. I cross-reference the exe against running processes.
# I cache the manifest scan and refresh every 5 minutes.
# =============================================================================

_epic_exe_to_name: dict[str, str] = {}    # exe_lower -> display_name
_epic_name_to_id:  dict[str, str] = {}    # display_name -> CatalogItemId
_epic_cache_ts: float = 0.0
_MANIFEST_CACHE_TTL = 300  # 5 minutes


def _load_epic_manifests() -> None:
    global _epic_exe_to_name, _epic_name_to_id, _epic_cache_ts
    _epic_exe_to_name = {}
    _epic_name_to_id  = {}
    try:
        for path in glob.glob(os.path.join(_EPIC_MANIFESTS_DIR, "*.item")):
            try:
                with open(path, encoding="utf-8") as f:
                    m = json.load(f)
                name       = m.get("DisplayName", "")
                launch_exe = m.get("LaunchExecutable", "")
                catalog_id = m.get("CatalogItemId", "")
                if name and launch_exe:
                    exe = os.path.basename(launch_exe).lower()
                    _epic_exe_to_name[exe] = name
                    if catalog_id:
                        _epic_name_to_id[name] = catalog_id
            except Exception:
                pass
    except Exception as e:
        print(f"[epic] manifest scan failed: {e}", flush=True)
    _epic_cache_ts = time.time()
    print(f"[epic] loaded {len(_epic_exe_to_name)} installed games", flush=True)


def _detect_epic(running: set[str]) -> tuple[str | None, str | None]:
    """Returns (display_name, catalog_item_id) or (None, None)."""
    if not os.path.isdir(_EPIC_MANIFESTS_DIR):
        return None, None
    # I refresh the manifest cache every 5 minutes in case new games were installed
    if time.time() - _epic_cache_ts > _MANIFEST_CACHE_TTL:
        _load_epic_manifests()
    for exe, name in _epic_exe_to_name.items():
        if exe in running:
            catalog_id = _epic_name_to_id.get(name)
            print(f"[epic] detected '{name}' exe={exe} catalog={catalog_id}", flush=True)
            return name, catalog_id
    return None, None


# =============================================================================
# Tier 4 - EA App local manifests
# EA Desktop stores an installerdata.xml per game under InstallData.
# I parse the display name and launcher exe from each XML file.
# =============================================================================

_ea_exe_to_name: dict[str, str] = {}
_ea_cache_ts: float = 0.0


def _load_ea_manifests() -> None:
    global _ea_exe_to_name, _ea_cache_ts
    _ea_exe_to_name = {}
    try:
        for xml_path in glob.glob(os.path.join(_EA_INSTALL_DIR, "*", "installerdata.xml")):
            try:
                root = ET.parse(xml_path).getroot()

                # I try the en_US locale first, then fall back to any locale or displayName element
                name: str | None = None
                for elem in root.iter("gameTitle"):
                    if elem.get("locale") == "en_US":
                        name = elem.text
                        break
                if name is None:
                    for elem in root.iter("gameTitle"):
                        name = elem.text
                        break
                if name is None:
                    for elem in root.iter("displayName"):
                        name = elem.text
                        break

                # I look for the launcher exe path - EA's XML has a few different structures
                exe: str | None = None
                for elem in root.iter("filePath"):
                    if elem.text and elem.text.lower().endswith(".exe"):
                        exe = os.path.basename(elem.text).lower()
                        break

                if name and exe:
                    _ea_exe_to_name[exe] = name
            except Exception:
                pass
    except Exception as e:
        print(f"[ea] manifest scan failed: {e}", flush=True)
    _ea_cache_ts = time.time()
    print(f"[ea] loaded {len(_ea_exe_to_name)} installed EA games", flush=True)


def _detect_ea(running: set[str]) -> str | None:
    """Returns game_name or None."""
    if not os.path.isdir(_EA_INSTALL_DIR):
        return None
    if time.time() - _ea_cache_ts > _MANIFEST_CACHE_TTL:
        _load_ea_manifests()
    for exe, name in _ea_exe_to_name.items():
        if exe in running:
            print(f"[ea] detected '{name}' exe={exe}", flush=True)
            return name
    return None


# =============================================================================
# Tier 5 - Process name -> IGDB fuzzy search
# For anything not caught above, I clean the exe name and search IGDB.
# I use difflib similarity to filter false positives (threshold 0.65).
# Misses are cached for 5 minutes so we don't spam IGDB every 30s.
# =============================================================================

_fuzzy_hits:  dict[str, str]   = {}   # cleaned_name -> matched game_name (permanent)
_fuzzy_misses: dict[str, float] = {}  # cleaned_name -> timestamp (expire after 5 min)
_FUZZY_TTL         = 300
_FUZZY_THRESHOLD   = 0.65


def _clean_exe(exe: str) -> str:
    """
    Strip .exe, remove common game binary suffixes, convert separators to spaces.
    e.g. 'RocketLeague-Win64-Shipping.exe' -> 'Rocket League'
    """
    name = re.sub(r"\.exe$", "", exe, flags=re.IGNORECASE)
    # I strip architecture and build-type suffixes common in game binaries before splitting
    name = re.sub(
        r"[-_](win64|win32|x64|x86|64|32|shipping|launcher|client|game|retail|dx11|dx12|vulkan)$",
        "", name, flags=re.IGNORECASE,
    )
    name = re.sub(r"[-_.]", " ", name)
    return re.sub(r"\s+", " ", name).strip().title()


def _detect_fuzzy(running: set[str]) -> str | None:
    if not IGDB_CLIENT_ID or not IGDB_CLIENT_SECRET:
        return None
    token = _get_igdb_token()
    if not token:
        return None

    # I build the set of exes already handled by earlier tiers to avoid redundant lookups
    covered = (
        {e.lower() for e in KNOWN_GAMES.values()}
        | set(_epic_exe_to_name)
        | set(_ea_exe_to_name)
        | _NON_GAME_BLOCKLIST
    )

    for exe in running:
        base = re.sub(r"\.exe$", "", exe, flags=re.IGNORECASE)
        if exe in covered or base in _NON_GAME_BLOCKLIST or len(base) < 3:
            continue

        cleaned = _clean_exe(exe)
        if len(cleaned) < 3:
            continue

        # I return a cached hit immediately to avoid repeat IGDB calls
        if cleaned in _fuzzy_hits:
            return _fuzzy_hits[cleaned]

        # I skip recently missed names to avoid hammering IGDB every 30s
        if cleaned in _fuzzy_misses:
            if time.time() - _fuzzy_misses[cleaned] < _FUZZY_TTL:
                continue
            del _fuzzy_misses[cleaned]

        try:
            resp = requests.post(
                "https://api.igdb.com/v4/games",
                headers={
                    "Client-ID": IGDB_CLIENT_ID,
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "text/plain",
                },
                data=f'search "{cleaned}"; fields name; limit 1;',
                timeout=5,
            )
            if not resp.ok:
                continue
            results = resp.json()
            if not results:
                _fuzzy_misses[cleaned] = time.time()
                continue
            igdb_name = results[0].get("name", "")
            sim = difflib.SequenceMatcher(None, cleaned.lower(), igdb_name.lower()).ratio()
            if sim >= _FUZZY_THRESHOLD:
                print(f"[fuzzy] '{exe}' -> '{igdb_name}' (sim={sim:.2f})", flush=True)
                _fuzzy_hits[cleaned] = igdb_name
                return igdb_name
            else:
                print(f"[fuzzy] rejected '{exe}' -> '{igdb_name}' (sim={sim:.2f})", flush=True)
                _fuzzy_misses[cleaned] = time.time()
        except Exception as e:
            print(f"[fuzzy] search failed for '{cleaned}': {e}", flush=True)

    return None


# =============================================================================
# Detection orchestrator
# =============================================================================

def get_current_game() -> tuple[str | None, str | None, str | None]:
    """
    Run all five detection tiers and return the first match as
    (game_name, external_id, source).
    external_id is the Steam App ID or Epic Catalog ID when available,
    used by get_game_image() for the more accurate external_games IGDB lookup.
    """
    running = _get_running_exes()

    # Tier 1: hardcoded - no API calls, instant
    name = _detect_known(running)
    if name:
        return name, None, "known"

    # Tier 2: Steam Web API - exact via App ID
    name, appid = _detect_steam()
    if name:
        return name, appid, "steam"

    # Tier 3: Epic local manifests - automatic
    name, catalog_id = _detect_epic(running)
    if name:
        return name, catalog_id, "epic"

    # Tier 4: EA App local manifests - automatic
    name = _detect_ea(running)
    if name:
        return name, None, "ea"

    # Tier 5: fuzzy process -> IGDB
    name = _detect_fuzzy(running)
    if name:
        return name, None, "fuzzy"

    return None, None, None


# =============================================================================
# System helpers
# =============================================================================

def get_gpu_percent() -> int | None:
    if not NVML_AVAILABLE:
        return None
    try:
        rates = pynvml.nvmlDeviceGetUtilizationRates(_nvml_handle)
        return rates.gpu
    except Exception:
        return None


def write_status() -> None:
    cpu = round(psutil.cpu_percent(interval=1))
    gpu = get_gpu_percent()
    game_name, external_id, source = get_current_game()
    game_image = get_game_image(game_name, source, external_id) if game_name else None

    payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device":      DEVICE,
        "cpu_percent": cpu,
        "gpu_percent": gpu,
        "game":        game_name,
        "game_image":  game_image,
    }

    commands = [
        # I set a 600-second TTL so the key disappears if the daemon stops, signalling the PC is offline
        ["SET", "gpc:status",     json.dumps(payload), "EX", 600],
        # I also write a TTL-free key so the dashboard can show the last-known state when offline
        ["SET", "gpc:last-known", json.dumps(payload)],
    ]
    # I persist the last game I actually played to its own TTL-free key, written ONLY while a game is
    # detected. The dashboard shows this when the PC is offline (like the PS5 card). It lives apart
    # from gpc:last-known so quitting to the desktop before shutdown does not wipe it with game=null.
    if game_name:
        commands.append(
            ["SET", "gpc:last-game", json.dumps({"game": game_name, "game_image": game_image})]
        )

    try:
        res = requests.post(
            f"{UPSTASH_URL}/pipeline",
            headers={
                "Authorization": f"Bearer {UPSTASH_TOKEN}",
                "Content-Type": "application/json",
            },
            json=commands,
            timeout=10,
        )
        ts       = time.strftime("%H:%M:%S")
        gpu_str  = f"{gpu}%" if gpu is not None else "n/a"
        game_str = f"{game_name} [{source}]" if game_name else "none"
        print(f"[{ts}] cpu={cpu}% gpu={gpu_str} game={game_str} -> {res.status_code}", flush=True)
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] write failed: {e}", flush=True)


while True:
    write_status()
    time.sleep(INTERVAL)
