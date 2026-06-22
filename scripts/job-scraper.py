# I scrape tech internships and placements from 20+ sources and upsert them into Supabase so my application tracker stays fresh without manual searching.
"""
Job Scraper - runs via GitHub Actions every 2 days at midnight UTC.

Sources:
  - The Trackr (Playwright - JS rendered, best UK internship aggregator)
  - Google Careers     (Playwright - React SPA, no public REST API)
  - Meta Careers       (Playwright - React SPA, no public REST API)
  - ARM Careers        (Playwright - Workday with proprietary session auth)
  - Goldman Sachs      (Playwright - higher.gs.com React portal)
  - JPMorgan Careers   (Playwright - React SPA, Workday with proprietary auth)
  - Greenhouse JSON API  (50+ companies)
  - Lever JSON API       (5+ companies)
  - Ashby REST API       (30+ companies)
  - Amazon Jobs JSON API (custom scraper)
  - Workday CXS API    (NVIDIA, Intel, Morgan Stanley)
  - SmartRecruiters    (JSON API)
  - Apple, Microsoft   (custom JSON APIs)
  - Reed, Adzuna, Jooble, Remotive, Arbeitnow, Jobicy (job board APIs)
  - Gradcracker, RateMyPlacement, TargetJobs, BrightNetwork (BeautifulSoup)

Only student-facing roles are saved: internships, placements, spring/insight
weeks, graduate schemes, apprenticeships. Full-time permanent roles are
skipped unless they come from a priority company and contain a keyword.

Field enrichment: cv_required defaults True for all scraped roles;
sponsors_visa and cover_letter_required are detected from job descriptions
where the ATS returns them (Greenhouse content field, Ashby descriptionPlain).
Opening dates and deadlines are populated where the ATS exposes them.

Deduplicates by URL when present, falls back to company+role.
"""

import os
import re
import time
import json
import hashlib
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime, timezone, timedelta

# I use whole-word matching for "intern" so words like "internal" and
# "international" do not trigger a false positive intern classification.
_INTERN_WHOLE_WORD_RE = re.compile(
    r'\b(intern|internship|internships|interns)\b', re.IGNORECASE
)
_EXCLUDE_INTERN_RE = re.compile(
    r'\b(internal|international|internally)\b', re.IGNORECASE
)

# I catch "Internal <function>" patterns that appear mid-title (not just at the start).
# e.g. "Lead Engineer, Internal Engineering" or "Staff PM - Internal AI".
_INTERNAL_FUNCTION_RE = re.compile(
    r'\binternal\s+(engineering|engineer|audit|auditor|ai|ops|operations|'
    r'tools|platform|systems|it\b|hr\b|recruiter|recruiting|transfer|mobility)',
    re.IGNORECASE
)

# I skip the department-name fallback for clearly senior or non-student titles
# so MongoDB / Adyen roles tagged under a university dept do not slip through.
_SENIOR_ROLE_RE = re.compile(
    r'\b(staff|senior|lead|principal|director|vp\b|vice president|head of|'
    r'manager|recruiter|auditor|contractor|contract\b|associate recruiter)\b',
    re.IGNORECASE
)

# I read credentials from environment variables set by GitHub Actions secrets
# so nothing sensitive ever touches the repository.
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

# I create the client at module level so it is shared across all scraper
# functions rather than re-initialising a new connection for every company.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# I impersonate a real Chrome browser so sites do not block the scraper with
# a bot check. Accept-Language hints I am a UK user, biasing geo results.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept": (
        "text/html,application/xhtml+xml,"
        "application/xml;q=0.9,*/*;q=0.8"
    ),
}

# I keep the keyword list broad enough to catch hardware, cloud, quant and
# traditional SWE roles because my interests span all of these areas.
TECH_KEYWORDS = [
    "software", "engineer", "developer", "technology", "data", "ai",
    "machine learning", "embedded", "electronic", "hardware", "firmware",
    "fpga", "computer science", "computing", "cyber", "security", "devops",
    "cloud", "backend", "frontend", "fullstack", "full stack", "swe",
    "infrastructure", "networking", "systems", "platform", "reliability",
    "quantitative", "quant", "trading", "research", "analyst",
    # Cloud & infrastructure specific
    "aws", "azure", "gcp", "kubernetes", "k8s", "docker", "terraform",
    "ansible", "serverless", "microservices", "devsecops", "site reliability",
    "solutions architect", "cloud architect", "cloud engineer",
    # Additional tech roles
    "product", "robotics", "automation", "test", "qa", "quality assurance",
    "compiler", "operating system", "kernel", "low latency", "hft",
    "signal processing", "rf", "photonics", "asic", "vlsi", "soc",
]

# I allow the GitHub Actions workflow to pass SCRAPER_MODE=api or
# SCRAPER_MODE=browser so two parallel jobs can split the work without
# running each other's scrapers.
SCRAPER_MODE = os.environ.get("SCRAPER_MODE", "all")  # "api" | "browser" | "all"

# Hard wall-clock budget so the script exits cleanly before GitHub Actions kills the job. The repo is
# public, so Actions minutes are unlimited and the old 17-22 min cap (which got runs cancelled before
# they could finish and write their summary) is lifted. SCRAPER_BUDGET_MIN lets each workflow job tune
# it; the default 110 min sits a few minutes under the 120 min job timeout so the run still exits
# cleanly. A higher budget matters most for the browser/Trackr job, which carries the internships.
_BUDGET_SECONDS = int(os.environ.get("SCRAPER_BUDGET_MIN", "110")) * 60
_RUN_START = time.time()

def _over_budget() -> bool:
    return time.time() - _RUN_START > _BUDGET_SECONDS

# I accumulate one row per source so main() can write a summary table at the end.
_source_stats: list[dict] = []


def _record_stat(source: str, rows: int, note: str = "") -> None:
    # I append to the module-level list rather than returning so every scraper
    # function can call this without needing to thread a return value through.
    _source_stats.append({"source": source, "rows": rows, "note": note})


# ─── PER-CATEGORY STUDENT TERM SETS ────────────────────────────────────────
# I split student terms by category so the scraper can identify the correct
# application type for each role rather than lumping everything into one bag.

INTERNSHIP_TERMS = [
    "intern", "internship", "co-op", "coop", "student researcher",
    "undergraduate researcher", "research intern", "off-cycle intern",
    "summer 2026", "summer intern", "2026 intern", "technology intern",
    "software intern", "engineering intern", "data intern", "ai intern",
    "tech intern",
]

PLACEMENT_TERMS = [
    "placement", "year in industry", "industrial placement",
    "sandwich year", "12 month placement", "12-month placement",
    "year-long placement", "year long placement", "12 months placement",
    "placement year", "industrial year", "work placement",
]

SPRING_WEEK_TERMS = [
    "spring week", "spring insight", "insight week", "insight programme",
    "spring programme", "discovery programme", "explore programme",
    "spring intern", "first year", "penultimate", "women in tech",
    "diversity programme", "access programme",
]

GRADUATE_TERMS = [
    "graduate scheme", "graduate programme", "grad scheme",
    "new grad", "entry level", "early careers",
    "early talent", "technology graduate", "software graduate",
    "engineering graduate", "apprenticeship",
]

EVENT_TERMS = [
    "hackathon", "coding challenge", "coding competition",
    "open day", "careers fair", "workshop", "conference",
    "networking", "virtual event", "online event",
]

# Combined flat list for quick is_student_role checks
STUDENT_TERMS = (
    INTERNSHIP_TERMS + PLACEMENT_TERMS + SPRING_WEEK_TERMS + GRADUATE_TERMS
)

# UK and major European tech hubs - broad enough to catch all UK roles and
# nearby European offices that UK students commonly get placed to.
UK_EU_TERMS = [
    # UK national terms
    "uk", "united kingdom", "england", "scotland", "wales",
    "great britain", "britain", "gb", "u.k.",
    # London and Greater London boroughs
    "london", "canary wharf", "croydon", "ilford", "bromley", "harrow",
    "sutton", "kingston upon thames", "richmond", "wimbledon", "stratford",
    "greenwich", "hackney", "islington", "lambeth", "southwark", "wandsworth",
    "shoreditch", "hoxton", "bank", "city of london", "westminster",
    # Major UK cities
    "birmingham", "manchester", "edinburgh", "glasgow", "bristol",
    "cambridge", "oxford", "reading", "leeds", "sheffield",
    "liverpool", "nottingham", "coventry", "leicester", "southampton",
    "portsmouth", "exeter", "bath", "brighton", "norwich", "york",
    "cardiff", "belfast", "newcastle", "sunderland", "middlesbrough",
    "hull", "stoke", "wolverhampton", "derby", "worcester",
    "milton keynes", "luton", "slough", "guildford", "basingstoke",
    "watford", "hertford", "ipswich", "chelmsford", "stevenage",
    "guildford", "guildford", "woking", "farnborough", "eastleigh",
    "solihull", "walsall", "west bromwich", "dudley", "sandwell",
    "salford", "stockport", "oldham", "rochdale", "bolton", "trafford",
    # Remote / flexible
    "remote", "work from home", "hybrid", "flexible", "distributed",
    "anywhere in the uk", "home based", "home-based",
    # Republic of Ireland (many UK students work in Dublin)
    "ireland", "dublin",
    # Key European tech hubs
    "amsterdam", "berlin", "munich", "paris", "lisbon",
    "madrid", "barcelona", "stockholm", "zurich", "geneva",
    "brussels", "luxembourg",
    # Generic region terms
    "europe", "emea", "european", "worldwide", "global",
    "nationwide",
    # Asia-Pacific tech hubs - UK students commonly target these
    "singapore", "sydney", "melbourne", "australia",
    "hong kong",
]

# Explicitly US/non-EU locations - always rejected even for priority companies.
US_LOCATIONS = [
    "new york", "san francisco", "los angeles", "san jose",
    "seattle", "boston", "chicago", "austin", "denver", "atlanta",
    "miami", "dallas", "philadelphia", "portland", "minneapolis",
    "raleigh", "charlotte", "salt lake city", "phoenix", "las vegas",
    "california", "new jersey", "texas", "north carolina", "colorado",
    "washington, dc", "washington d.c.", "washington, d.c.",
    "united states", "usa", "u.s.a", "u.s.", "north america",
    # Canada (separate from UK/EU)
    "toronto", "vancouver", "montreal", "canada",
    # Asia-Pacific
    "tokyo", "bangalore", "hyderabad", "india", "china",
    # Exclude honolulu, hawaii specifically
    "honolulu", "hawaii",
    # I add these normalised remote-US strings because the scraper lowercases
    # location before matching and these variants were slipping through.
    "remote - us", "remote, us", "us remote", "remote us",
    # I add specific US cities missing from the original list.
    "palo alto", "menlo park", "mountain view", "sunnyvale", "cupertino",
    "redmond", "bellevue", "kirkland", "san diego", "irvine",
    "gurugram", "gurgaon",
]

# Known standalone UK city names used for location normalisation.
# When a posting says just "London" we store it as "London, UK".
UK_CITIES = {
    "london", "birmingham", "manchester", "edinburgh", "glasgow",
    "bristol", "cambridge", "oxford", "reading", "leeds", "sheffield",
    "liverpool", "nottingham", "coventry", "leicester", "southampton",
    "portsmouth", "exeter", "bath", "brighton", "norwich", "york",
    "cardiff", "belfast", "newcastle upon tyne", "newcastle",
    "milton keynes", "guildford", "basingstoke", "watford",
    "wolverhampton", "derby", "worcester", "ipswich",
}

# Internship cycle cutoff: Sep 2025 start of 2025/26 recruiting season.
CYCLE_CUTOFF = datetime(2025, 9, 1)
# Full-time job cutoff: Jan 2026 - only include recently posted roles.
JOB_CUTOFF = datetime(2026, 1, 1)


def is_date_relevant(closing_date_str: "str | None", cutoff: "datetime | None" = None) -> bool:
    """True if the role's closing date is within the expected cycle and not expired."""
    if not closing_date_str:
        return True  # no deadline = include (unknown)
    try:
        d = datetime.strptime(closing_date_str, "%Y-%m-%d")
        # I keep roles whose deadline passed within the last 14 days so a freshly
        # closed posting still shows (late applications are sometimes accepted)
        # rather than dropping it the instant the date ticks over.
        grace = datetime.now() - timedelta(days=14)
        effective_cutoff = cutoff if cutoff is not None else CYCLE_CUTOFF
        return d >= effective_cutoff and d >= grace
    except ValueError:
        return True


def normalize_location(location: str) -> str:
    """Append ', UK' to bare UK city names that lack a country suffix.

    Greenhouse/Lever often return just "London" or "Birmingham". I append
    ', UK' so the table clearly shows the country.
    """
    if not location:
        return location
    stripped = location.strip()
    lower = stripped.lower()
    # Already has a country or region indicator - leave as is
    if any(c in lower for c in [
        "uk", "united kingdom", "england", "scotland", "wales",
        "remote", "hybrid", "europe", "emea", "global", "worldwide",
        "ireland", "berlin", "amsterdam", "paris", "lisbon", "zurich",
    ]):
        return stripped
    # Known bare UK city - append ", UK"
    for city in UK_CITIES:
        if city in lower:
            return f"{stripped}, UK"
    return stripped


def is_location_ok(location: str, is_priority: bool) -> bool:
    """True if the location is UK/Europe or unknown.

    I accept all of UK (any city), Remote/Hybrid and major European tech
    hubs. I reject explicit US locations for all companies regardless of
    tier. For priority companies I also accept unknown/unrecognised foreign
    locations because they likely have UK offices not labelled in every post.
    """
    if not location:
        return True  # unknown = include
    loc = location.lower()
    # I also reject locations that end with ", us" because some postings
    # use that pattern instead of spelling out "United States".
    if loc.rstrip().endswith(", us"):
        return False
    # Explicit US/non-EU = always reject
    if any(us in loc for us in US_LOCATIONS):
        return False
    # UK / EU match = accept
    if any(uk in loc for uk in UK_EU_TERMS):
        return True
    # Priority company + unrecognised foreign location = accept
    return is_priority

# I apply a looser filter for priority companies because a Software Engineer
# role at Google is still worth knowing about even if "intern" is absent.
PRIORITY_COMPANIES = {
    "google", "amazon", "apple", "microsoft", "meta", "netflix", "nvidia",
    "arm", "rolls-royce", "rolls royce", "sky", "skyscanner", "spotify",
    "github", "playstation", "sony", "bbc", "bt", "deloitte", "pwc",
    "goldman sachs", "morgan stanley", "jpmorgan", "jp morgan", "bloomberg",
    "deepmind", "anthropic", "openai", "palantir", "cloudflare",
    "salesforce", "oracle", "sap", "ibm", "intel", "amd", "qualcomm",
    "siemens", "bosch", "jlr", "jaguar land rover", "aston martin",
    "dyson", "mclaren", "national grid", "nhs", "gchq", "hmrc",
    "civil service", "dstl", "qinetiq", "stripe", "figma", "notion",
    "jane street", "citadel", "two sigma", "jump trading", "optiver",
    "de shaw", "d. e. shaw", "susquehanna", "sig", "flow traders",
    "virtu", "imc trading", "imc", "akuna", "hudson river trading",
    "databricks", "snowflake", "hashicorp", "grafana", "mongodb",
    "elastic", "confluent", "datadog", "fastly", "akamai", "digitalocean",
    "canonical", "red hat", "jetbrains", "atlassian", "shopify",
    "block", "square", "brex", "revolut", "monzo", "wise", "starling",
    "checkout.com", "klarna", "adyen", "waymo", "cruise", "zoox",
    "aurora", "mobileye", "hugging face", "cohere", "mistral",
    "boeing", "airbus", "bae systems", "leonardo", "thales",
    "ericsson", "nokia", "mediatek", "broadcom", "bytedance", "tiktok",
    "samsara", "anduril", "coreweave", "scale ai", "perplexity",
    "cursor", "linear", "vercel", "g-research", "g research",
    "worldquant", "man group", "marshall wace", "winton",
    "barclays", "hsbc", "natwest", "lloyds", "standard chartered",
    "accenture", "capgemini", "thoughtworks",
    # Cloud & security companies I specifically want to track
    "crowdstrike", "palo alto networks", "paloaltonetworks", "zscaler",
    "okta", "auth0", "snyk", "wiz", "lacework", "orca security",
    "gitlab", "jfrog", "harness", "circleci", "buildkite",
    "new relic", "dynatrace", "sumologic", "sumo logic", "splunk",
    "sendgrid", "vonage", "bandwidth",
    "digitalocean", "linode", "vultr", "hetzner",
    "nginx", "kong", "istio", "envoy",
    # More quant/finance shops
    "jane street", "hudson river trading", "hrt", "xtw markets", "xtx",
    "tower research", "virtu", "drw", "squarepoint",
    "renaissance technologies", "two sigma", "d.e. shaw",
    # Hardware and deep tech
    "graphcore", "cerebras", "groq", "tenstorrent", "mythic",
    "riverlane", "quantinuum", "phasecraft", "pasqal",
    "oxford nanopore", "illumina", "10x genomics",
    "wayve", "five ai", "oxbotica", "oxa",
    # More UK tech companies
    "revolut", "checkout.com", "weaveworks", "thought machine",
    "onfido", "improbable", "babylon health", "benevolentai",
    "darktrace", "sophos", "micro focus", "aveva",
}

# I also check Greenhouse department names because some companies tag their
# student pipeline departments rather than including "intern" in every title.
STUDENT_DEPTS = {
    "early talent", "university", "intern", "internship", "student",
    "campus", "early career", "new grad", "university recruiting",
}


# ─── DEDUPLICATION ──────────────────────────────────────────────────────────

def dedupe_key(company: str, role: str, url: str = "") -> str:
    # I prefer URL-based deduplication so the same job posting scraped from
    # two different sources is never inserted twice. I strip trailing slashes
    # because the same URL can appear with and without one.
    if url and url.startswith("http"):
        # I normalise both Greenhouse URL domains to the old format so rows
        # inserted before the domain change (boards.greenhouse.io) and rows
        # inserted after (job-boards.greenhouse.io) hash to the same key and
        # never trigger a 23505 unique constraint violation.
        url = url.replace("job-boards.greenhouse.io", "boards.greenhouse.io")
        raw = url.strip().rstrip("/")
    else:
        # I fall back to company+role when there is no URL. I lower-case and
        # strip both fields so "Google" and "google" hash identically.
        raw = f"{company.lower().strip()}|{role.lower().strip()}"
    # I use a truncated MD5 (16 hex chars) as the key - collision probability
    # is negligible for a few thousand rows and fits in a set comfortably.
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def load_existing_keys() -> set:
    # I load all existing keys at the start of each run so every insert check
    # is an O(1) set lookup rather than a DB query per row. On a fresh DB this
    # returns an empty set and everything gets inserted.
    try:
        res = supabase.table("applications").select(
            "company,role,url"
        ).execute()
        existing_keys = {
            dedupe_key(r["company"], r["role"], r.get("url") or "")
            for r in (res.data or [])
        }
        # Remember which URLs already exist so insert_job updates them in place rather than skipping.
        _existing_urls.update(r["url"] for r in (res.data or []) if r.get("url"))
        if not existing_keys:
            # I warn here because an empty result on a populated DB usually
            # means RLS is blocking the SELECT - the upsert below will still
            # prevent duplicates at the DB level so this is non-fatal.
            print("WARNING: 0 existing rows loaded - RLS may be blocking reads. Continuing with upsert deduplication.")
        return existing_keys
    except Exception as e:
        # I log and continue rather than crashing - the upsert strategy means
        # no duplicates are created even if this pre-load fails.
        print(f"Warning: could not load existing keys: {e}")
        return set()


# ─── RELEVANCE ──────────────────────────────────────────────────────────────

def is_student_role(
    title: str, dept_names: list[str] | None = None
) -> bool:
    """Return True if this role is student/intern/placement facing.

    I use whole-word regex for intern-related terms to avoid false positives
    from words like "internal", "international" and "internally". If those
    words appear without a stronger signal (placement, spring week, etc.) the
    role is treated as full-time.
    """
    # I reject titles that begin with "Internal" because those describe
    # internal team-facing roles (e.g. "Internal Engineering"), not student
    # positions. This is separate from the intern-word exclusion below.
    if re.match(r'^internal\b', title.strip(), re.IGNORECASE):
        return False

    # I also reject "Internal <function>" anywhere in the title (e.g. "Lead
    # Engineer, Internal Engineering" or "PM - Internal AI"). These are always
    # full-time internal-team roles regardless of which company posted them.
    if _INTERNAL_FUNCTION_RE.search(title):
        return False

    # I check the title first because it is always present.
    t = title.lower()

    # Non-intern student terms (placement, graduate, spring, event) are safe
    # to match with a simple substring check - none share a root with common
    # English words that would produce false positives.
    NON_INTERN_TERMS = PLACEMENT_TERMS + SPRING_WEEK_TERMS + GRADUATE_TERMS + EVENT_TERMS
    if any(term in t for term in NON_INTERN_TERMS):
        return True

    # For intern-family terms I require a whole-word match AND no explicit
    # exclusion word ("internal", "international", "internally").
    has_intern_word = _INTERN_WHOLE_WORD_RE.search(t)
    has_exclude_word = _EXCLUDE_INTERN_RE.search(t)
    if has_intern_word and not has_exclude_word:
        return True

    # I fall back to department names as a secondary signal for companies that
    # route all graduate roles through a dedicated department without labelling
    # each title individually (e.g. Bloomberg "University Recruiting" dept).
    # I skip this fallback for clearly senior or non-student titles so that
    # priority companies like MongoDB with a university dept do not accidentally
    # pull Staff / Lead / Recruiter / Auditor roles into the student pipeline.
    if dept_names and not _SENIOR_ROLE_RE.search(title):
        d = " ".join(dept_names).lower()
        if any(term in d for term in STUDENT_DEPTS):
            return True
    return False


def is_relevant_job(
    title: str,
    company: str = "",
    location: str = "",
) -> bool:
    """True if this is a full-time tech role for the Jobs tab.

    Jobs use the same UK/Europe location filter as internships - no point
    showing a San Francisco full-time role to someone based in the UK.
    """
    if is_student_role(title, None):
        return False
    if not any(k in title.lower() for k in TECH_KEYWORDS):
        return False
    is_priority = any(p in company.lower() for p in PRIORITY_COMPANIES)
    return is_location_ok(location, is_priority)


def is_relevant(
    title: str,
    company: str,
    location: str = "",
    dept_names: list[str] | None = None,
) -> bool:
    """True if this internship/placement/graduate role should be saved.

    Requires student term + tech keyword + UK/Europe location. The location
    check accepts any UK city, Remote/Hybrid and major European tech hubs.
    For priority companies an empty or unknown location is also accepted
    because they often have UK offices not labelled in every posting.
    """
    if not is_student_role(title, dept_names):
        return False
    if not any(k in title.lower() for k in TECH_KEYWORDS):
        return False
    is_priority = any(p in company.lower() for p in PRIORITY_COMPANIES)
    return is_location_ok(location, is_priority)


def infer_type(title: str, default: str = "Internship") -> str:
    """Determine application type from the role title using per-category term sets.

    I check placement and spring week terms first because they are more
    specific than the general 'intern' / 'summer' terms. Graduate schemes
    and events are checked last.
    """
    t = title.lower()
    # Industrial Placement - 12-month / year in industry
    if any(term in t for term in PLACEMENT_TERMS):
        return "Industrial Placement"
    # Spring Week / Insight
    if any(term in t for term in SPRING_WEEK_TERMS):
        return "Spring Week"
    # Graduate Scheme
    if any(term in t for term in GRADUATE_TERMS):
        return "Graduate"
    # Events
    if any(term in t for term in EVENT_TERMS):
        return "Event"
    # General Internship - I use whole-word regex here so "international" and
    # "internationally" do not trigger a false intern classification.
    if _INTERN_WHOLE_WORD_RE.search(t) and not _EXCLUDE_INTERN_RE.search(t):
        return "Internship"
    # I check seniority terms before falling through to the default so that
    # senior roles without any student-term do not get classified as Internship.
    if _SENIOR_ROLE_RE.search(title):
        return "Full-time Job"
    return default


# ─── URL CHECKS AND LOCATION ENRICHMENT ─────────────────────────────────────

def detect_sponsors_visa(text: str) -> "bool | None":
    """Scan job description text for visa sponsorship signals.

    Returns True if the company explicitly sponsors, False if they state they
    cannot/do not, or None when the description is silent on the topic.
    """
    if not text:
        return None
    t = text.lower()
    no_signals = [
        "cannot sponsor", "unable to sponsor", "not able to sponsor",
        "do not offer visa", "no visa sponsorship", "sponsorship is not available",
        "cannot provide visa", "right to work in the uk",
        "right to work in the united kingdom",
        "you must have the right to work",
        "must have the right to work",
        "eligible to work in the uk",
        "eligible to work in the united kingdom",
        "must be eligible to work",
        "must have existing right",
        "will not sponsor", "won't sponsor", "won't be able to provide sponsorship",
        "does not provide sponsorship", "not currently able to sponsor",
        "cannot support a visa", "unable to provide visa",
    ]
    for s in no_signals:
        if s in t:
            return False
    yes_signals = [
        "visa sponsorship is available", "we sponsor visas",
        "visa sponsorship available", "we provide visa sponsorship",
        "tier 2 visa", "skilled worker visa sponsorship",
        "can sponsor your visa", "sponsorship is available",
        "we are able to sponsor",
    ]
    for s in yes_signals:
        if s in t:
            return True
    return None


def detect_cover_letter_required(text: str) -> "bool | None":
    """Return True if the description explicitly mentions a cover letter."""
    if not text:
        return None
    return True if "cover letter" in text.lower() else None


def is_url_alive(url: str) -> bool:
    """Return False only if the URL definitively 404s or 410s (gone for good).

    I use a HEAD request so no body is transferred - fast enough to run per
    job. On any network error I assume the URL is alive rather than silently
    dropping valid roles.
    """
    if not url or not url.startswith("http"):
        return True
    try:
        resp = requests.head(url, headers=HEADERS, timeout=8,
                             allow_redirects=True)
        # Some servers don't support HEAD and return 405 - fall back to GET.
        if resp.status_code == 405:
            resp = requests.get(url, headers=HEADERS, timeout=10,
                                allow_redirects=True, stream=True)
            resp.close()
        return resp.status_code not in (404, 410)
    except Exception:
        return True  # network issue - assume alive


def fetch_greenhouse_location(slug: str, job_id: int) -> str:
    """Call the Greenhouse job detail endpoint to get the office/city name.

    I only call this when the main listing API returned no location. The
    detail endpoint includes an 'offices' array with city-level names.
    """
    url = (
        f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs/{job_id}"
    )
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            offices = resp.json().get("offices") or []
            names = [
                o.get("name", "") for o in offices if o.get("name")
            ]
            if names:
                return ", ".join(names)
    except Exception:
        pass
    return ""


def _parse_greenhouse_date(dt_str: "str | None") -> "str | None":
    """Convert a Greenhouse ISO timestamp to a plain YYYY-MM-DD string."""
    if not dt_str:
        return None
    try:
        return dt_str[:10]  # "2026-01-15T08:12:57-04:00" → "2026-01-15"
    except Exception:
        return None


def _strip_html(html: str) -> str:
    """Remove HTML tags to get plain text for description scanning."""
    return re.sub(r"<[^>]+>", " ", html or "")


def fetch_lever_details(slug: str, posting_id: str) -> dict:
    """Call the Lever individual posting endpoint for extra fields.

    Lever's list API sometimes omits location at the top level. The single
    posting endpoint returns the same structure but can have additional
    fields populated - I extract location and any workplaceType hint.
    """
    url = f"https://api.lever.co/v0/postings/{slug}/{posting_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            loc = data.get("categories", {}).get("location", "")
            wt  = data.get("workplaceType", "")
            return {"location": loc, "work_mode": wt}
    except Exception:
        pass
    return {}


# ─── INSERT ─────────────────────────────────────────────────────────────────

# I collect URLs seen this run so I can batch-refresh last_scraped_at at the
# end without overwriting user-set status, notes or other fields.
_seen_urls: set[str] = set()
# URLs already in the DB at load time, so insert_job knows whether to insert a new row or refresh the
# scraper-owned fields of an existing one (upsert-by-URL, never delete, never clobber user edits).
_existing_urls: set[str] = set()
# I collect newly inserted student jobs for the end-of-run Discord alert.
_new_jobs: list[dict] = []

_FAANG = {"google", "meta", "amazon", "apple", "microsoft", "netflix", "deepmind", "openai", "anthropic"}
_QUANT_COMPANIES = {"citadel", "optiver", "jane street", "imc", "jump", "two sigma", "susquehanna", "hudson river", "de shaw", "akuna", "virtu", "sig ", "drw", "flow traders"}
_AI_RE = re.compile(r'\bai\b')

def detect_category(company: str, role: str) -> str:
    c = company.lower()
    r = role.lower()
    if any(f in c for f in _FAANG):
        return "FAANG+"
    if any(q in c for q in _QUANT_COMPANIES) or any(t in r for t in ("quant", "trading", "algorithmic", "derivatives", "fixed income")):
        return "Quant Developer"
    if (_AI_RE.search(r) or any(t in r for t in ("machine learning", "artificial intelligence", "deep learning", "llm", "generative ai", "nlp", "computer vision", "neural network"))):
        return "AI and Machine Learning"
    if any(t in r for t in ("data science", "data scientist", "data analyst", "data engineer", "analytics engineer", "business intelligence", "bi analyst")):
        return "Data Science"
    if any(t in r for t in ("embedded", "firmware", "fpga", "vhdl", "rtos", "bare metal", "hardware engineer", "electronics engineer", "circuit", "microcontroller", "iot engineer")):
        return "Embedded"
    if any(t in r for t in ("devops", "devsecops", "cloud engineer", "cloud developer", "site reliability", "sre", "platform engineer", "infrastructure engineer", "kubernetes", "terraform", "aws engineer", "azure engineer", "gcp ")):
        return "DevOps and Infrastructure"
    if any(t in r for t in ("security", "cyber", "penetration", "pen test", "soc analyst", "information security", "appsec", "threat")):
        return "Cyber Security"
    if any(t in r for t in ("consult", "advisory", "business analyst", "management information")):
        return "Tech Consulting"
    if any(t in r for t in ("it support", "service desk", "it technician", "helpdesk", "1st line", "2nd line")):
        return "IT"
    return "Software Engineering"


# Columns the scraper owns and may overwrite on an existing row. Everything else (status, notes,
# starred, applied_date) is user-owned and is NEVER touched on an update, so a re-scrape refreshes
# stale data - including the CV / cover letter / written-answers facts now read from The Trackr -
# without clobbering my dashboard edits.
SCRAPER_FIELDS = {
    "company", "role", "type", "location", "deadline", "opening_date",
    "salary_range", "work_mode", "source", "sponsors_visa", "category", "last_scraped_at",
    "last_year_opening", "housing_location", "cv_required", "cover_letter_required",
    "written_answers",
}


def _cover_letter_label(v):
    # Scrapers pass True/False/None (or occasionally a string); the dashboard stores the text labels
    # "Yes"/"No"/"Optional", so normalise to that rather than a Python bool that becomes "true".
    if v is True:
        return "Yes"
    if v is False:
        return "No"
    if isinstance(v, str) and v.strip():
        return v
    return None


def insert_job(job: dict, existing_keys: set) -> bool:
    # I use a different date cutoff for full-time jobs (Jan 2026) vs internships (Sep 2025)
    cutoff = JOB_CUTOFF if job.get("type") == "Full-time Job" else CYCLE_CUTOFF
    if not is_date_relevant(job.get("deadline"), cutoff):
        return False

    # I skip dead links before touching the DB, but only for genuinely new URLs.
    # Re-HEAD-checking the thousands of already-stored URLs every run was the main
    # thing eating the time budget, and a known URL is never deleted even if it
    # 404s now, so that check was wasted work.
    url = job.get("url", "")
    if url and url not in _existing_urls and not is_url_alive(url):
        return False

    key = dedupe_key(job["company"], job["role"], job.get("url", ""))

    record = {
        "company":  job["company"],
        "role":     job["role"],
        "type":     job.get("type", "internship"),
        # I use "scraped" so I can filter auto-discovered roles from ones I
        # manually added in the dashboard.
        "status":       "scraped",
        "url":          url or None,
        "location":     normalize_location(job.get("location", "")),
        "notes":        job.get("notes", ""),
        # I leave applied_date as None because scraped roles have not been
        # applied to yet - they sit in "scraped" status until I pursue them.
        "applied_date": None,
        "deadline":     job.get("deadline"),
        "opening_date": job.get("opening_date"),
        "last_year_opening": job.get("last_year_opening"),
        "housing_location":  normalize_location(job.get("housing_location", "")) or None,
        "salary_range": job.get("salary_range", ""),
        "work_mode":    job.get("work_mode", ""),
        "source":       job.get("source", ""),
        # I default starred to False; I manually star interesting roles later.
        "starred":      False,
        "last_scraped_at": datetime.now(timezone.utc).isoformat(),
        "sponsors_visa": job.get("sponsors_visa", None),
        "category":     detect_category(job["company"], job["role"]),
        # The dashboard stores these as the text labels "Yes"/"No"/"Optional", so I write matching
        # strings rather than a Python bool that PostgREST would coerce to "true".
        "cv_required":            job.get("cv_required") or "Yes",
        "cover_letter_required":  _cover_letter_label(job.get("cover_letter_required")),
        "written_answers":        job.get("written_answers"),
    }
    # Only the scraper-owned columns are written to an existing row.
    patch = {k: v for k, v in record.items() if k in SCRAPER_FIELDS}

    # Known URL -> refresh the scraper-owned fields in place. I never delete and never duplicate, and
    # status/notes/starred/applied_date stay exactly as I left them in the dashboard.
    if url and url in _existing_urls:
        try:
            supabase.table("applications").update(patch).eq("url", url).execute()
        except Exception as e:
            print(f"  ~ update failed {job['company']}: {e}")
        _seen_urls.add(url)
        return False

    # URL-less duplicate already seen this run (no DB unique constraint protects these).
    if key in existing_keys:
        if url:
            _seen_urls.add(url)
        return False

    try:
        # A genuinely new row. Plain insert (not upsert-ignore) so a pre-load miss does not silently
        # drop the refresh - the 23505 path below turns a surprise URL conflict into a field update.
        supabase.table("applications").insert(record).execute()
        existing_keys.add(key)
        if url:
            _existing_urls.add(url)
            _seen_urls.add(url)
        if record.get("type") != "Full-time Job":
            _new_jobs.append(job)
        print(f"  + {job['company']} | {job['role']} {url}")
        return True
    except Exception as e:
        # 23505 = the URL already exists but the pre-load missed it (e.g. an RLS hiccup). Refresh the
        # scraper fields instead of dropping the row on the floor.
        if url and "23505" in str(e):
            try:
                supabase.table("applications").update(patch).eq("url", url).execute()
            except Exception:
                pass
            _existing_urls.add(url)
            _seen_urls.add(url)
            return False
        print(f"  ! Failed to insert {job['company']}: {e}")
        return False


# ─── THE TRACKR (Playwright - JS rendered) ──────────────────────────────────

def _parse_trackr_date(s: "str | None") -> "str | None":
    """Parse a Trackr date cell ('21 May 26', '21 May 2026', '21/05/2026') to
    YYYY-MM-DD, or None for blanks and rolling/TBC placeholders."""
    if not s:
        return None
    s = s.strip()
    if not s or s.lower() in ("-", "tbc", "tbd", "n/a", "na", "rolling", "asap", "open"):
        return None
    for fmt in ("%d %b %y", "%d %b %Y", "%d/%m/%Y", "%d/%m/%y", "%d %B %Y", "%d %B %y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def _trackr_col(cells, colmap: "dict[str, int]", key: str) -> str:
    """Return the trimmed text of the mapped column for this row, or ''."""
    idx = colmap.get(key)
    if idx is None or idx >= len(cells):
        return ""
    return (cells[idx].inner_text() or "").strip()


def scrape_trackr_all(existing_keys: set) -> int:
    """Scrape all four Trackr categories using a headless browser.

    I use Playwright rather than requests here because The Trackr is a React
    SPA - the job table is injected into the DOM by JavaScript after the
    initial page load, so a plain HTTP GET returns an empty shell.
    """
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

    # I map each URL slug to the type label I want to store in the DB.
    categories = [
        ("summer-internships",    "Internship"),
        ("industrial-placements", "Industrial Placement"),
        ("graduate-schemes",      "Graduate"),
        ("spring-weeks",          "Spring Week"),
    ]

    total = 0
    print("\nScraping The Trackr (headless)...")

    with sync_playwright() as p:
        # I use a single browser instance across all four pages to share
        # startup overhead.
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
            ],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            locale="en-GB",
            viewport={"width": 1920, "height": 1080},
            extra_http_headers={"Accept-Language": "en-GB,en;q=0.9"},
        )
        # Hide navigator.webdriver so bot-detection scripts see a real browser.
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )

        for slug, job_type in categories:
            url = f"https://app.the-trackr.com/uk-technology/{slug}"
            print(f"  -> {url}")
            # I open a fresh page per category rather than navigating in-place
            # to avoid leftover React state polluting the next render.
            page = context.new_page()
            count = 0

            try:
                # I wait for "networkidle" so the React data-fetching hooks
                # have had time to run and the table is populated.
                page.goto(url, wait_until="networkidle", timeout=30000)

                # I use a secondary wait for table rows because networkidle
                # can fire before the final render cycle if the data fetch
                # completes just after the last network request.
                try:
                    page.wait_for_selector(
                        "table tbody tr, [role='row']",
                        timeout=15000,
                    )
                except PWTimeout:
                    print(f"     Timed out waiting for rows on {slug}")
                    page.close()
                    continue

                rows = page.query_selector_all(
                    "table tbody tr, [role='row']"
                )
                print(f"     Found {len(rows)} rows")

                # I map the column headers to indices once per page so each
                # field is read from the correct column. Header wording varies,
                # so I match on keywords; unmatched fields fall back to the date
                # scan further down.
                colmap: "dict[str, int]" = {}
                for _i, _h in enumerate(page.query_selector_all(
                    "table thead th, table thead td, [role='columnheader']"
                )):
                    _label = (_h.inner_text() or "").strip().lower()
                    if "location" in _label:
                        colmap.setdefault("location", _i)
                    elif "last year" in _label or "last-year" in _label:
                        colmap.setdefault("last_year", _i)
                    elif "open" in _label:
                        colmap.setdefault("opening", _i)
                    elif "clos" in _label or "deadline" in _label:
                        colmap.setdefault("closing", _i)
                    elif _label == "cv":
                        colmap.setdefault("cv", _i)
                    elif "cover" in _label:
                        colmap.setdefault("cover", _i)
                    elif "written" in _label:
                        colmap.setdefault("written", _i)
                    elif "sponsor" in _label:
                        colmap.setdefault("sponsors", _i)

                for row in rows:
                    cells = row.query_selector_all("td, [role='cell']")
                    # I skip rows with fewer than 2 cells because they are
                    # likely header or spacer rows.
                    if len(cells) < 2:
                        continue

                    # I prefer a link with "company" in its href because it
                    # reliably points to the company page rather than a
                    # programme detail page.
                    company_el = (
                        row.query_selector("a[href*='company']")
                        or row.query_selector(
                            "a[href*='/uk-technology/']"
                        )
                        # I fall back to the first cell as a last resort.
                        or (cells[0] if cells else None)
                    )
                    # I use the second link as the programme link because the
                    # first is always the company.
                    all_links = row.query_selector_all("a")
                    prog_el = (
                        all_links[1]
                        if len(all_links) > 1
                        else (cells[1] if len(cells) > 1 else None)
                    )

                    company = (
                        company_el.inner_text().strip()
                        if company_el else ""
                    )
                    programme = (
                        prog_el.inner_text().strip()
                        if prog_el else ""
                    )
                    # I capture the application link, preferring an external
                    # "apply" link over a the-trackr.com internal page so the
                    # dashboard opens the real posting.
                    job_url = ""
                    for _a in all_links:
                        _href = _a.get_attribute("href") or ""
                        if _href.startswith("http") and "the-trackr.com" not in _href:
                            job_url = _href
                            break
                    if not job_url and prog_el:
                        job_url = prog_el.get_attribute("href") or ""
                    # I prepend the origin when the href is relative so the
                    # stored URL is always absolute.
                    if job_url and not job_url.startswith("http"):
                        job_url = (
                            f"https://app.the-trackr.com{job_url}"
                        )

                    # I read the date and location columns by name. Where a
                    # header was not matched I fall back to scanning the
                    # trailing cells for the first two parseable dates (opening
                    # then closing), preserving the old behaviour.
                    opening_date = _parse_trackr_date(
                        _trackr_col(cells, colmap, "opening")
                    )
                    closing_date = _parse_trackr_date(
                        _trackr_col(cells, colmap, "closing")
                    )
                    last_year_opening = _parse_trackr_date(
                        _trackr_col(cells, colmap, "last_year")
                    )
                    if opening_date is None and closing_date is None:
                        _seen_dates = []
                        for cell in cells[2:]:
                            _d = _parse_trackr_date(
                                (cell.inner_text() or "").strip()
                            )
                            if _d:
                                _seen_dates.append(_d)
                            if len(_seen_dates) == 2:
                                break
                        if _seen_dates:
                            opening_date = _seen_dates[0]
                            if len(_seen_dates) > 1:
                                closing_date = _seen_dates[1]
                    location = _trackr_col(cells, colmap, "location")
                    # The Trackr lists the real per-role CV / cover letter /
                    # written-answers / visa-sponsorship values, so I read them
                    # rather than hardcoding "Yes" for every row.
                    cv_req = _trackr_col(cells, colmap, "cv")
                    cover_req = _trackr_col(cells, colmap, "cover")
                    written = _trackr_col(cells, colmap, "written")
                    sponsors = _trackr_col(cells, colmap, "sponsors")

                    # I silently skip rows where company or programme could
                    # not be parsed.
                    if not company or not programme:
                        continue
                    # I bypass the student-term check for placement and
                    # spring-week categories because the category URL already
                    # tells me the role type - requiring "placement" in every
                    # title would drop most real results.
                    if job_type == "Internship":
                        if not is_relevant(programme, company):
                            continue
                    else:
                        # I still require a tech keyword for non-internship
                        # categories so non-tech roles are skipped.
                        if not any(
                            k in programme.lower() for k in TECH_KEYWORDS
                        ):
                            continue
                        # I also reject senior titles even from placement and
                        # grad-scheme categories - The Trackr occasionally
                        # lists staff or lead roles under these buckets.
                        if _SENIOR_ROLE_RE.search(programme):
                            continue

                    if insert_job({
                        "company":           company,
                        "role":              programme,
                        "type":              job_type,
                        "url":               job_url or "",
                        "source":            "The Trackr",
                        "deadline":          closing_date,
                        "opening_date":      opening_date,
                        "location":          location,
                        "last_year_opening": last_year_opening,
                        # I reuse the job's city for the housing search link so
                        # the dashboard's "Find Housing" column is populated.
                        "housing_location":  location,
                        "cv_required":            cv_req or None,
                        "cover_letter_required":  cover_req or None,
                        "written_answers":        written or None,
                        "sponsors_visa":          sponsors or None,
                    }, existing_keys):
                        count += 1

            except Exception as e:
                print(f"     Error on {slug}: {e}")
            finally:
                # I always close the page in the finally block so the browser
                # does not accumulate open tabs on error.
                page.close()

            print(f"     Added {count} from {slug}")
            total += count
            # I sleep 2 seconds between categories to avoid rate limiting.
            time.sleep(2)

        browser.close()

    return total


# ─── COMPANY CAREER SITES (Playwright - proprietary ATSes) ──────────────────
# Google, Meta, ARM, Goldman Sachs and JPMorgan do not expose a public REST API.
# ARM and JPMorgan use Workday but require session cookies the CXS API rejects.
# I open one shared browser for all five companies to reduce startup overhead.

def scrape_company_sites_playwright(existing_keys: set) -> int:
    """Scrape Google, Meta, ARM, Goldman Sachs and JPMorgan via headless browser.

    Each company gets its own page inside a single Chromium session. I use
    broad selector fallbacks (h2|h3|a, etc.) because these React SPAs update
    their class names on every build. URL dedup at the DB level means running
    more than once is always safe.
    """
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

    total = 0
    print("\nScraping company career sites (headless)...")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
            ],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            locale="en-GB",
            viewport={"width": 1920, "height": 1080},
            extra_http_headers={"Accept-Language": "en-GB,en;q=0.9"},
        )
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )

        # ── Google Careers ──────────────────────────────────────────────────
        page = context.new_page()
        count = 0
        try:
            print("  -> Google Careers")
            page.goto(
                "https://careers.google.com/jobs/results/"
                "?q=intern&location=United+Kingdom&employment_type=INTERN",
                wait_until="networkidle",
                timeout=30000,
            )
            try:
                page.wait_for_selector(
                    "[data-job-id], li[jsname], .lLd3Je",
                    timeout=15000,
                )
            except PWTimeout:
                print("     Google: timed out waiting for job cards")
                page.close()
                page = context.new_page()
                raise RuntimeError("timeout")

            while True:
                cards = page.query_selector_all(
                    "[data-job-id], li[jsname]"
                )
                for card in cards:
                    title_el = (card.query_selector("h3")
                                or card.query_selector("[jsname='N8A5Hb']"))
                    if not title_el:
                        continue
                    title = title_el.inner_text().strip()

                    loc_el = (card.query_selector(".KF4T6b")
                              or card.query_selector("[jsname='MkUkrc']")
                              or card.query_selector(".lLd3Je span"))
                    location = loc_el.inner_text().strip() if loc_el else "United Kingdom"

                    link_el = card.query_selector("a[href]")
                    href = link_el.get_attribute("href") if link_el else ""
                    url = (f"https://careers.google.com{href}"
                           if href and href.startswith("/") else href or "")

                    if not is_relevant(title, "Google", location):
                        continue
                    key = dedupe_key("Google", title, url)
                    if key in existing_keys:
                        continue
                    insert_job({
                        "company": "Google",
                        "role": title,
                        "location": normalize_location(location),
                        "url": url,
                        "type": infer_type(title),
                        "cv_required": True,
                    }, existing_keys)
                    existing_keys.add(key)
                    count += 1

                next_btn = (page.query_selector("a[aria-label='Next page']")
                            or page.query_selector("[jsaction*='nextPage']"))
                if not next_btn:
                    break
                next_btn.click()
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                except PWTimeout:
                    break

        except Exception as exc:
            print(f"     Google error: {exc}")
        finally:
            page.close()

        if count:
            print(f"     Google: {count} new")
        total += count
        _record_stat("Google Careers", count)

        # ── Meta Careers ────────────────────────────────────────────────────
        page = context.new_page()
        count = 0
        try:
            print("  -> Meta Careers")
            page.goto(
                "https://www.metacareers.com/jobs"
                "?offices%5B0%5D=London%2C%20England&q=intern",
                wait_until="networkidle",
                timeout=30000,
            )
            try:
                page.wait_for_selector(
                    "a[data-testid='job-list-item-link'],"
                    " ._9ata, [class*='jobCard'], article",
                    timeout=15000,
                )
            except PWTimeout:
                print("     Meta: timed out")
                page.close()
                page = context.new_page()
                raise RuntimeError("timeout")

            cards = page.query_selector_all(
                "a[data-testid='job-list-item-link'], ._9ata,"
                " [class*='jobCard'], [class*='job-item']"
            )
            for card in cards:
                title_el = (card.query_selector(
                    "[data-testid='job-title'], h2, h3"
                ) or card.query_selector("span.x193iq5w"))
                if not title_el:
                    continue
                title = title_el.inner_text().strip()

                loc_el = card.query_selector(
                    "[data-testid='job-location'], [class*='location']"
                )
                location = loc_el.inner_text().strip() if loc_el else "London, UK"

                href = card.get_attribute("href") or ""
                url = (f"https://www.metacareers.com{href}"
                       if href and not href.startswith("http") else href)

                if not is_relevant(title, "Meta", location):
                    continue
                key = dedupe_key("Meta", title, url)
                if key in existing_keys:
                    continue
                insert_job({
                    "company": "Meta",
                    "role": title,
                    "location": normalize_location(location),
                    "url": url,
                    "type": infer_type(title),
                    "cv_required": True,
                }, existing_keys)
                existing_keys.add(key)
                count += 1

        except Exception as exc:
            print(f"     Meta error: {exc}")
        finally:
            page.close()

        if count:
            print(f"     Meta: {count} new")
        total += count
        _record_stat("Meta Careers", count)

        # ── ARM Careers ─────────────────────────────────────────────────────
        # ARM uses Workday (arm.wd1.myworkdayjobs.com) but the CXS REST API
        # returns 422 - session auth is required. Playwright renders the page.
        page = context.new_page()
        count = 0
        try:
            print("  -> ARM Careers")
            page.goto(
                "https://careers.arm.com/search"
                "#q=intern&t=Jobs&numberOfResults=25"
                "&f:@sfdclocations=[United%20Kingdom]",
                wait_until="networkidle",
                timeout=30000,
            )
            try:
                page.wait_for_selector(
                    "a[href*='arm.wd1'], .CoveoResult a,"
                    " [class*='JobItem'], a[class*='result']",
                    timeout=15000,
                )
            except PWTimeout:
                print("     ARM: timed out")
                page.close()
                page = context.new_page()
                raise RuntimeError("timeout")

            links = page.query_selector_all(
                "a[href*='arm.wd1'], .CoveoResultLink, [class*='result-link']"
            )
            for link in links:
                title = link.inner_text().strip()
                if not title:
                    continue
                href = link.get_attribute("href") or ""
                url = (href if href.startswith("http")
                       else f"https://careers.arm.com{href}")

                parent = link.evaluate_handle(
                    "el => el.closest('li, .CoveoResult, [class*=Result]')"
                )
                if parent.as_element():
                    loc_el = parent.as_element().query_selector(
                        "[class*='location'], [field='@sfdclocations']"
                    )
                    location = (loc_el.inner_text().strip()
                                if loc_el else "United Kingdom")
                else:
                    location = "United Kingdom"

                if not is_relevant(title, "ARM", location):
                    continue
                key = dedupe_key("ARM", title, url)
                if key in existing_keys:
                    continue
                insert_job({
                    "company": "ARM",
                    "role": title,
                    "location": normalize_location(location),
                    "url": url,
                    "type": infer_type(title),
                    "cv_required": True,
                }, existing_keys)
                existing_keys.add(key)
                count += 1

        except Exception as exc:
            print(f"     ARM error: {exc}")
        finally:
            page.close()

        if count:
            print(f"     ARM: {count} new")
        total += count
        _record_stat("ARM Careers", count)

        # ── Goldman Sachs ───────────────────────────────────────────────────
        page = context.new_page()
        count = 0
        try:
            print("  -> Goldman Sachs Careers")
            page.goto(
                "https://higher.gs.com/roles?region=EMEA&term=intern",
                wait_until="networkidle",
                timeout=30000,
            )
            try:
                page.wait_for_selector(
                    "[class*='RoleCard'], [class*='role-card'],"
                    " article, li[class*='card']",
                    timeout=15000,
                )
            except PWTimeout:
                print("     Goldman: timed out")
                page.close()
                page = context.new_page()
                raise RuntimeError("timeout")

            cards = page.query_selector_all(
                "[class*='RoleCard'], [class*='role-card'],"
                " article, li[class*='card']"
            )
            for card in cards:
                title_el = card.query_selector("h2, h3, [class*='title']")
                if not title_el:
                    continue
                title = title_el.inner_text().strip()

                loc_el = card.query_selector("[class*='location']")
                location = loc_el.inner_text().strip() if loc_el else ""

                link_el = card.query_selector("a[href]")
                href = link_el.get_attribute("href") if link_el else ""
                url = (f"https://higher.gs.com{href}"
                       if href and href.startswith("/") else href or "")

                if not is_relevant(title, "Goldman Sachs", location):
                    continue
                key = dedupe_key("Goldman Sachs", title, url)
                if key in existing_keys:
                    continue
                insert_job({
                    "company": "Goldman Sachs",
                    "role": title,
                    "location": normalize_location(location),
                    "url": url,
                    "type": infer_type(title),
                    "cv_required": True,
                }, existing_keys)
                existing_keys.add(key)
                count += 1

        except Exception as exc:
            print(f"     Goldman error: {exc}")
        finally:
            page.close()

        if count:
            print(f"     Goldman Sachs: {count} new")
        total += count
        _record_stat("Goldman Sachs", count)

        # ── JPMorgan Careers ────────────────────────────────────────────────
        page = context.new_page()
        count = 0
        try:
            print("  -> JPMorgan Careers")
            page.goto(
                "https://careers.jpmorgan.com/search"
                "?keyword=intern&location=United+Kingdom",
                wait_until="networkidle",
                timeout=30000,
            )
            try:
                page.wait_for_selector(
                    "[data-testid='job-row'], .job-row,"
                    " [class*='JobSearchCard'], article",
                    timeout=15000,
                )
            except PWTimeout:
                print("     JPMorgan: timed out")
                page.close()
                page = context.new_page()
                raise RuntimeError("timeout")

            cards = page.query_selector_all(
                "[data-testid='job-row'], .job-row,"
                " [class*='JobSearchCard'], [class*='job-card']"
            )
            for card in cards:
                title_el = card.query_selector(
                    "a, h2, h3, [class*='title'], [data-testid='job-title']"
                )
                if not title_el:
                    continue
                title = title_el.inner_text().strip()

                loc_el = card.query_selector(
                    "[class*='location'], [data-testid='location']"
                )
                location = loc_el.inner_text().strip() if loc_el else ""

                link_el = card.query_selector("a[href]")
                href = link_el.get_attribute("href") if link_el else ""
                url = (f"https://careers.jpmorgan.com{href}"
                       if href and href.startswith("/") else href or "")

                if not is_relevant(title, "JPMorgan", location):
                    continue
                key = dedupe_key("JPMorgan", title, url)
                if key in existing_keys:
                    continue
                insert_job({
                    "company": "JPMorgan",
                    "role": title,
                    "location": normalize_location(location),
                    "url": url,
                    "type": infer_type(title),
                    "cv_required": True,
                }, existing_keys)
                existing_keys.add(key)
                count += 1

        except Exception as exc:
            print(f"     JPMorgan error: {exc}")
        finally:
            page.close()

        if count:
            print(f"     JPMorgan: {count} new")
        total += count
        _record_stat("JPMorgan Careers", count)

        browser.close()

    print(f"  Company sites total: {total} new")
    return total


# ─── GREENHOUSE JSON API ────────────────────────────────────────────────────

def scrape_greenhouse(
    slug: str, company_name: str, existing_keys: set
) -> int:
    # I use the public Greenhouse boards API which requires no authentication.
    # The ?content=true flag exposes the metadata array I need for location.
    url = (
        f"https://boards-api.greenhouse.io/v1/boards/{slug}"
        f"/jobs?content=true"
    )
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(
                f"  Greenhouse {company_name}: HTTP {resp.status_code}"
            )
            return 0

        for job in resp.json().get("jobs", []):
            title = job.get("title", "")
            job_url = job.get("absolute_url", "")

            # I read the metadata array first because Greenhouse's top-level
            # location field often shows "Multiple Locations" which is useless
            # for UK filtering.
            location = ""
            for meta in job.get("metadata") or []:
                if meta and meta.get("name") == "Job Posting Location":
                    # I check isinstance because the value field can be a list
                    # (e.g. ["London, UK", "Remote"]) for multi-location postings.
                    # Calling .lower() on a list crashes with AttributeError.
                    val = meta.get("value")
                    location = (
                        ", ".join(str(v) for v in val if v)
                        if isinstance(val, list)
                        else (val or "")
                    )
                    break
            # I fall back to the top-level location when metadata lacks a city.
            if not location:
                location = (
                    job.get("location") or {}
                ).get("name", "")
            # I call the detail endpoint when location is still empty because
            # the detail response includes an 'offices' array with city names
            # that the listing endpoint sometimes omits.
            if not location and job.get("id"):
                location = fetch_greenhouse_location(slug, job["id"])
                if location:
                    time.sleep(0.2)

            # I extract department names so is_student_role can check them
            # alongside the title. Some companies like Bloomberg tag their
            # graduate pipeline as a department.
            dept_names = [
                d.get("name", "")
                for d in (job.get("departments") or [])
            ]

            # I extract dates and description from the listing response
            # (content=true already includes these - no extra API call needed).
            description_text = _strip_html(job.get("content", ""))
            opening_date = _parse_greenhouse_date(job.get("first_published"))
            deadline = _parse_greenhouse_date(job.get("application_deadline"))

            if is_relevant(title, company_name, location, dept_names):
                if insert_job({
                    "company":              company_name,
                    "role":                 title,
                    "type":                 infer_type(title),
                    "url":                  job_url,
                    "location":             location,
                    "source":               "Greenhouse",
                    "opening_date":         opening_date,
                    "deadline":             deadline,
                    "sponsors_visa":        detect_sponsors_visa(description_text),
                    "cover_letter_required": detect_cover_letter_required(description_text),
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title, company_name, location):
                if insert_job({
                    "company":              company_name,
                    "role":                 title,
                    "type":                 "Full-time Job",
                    "url":                  job_url,
                    "location":             location,
                    "source":               "Greenhouse",
                    "opening_date":         opening_date,
                    "deadline":             deadline,
                    "sponsors_visa":        detect_sponsors_visa(description_text),
                    "cover_letter_required": detect_cover_letter_required(description_text),
                }, existing_keys):
                    count += 1

        # I sleep 0.5 seconds between companies to be a polite scraper.
        time.sleep(0.5)
    except Exception as e:
        print(f"  Error Greenhouse {company_name}: {e}")
    return count


# ─── LEVER JSON API ─────────────────────────────────────────────────────────

def scrape_lever(
    slug: str, company_name: str, existing_keys: set
) -> int:
    # I use Lever's v0 public postings endpoint which returns all jobs as a
    # flat JSON array. mode=json returns structured data not an HTML page.
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  Lever {company_name}: HTTP {resp.status_code}")
            return 0

        for job in resp.json():
            # I use "text" because Lever calls it that rather than "title".
            title = job.get("text", "")
            location = job.get("categories", {}).get("location", "")
            work_mode = job.get("workplaceType", "")
            # I prefer hostedUrl over applyUrl because it shows the full JD.
            job_url = job.get("hostedUrl", "")
            posting_id = job.get("id", "")
            # I call the detail endpoint when location is empty because
            # Lever's listing API sometimes omits the location field.
            if not location and posting_id:
                extra = fetch_lever_details(slug, posting_id)
                location = extra.get("location", "")
                work_mode = work_mode or extra.get("work_mode", "")
                if location:
                    time.sleep(0.2)

            if is_relevant(title, company_name, location):
                if insert_job({
                    "company":   company_name,
                    "role":      title,
                    "type":      infer_type(title),
                    "url":       job_url,
                    "location":  location,
                    "work_mode": work_mode,
                    "source":    "Lever",
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title, company_name, location):
                if insert_job({
                    "company":   company_name,
                    "role":      title,
                    "type":      "Full-time Job",
                    "url":       job_url,
                    "location":  location,
                    "work_mode": work_mode,
                    "source":    "Lever",
                }, existing_keys):
                    count += 1

        time.sleep(0.5)
    except Exception as e:
        print(f"  Error Lever {company_name}: {e}")
    return count


# ─── ASHBY (REST posting API) ────────────────────────────────────────────────

def scrape_ashby(
    slug: str, company_name: str, existing_keys: set
) -> int:
    # I use Ashby's official posting REST API which replaced the __NEXT_DATA__
    # static embed. No API key is required - the endpoint is public.
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
    count = 0
    try:
        # I request the JSON endpoint directly rather than scraping the HTML.
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  Ashby {company_name}: HTTP {resp.status_code}")
            return 0
        # I iterate the top-level jobs array; the schema is consistent across
        # all employers on this endpoint.
        for job in resp.json().get("jobs", []):
            # I prefer jobUrl but fall back to applyUrl when it is absent.
            title = job.get("title", "")
            location = job.get("location", "")
            job_url = job.get("jobUrl") or job.get("applyUrl", "")
            # Ashby returns the full plain-text description and publish date
            # in the listing response - no extra API call needed.
            description_text = job.get("descriptionPlain", "")
            opening_date = (job.get("publishedAt") or "")[:10] or None
            if is_relevant(title, company_name, location):
                if insert_job({
                    "company":               company_name,
                    "role":                  title,
                    "type":                  infer_type(title),
                    "url":                   job_url,
                    "location":              location,
                    "source":                "Ashby",
                    "opening_date":          opening_date,
                    "sponsors_visa":         detect_sponsors_visa(description_text),
                    "cover_letter_required": detect_cover_letter_required(description_text),
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title, company_name, location):
                if insert_job({
                    "company":               company_name,
                    "role":                  title,
                    "type":                  "Full-time Job",
                    "url":                   job_url,
                    "location":              location,
                    "source":                "Ashby",
                    "opening_date":          opening_date,
                    "sponsors_visa":         detect_sponsors_visa(description_text),
                    "cover_letter_required": detect_cover_letter_required(description_text),
                }, existing_keys):
                    count += 1
        # I sleep 0.6 s between slugs to stay well under Ashby's rate limit.
        time.sleep(0.6)
    except Exception as e:
        print(f"  Error Ashby {company_name}: {e}")
    return count


# ─── SMARTRECRUITERS ─────────────────────────────────────────────────────────

def scrape_smartrecruiters(
    company_id: str, company_name: str, existing_keys: set
) -> int:
    """SmartRecruiters public API - used by KPMG, Vodafone and others.

    I use the v1 postings endpoint with limit=100 because SmartRecruiters
    defaults to a smaller page size and many large employers have hundreds
    of open roles.
    """
    url = (
        f"https://api.smartrecruiters.com/v1/companies"
        f"/{company_id}/postings?limit=100"
    )
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(
                f"  SmartRecruiters {company_name}: "
                f"HTTP {resp.status_code}"
            )
            return 0

        for job in resp.json().get("content", []):
            title = job.get("name", "")
            # I try city first then country as a fallback because many UK
            # employers set city not country.
            location = (
                job.get("location", {}).get("city", "")
                or job.get("location", {}).get("country", "")
            )
            # I construct the URL from company_id and job_id because
            # SmartRecruiters does not always include a direct link in
            # the API response.
            job_url = (
                f"https://jobs.smartrecruiters.com"
                f"/{company_id}/{job.get('id', '')}"
            )

            if not is_relevant(title, company_name, location):
                continue

            if insert_job({
                "company":  company_name,
                "role":     title,
                "type":     infer_type(title),
                "url":      job_url,
                "location": location,
                "source":   "SmartRecruiters",
            }, existing_keys):
                count += 1

        time.sleep(0.5)
    except Exception as e:
        print(f"  Error SmartRecruiters {company_name}: {e}")
    return count


# ─── COMPANY LISTS ──────────────────────────────────────────────────────────

# I group companies by ATS vendor so it is easy to add new ones in the right
# section. Each tuple is (ats_slug, display_name).

# (greenhouse_slug, display_name)
# I keep only slugs confirmed to return HTTP 200 in recent runs.
# Companies that migrated away from Greenhouse return 404 for every request
# and are not guessed - wrong slugs never match their new ATS.
GREENHOUSE_COMPANIES = [
    # API companies
    ("cloudflare",    "Cloudflare"),
    ("stripe",        "Stripe"),
    ("figma",         "Figma"),
    ("anthropic",     "Anthropic"),
    ("databricks",    "Databricks"),
    ("coinbase",      "Coinbase"),
    ("samsara",       "Samsara"),
    ("coreweave",     "CoreWeave"),
    ("imc",           "IMC Trading"),
    ("janestreet",    "Jane Street"),
    ("datadog",       "Datadog"),
    ("gitlab",        "GitLab"),
    ("twilio",        "Twilio"),
    ("pagerduty",     "PagerDuty"),
    ("adyen",         "Adyen"),
    ("dropbox",       "Dropbox"),
    ("fastly",        "Fastly"),
    ("asana",         "Asana"),
    ("intercom",      "Intercom"),
    ("amplitude",     "Amplitude"),
    ("mixpanel",      "Mixpanel"),
    ("postman",       "Postman"),
    ("robinhood",     "Robinhood"),
    ("starburst",     "Starburst"),
    ("collibra",      "Collibra"),
    ("cockroachlabs", "CockroachDB"),
    ("atlassian",     "Atlassian"),
    # Confirmed working slugs added after live API validation
    ("mongodb",       "MongoDB"),
    ("elastic",       "Elastic"),
    ("canonical",     "Canonical"),
    ("jetbrains",     "JetBrains"),
    ("airbnb",        "Airbnb"),
    ("reddit",        "Reddit"),
    ("lyft",          "Lyft"),
    ("brex",          "Brex"),
    ("okta",          "Okta"),
    ("newrelic",      "New Relic"),
    ("jfrog",         "JFrog"),
    ("scaleai",       "Scale AI"),
    ("worldquant",    "WorldQuant"),
    ("graphcore",     "Graphcore"),
    ("monzo",         "Monzo"),
    ("airtable",      "Airtable"),
    ("lattice",       "Lattice"),
    ("carta",         "Carta"),
    ("skyscanner",    "Skyscanner"),
    ("winton",        "Winton"),
    ("spacex",        "SpaceX"),
]

# Lever slugs confirmed to return HTTP 200 with real listings.
LEVER_COMPANIES = [
    ("palantir",     "Palantir"),
    ("wealthsimple", "Wealthsimple"),
    ("cloudinary",   "Cloudinary"),
    ("spotify",      "Spotify"),
]

# (ashby_slug, display_name) - confirmed against live API.
ASHBY_COMPANIES = [
    ("linear",          "Linear"),
    ("perplexityai",    "Perplexity AI"),
    ("cursor",          "Cursor"),
    ("vercel",          "Vercel"),
    ("railway",         "Railway"),
    ("loom",            "Loom"),
    ("iter",            "Iter"),
    ("mistralai",       "Mistral AI"),
    ("huggingface",     "Hugging Face"),
    ("supabase",        "Supabase"),
    ("neon",            "Neon"),
    ("turso",           "Turso"),
    ("planetscale",     "PlanetScale"),
    ("openai",          "OpenAI"),
    ("deepmind",        "Google DeepMind"),
    ("waymo",           "Waymo"),
    ("anyscale",        "Anyscale"),
    # Expanded - all confirmed against live API (June 2026)
    ("notion",          "Notion"),
    ("replit",          "Replit"),
    ("benchling",       "Benchling"),
    ("snowflake",       "Snowflake"),
    ("confluent",       "Confluent"),
    ("plaid",           "Plaid"),
    ("sentry",          "Sentry"),
    ("posthog",         "PostHog"),
    ("resend",          "Resend"),
    ("deliveroo",       "Deliveroo"),
    ("redis",           "Redis"),
    ("thought-machine", "Thought Machine"),
    ("cohere",          "Cohere"),
    ("ultra",           "Ultra"),
    # Wayve is also on Greenhouse (118 jobs) but Ashby has description/dates.
    ("wayve",           "Wayve"),
]

# I use SmartRecruiters for large UK employers that are not on Greenhouse or
# Lever - mostly consulting and telco companies that standardised on it.
SMARTRECRUITERS_COMPANIES = [
    ("KPMG",           "KPMG"),
    ("Vodafone",       "Vodafone"),
    ("CapgeminiGroup", "Capgemini"),
    ("Accenture",      "Accenture"),
    ("CGI",            "CGI"),
    ("Fujitsu",        "Fujitsu"),
    ("Atos",           "Atos"),
    ("DXC",            "DXC Technology"),
    ("BT",             "BT"),
    ("Virgin",         "Virgin Media O2"),
    ("Siemens",        "Siemens"),
    ("IBM",            "IBM"),
    ("NatWest",        "NatWest"),
    ("Barclays",       "Barclays"),
    ("HSBC",           "HSBC"),
    ("BritishAirways", "British Airways"),
    ("RollsRoyce",     "Rolls-Royce"),
    ("BAEsystems",     "BAE Systems"),
    ("Airbus",         "Airbus"),
    ("AstraZeneca",    "AstraZeneca"),
    ("GlaxoSmithKline","GSK"),
    ("BPGlobal",       "BP"),
    ("Shell",          "Shell"),
    ("Deloitte",       "Deloitte"),
    ("PwC",            "PwC"),
    ("EY",             "EY"),
]


# ─── APPLE CAREERS ──────────────────────────────────────────────────────────

def scrape_apple(existing_keys: set) -> int:
    """Scrape Apple UK internships via their public jobs search API."""
    print("\nScraping Apple Careers (UK)...")
    count = 0
    page = 1
    while page <= 10:
        try:
            resp = requests.get(
                "https://jobs.apple.com/api/role/search",
                params={
                    "filters": json.dumps({
                        "postingpostLocation": ["postLocation-GBR"],
                        "employmentType": ["INTERNS"],
                    }),
                    "page": str(page),
                    "locale": "en-US",
                },
                headers={**HEADERS, "Referer": "https://jobs.apple.com/"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Apple: HTTP {resp.status_code}")
                break
            data = resp.json()
            results = data.get("searchResults", [])
            if not results:
                break
            for role in results:
                title = role.get("postingTitle", "")
                locs = role.get("locations", [])
                location = locs[0].get("name", "") if locs else ""
                pid = role.get("positionId", "")
                job_url = (
                    f"https://jobs.apple.com/en-gb/details/{pid}"
                    if pid else ""
                )
                if not is_relevant(title, "Apple", location):
                    continue
                if insert_job({
                    "company":  "Apple",
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Apple Careers",
                }, existing_keys):
                    count += 1
            if len(results) < 20:
                break
            page += 1
            time.sleep(1)
        except Exception as e:
            print(f"  Error Apple p{page}: {e}")
            break
    print(f"  Added {count} from Apple Careers")
    return count


# ─── MICROSOFT CAREERS ────────────────────────────────────────────────────────

def scrape_microsoft(existing_keys: set) -> int:
    """Scrape Microsoft UK internships from their careers portal."""
    print("\nScraping Microsoft Careers (UK)...")
    count = 0
    page = 1
    while page <= 10:
        try:
            resp = requests.get(
                "https://jobs.careers.microsoft.com/api/jobs/search",
                params={
                    "q": "intern",
                    "lc": "United Kingdom",
                    "l": "en_us",
                    "pg": str(page),
                    "pgSz": "20",
                    "o": "Relevance",
                    "flt": "true",
                },
                headers={
                    **HEADERS,
                    "Referer": "https://jobs.careers.microsoft.com/",
                },
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Microsoft: HTTP {resp.status_code}")
                break
            data = resp.json()
            jobs_list = (
                data.get("operationResult", {})
                    .get("result", {})
                    .get("jobs", [])
            )
            if not jobs_list:
                break
            for job in jobs_list:
                title = job.get("title", "")
                props = job.get("properties", {})
                location = props.get("primaryWorkLocation", "")
                jid = job.get("jobId", "")
                job_url = (
                    f"https://jobs.careers.microsoft.com/global/en/job/{jid}"
                    if jid else ""
                )
                if not is_relevant(title, "Microsoft", location):
                    continue
                if insert_job({
                    "company":  "Microsoft",
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Microsoft Careers",
                }, existing_keys):
                    count += 1
            if len(jobs_list) < 20:
                break
            page += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Microsoft p{page}: {e}")
            break
    print(f"  Added {count} from Microsoft Careers")
    return count


# ─── AMAZON JOBS JSON API ─────────────────────────────────────────────────────

def scrape_amazon(existing_keys: set) -> int:
    """Scrape Amazon UK internships via their public JSON search API.

    Amazon hosts their own careers site at amazon.jobs which exposes a
    /en/search.json endpoint - no API key required.
    """
    print("\nScraping Amazon Jobs (UK)...")
    count = 0
    offset = 0
    while offset <= 200:
        try:
            resp = requests.get(
                "https://www.amazon.jobs/en/search.json",
                params={
                    "base_query": "intern",
                    "loc_query":  "United Kingdom",
                    "result_limit": 10,
                    "sort": "relevant",
                    "offset": offset,
                },
                headers={**HEADERS, "Accept": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Amazon: HTTP {resp.status_code}")
                break
            data = resp.json()
            jobs = data.get("jobs", [])
            if not jobs:
                break
            for job in jobs:
                title = job.get("title", "")
                country = job.get("country_code", "")
                city = job.get("city", "")
                location = f"{city}, {country}" if city else country
                # I normalise the country code - Amazon uses ISO-3 codes.
                if country not in ("GBR", "IRL"):
                    continue
                job_path = job.get("job_path", "")
                job_url = f"https://www.amazon.jobs{job_path}" if job_path else ""
                description_text = job.get("description", "")
                posted_raw = job.get("posted_date", "")
                # Amazon returns e.g. "January 15, 2026" - convert to ISO.
                opening_date = None
                if posted_raw:
                    try:
                        opening_date = datetime.strptime(
                            posted_raw, "%B %d, %Y"
                        ).strftime("%Y-%m-%d")
                    except Exception:
                        pass
                if is_relevant(title, "Amazon", location):
                    if insert_job({
                        "company":               "Amazon",
                        "role":                  title,
                        "type":                  infer_type(title),
                        "url":                   job_url,
                        "location":              location,
                        "source":                "Amazon Jobs",
                        "opening_date":          opening_date,
                        "sponsors_visa":         detect_sponsors_visa(description_text),
                        "cover_letter_required": detect_cover_letter_required(description_text),
                    }, existing_keys):
                        count += 1
            total_hits = data.get("hits", 0)
            if offset + 10 >= total_hits:
                break
            offset += 10
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Amazon offset={offset}: {e}")
            break
    print(f"  Added {count} from Amazon Jobs")
    return count


# ─── WORKDAY API (NVIDIA, Intel, and other Workday-hosted companies) ─────────

# Confirmed Workday configurations: (subdomain, wdnum, tenant, site_id, display_name)
# Validated against live API - POST to /wday/cxs/{tenant}/{site_id}/jobs.
# ARM, Goldman, JPMorgan, Qualcomm, BAE, Rolls-Royce use Workday but require
# session cookies or proprietary auth - scrape via The Trackr (Playwright) instead.
WORKDAY_COMPANIES = [
    ("nvidia", "5", "nvidia", "NVIDIAExternalCareerSite", "NVIDIA"),
    ("intel",  "1", "intel",  "External",                 "Intel"),
    ("ms",     "5", "ms",     "External",                 "Morgan Stanley"),
]


def scrape_workday(
    subdomain: str, wdnum: str, tenant: str, site_id: str,
    company_name: str, existing_keys: set
) -> int:
    """Scrape a Workday-hosted career site via their internal CXS API.

    Workday requires a POST request with JSON body - a plain GET returns 404.
    I page through all results and filter by UK location after retrieval.
    """
    url = (
        f"https://{subdomain}.wd{wdnum}.myworkdayjobs.com"
        f"/wday/cxs/{tenant}/{site_id}/jobs"
    )
    print(f"\nScraping {company_name} Workday...")
    count = 0
    offset = 0
    total = None
    while total is None or offset < total:
        try:
            resp = requests.post(
                url,
                json={"limit": 20, "offset": offset, "searchText": "intern"},
                headers={**HEADERS, "Content-Type": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  {company_name} Workday: HTTP {resp.status_code}")
                break
            data = resp.json()
            if total is None:
                total = data.get("total", 0)
            jobs = data.get("jobPostings", [])
            if not jobs:
                break
            for job in jobs:
                title = job.get("title", "")
                # Workday location is in 'locationsText' or the first bulletField.
                location_text = job.get("locationsText", "") or ""
                if not location_text:
                    for bf in job.get("bulletFields", []):
                        if bf:
                            location_text = bf
                            break
                # I pre-filter non-UK roles to avoid HEAD-checking hundreds of
                # US job URLs. is_relevant does a second check inside.
                is_priority = any(p in company_name.lower() for p in PRIORITY_COMPANIES)
                if location_text and not is_location_ok(location_text, is_priority):
                    continue
                ext_url = job.get("externalPath", "")
                job_url = (
                    f"https://{subdomain}.wd{wdnum}.myworkdayjobs.com"
                    f"/en-US/{site_id}/job{ext_url}"
                ) if ext_url else ""
                if is_relevant(title, company_name, location_text):
                    if insert_job({
                        "company":  company_name,
                        "role":     title,
                        "type":     infer_type(title),
                        "url":      job_url,
                        "location": location_text,
                        "source":   "Workday",
                    }, existing_keys):
                        count += 1
                elif is_relevant_job(title, company_name, location_text):
                    if insert_job({
                        "company":  company_name,
                        "role":     title,
                        "type":     "Full-time Job",
                        "url":      job_url,
                        "location": location_text,
                        "source":   "Workday",
                    }, existing_keys):
                        count += 1
            offset += len(jobs)
            time.sleep(0.5)
            if len(jobs) < 20:
                break
        except Exception as e:
            print(f"  Error {company_name} Workday offset={offset}: {e}")
            break
    print(f"  Added {count} from {company_name} Workday")
    return count


# ─── REMOTIVE (remote full-time tech jobs, worldwide) ────────────────────────

def scrape_remotive(existing_keys: set) -> int:
    # I use Remotive's free public API which returns currently open remote jobs.
    # I filter to full_time only so internship/contract listings are excluded.
    print("\nScraping Remotive (remote full-time jobs)...")
    count = 0
    categories = ["software-dev", "devops-sysadmin", "data", "product"]
    seen_ids: set = set()
    for cat in categories:
        url = f"https://remotive.com/api/remote-jobs?category={cat}&limit=100"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                print(f"  Remotive {cat}: HTTP {resp.status_code}")
                continue
            for job in resp.json().get("jobs", []):
                job_id = job.get("id")
                if job_id in seen_ids:
                    continue
                seen_ids.add(job_id)
                if job.get("job_type") != "full_time":
                    continue
                title = job.get("title", "")
                company = job.get("company_name", "")
                job_url = job.get("url", "")
                location = job.get("candidate_required_location", "")
                salary = job.get("salary", "")
                pub_str = (job.get("publication_date") or "")[:10] or None
                if not is_relevant_job(title, company, location):
                    continue
                if insert_job({
                    "company":      company,
                    "role":         title,
                    "type":         "Full-time Job",
                    "url":          job_url,
                    "location":     location,
                    "salary_range": salary or "",
                    "opening_date": pub_str,
                    "source":       "Remotive",
                }, existing_keys):
                    count += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Remotive {cat}: {e}")
    print(f"  Added {count} from Remotive")
    return count


# ─── REED.CO.UK ─────────────────────────────────────────────────────────────

def scrape_reed(existing_keys: set) -> int:
    # I use Reed's public API - REED_API_KEY must be set as a GitHub Actions
    # secret. Register free at reed.co.uk/developers/jobseeker to get one.
    api_key = os.environ.get("REED_API_KEY", "")
    if not api_key:
        print("  REED_API_KEY not set - skipping Reed.co.uk")
        return 0

    # I run separate searches for each role type so I can use the graduate flag
    # and get broader keyword coverage than a single broad query.
    SEARCHES = [
        {"keywords": "software intern",
         "locationName": "United Kingdom"},
        {"keywords": "technology internship",
         "locationName": "United Kingdom"},
        {"keywords": "engineering internship",
         "locationName": "United Kingdom"},
        {"keywords": "data science internship",
         "locationName": "United Kingdom"},
        {"keywords": "year in industry",
         "locationName": "United Kingdom"},
        {"keywords": "industrial placement",
         "locationName": "United Kingdom"},
        # I use graduate=true for these so Reed pre-filters to graduate roles.
        {"keywords": "software engineer",
         "locationName": "United Kingdom", "graduate": "true"},
        {"keywords": "technology",
         "locationName": "United Kingdom", "graduate": "true"},
    ]

    count = 0
    for params in SEARCHES:
        try:
            resp = requests.get(
                "https://www.reed.co.uk/api/1.0/search",
                params={**params, "resultsToTake": 100},
                auth=(api_key, ""),
                headers={"Accept": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Reed HTTP {resp.status_code} for {params}")
                continue

            for job in resp.json().get("results", []):
                title = job.get("jobTitle", "")
                company = job.get("employerName", "")
                location = job.get("locationName", "")
                job_id = job.get("jobId", "")
                job_url = (
                    f"https://www.reed.co.uk/jobs/{job_id}"
                    if job_id else ""
                )
                expiry = job.get("expirationDate", "")

                if not is_relevant(title, company, location):
                    continue
                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": normalize_location(location),
                    "source":   "Reed",
                    "deadline": expiry,
                }, existing_keys):
                    count += 1

            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Reed {params.get('keywords')}: {e}")

    print(f"  Added {count} from Reed.co.uk")
    return count


# ─── ADZUNA ──────────────────────────────────────────────────────────────────

def scrape_adzuna(existing_keys: set) -> int:
    # I use Adzuna's aggregated UK jobs API which covers hundreds of job boards.
    # ADZUNA_APP_ID and ADZUNA_APP_KEY must be set as GitHub Actions secrets.
    # Register free at developer.adzuna.com - 1000 requests/month on trial.
    app_id = os.environ.get("ADZUNA_APP_ID", "")
    app_key = os.environ.get("ADZUNA_APP_KEY", "")
    if not app_id or not app_key:
        print("  ADZUNA_APP_ID/ADZUNA_APP_KEY not set - skipping Adzuna")
        return 0

    BASE = "https://api.adzuna.com/v1/api/jobs/gb/search/1"
    SEARCHES = [
        "software intern",
        "technology internship",
        "engineering internship",
        "year in industry",
        "industrial placement",
        "graduate scheme technology",
        "data science internship",
        "machine learning internship",
        "embedded software intern",
        "firmware engineer intern",
        "cloud engineer internship",
        "devops internship",
        "cyber security intern",
        "quant developer internship",
    ]

    def _resolve_url(tracking_url: str) -> str:
        # I follow the Adzuna redirect to get the actual company/ATS URL.
        # If it still lands on adzuna.co.uk the tracking link is kept as fallback.
        try:
            r = requests.head(tracking_url, allow_redirects=True, timeout=5)
            if r.url and "adzuna" not in r.url:
                return r.url
        except Exception:
            pass
        return tracking_url

    count = 0
    for what in SEARCHES:
        try:
            resp = requests.get(
                BASE,
                params={
                    "app_id":           app_id,
                    "app_key":          app_key,
                    "what":             what,
                    "where":            "UK",
                    "results_per_page": 15,
                    "content-type":     "application/json",
                },
                headers={"Accept": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Adzuna HTTP {resp.status_code} for '{what}'")
                continue

            for job in resp.json().get("results", []):
                title = job.get("title", "")
                company = (job.get("company") or {}).get("display_name", "")
                location = (
                    (job.get("location") or {})
                    .get("display_name", "")
                )
                job_url = _resolve_url(job.get("redirect_url", ""))
                expiry = job.get("expiration_date", "")

                if not is_relevant(title, company, location):
                    continue
                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": normalize_location(location),
                    "source":   "Adzuna",
                    "deadline": expiry[:10] if expiry else None,
                }, existing_keys):
                    count += 1

            time.sleep(1.0)
        except Exception as e:
            print(f"  Error Adzuna '{what}': {e}")

    print(f"  Added {count} from Adzuna")
    return count


# ─── JOOBLE ──────────────────────────────────────────────────────────────────

def scrape_jooble(existing_keys: set) -> int:
    # I use Jooble's POST API which aggregates from hundreds of job boards.
    # JOOBLE_API_KEY must be set as a GitHub Actions secret.
    # Request a free key at jooble.org/api/about.
    api_key = os.environ.get("JOOBLE_API_KEY", "")
    if not api_key:
        print("  JOOBLE_API_KEY not set - skipping Jooble")
        return 0

    SEARCHES = [
        {"keywords": "software internship", "location": "United Kingdom"},
        {"keywords": "technology intern", "location": "United Kingdom"},
        {"keywords": "year in industry", "location": "United Kingdom"},
        {"keywords": "industrial placement", "location": "United Kingdom"},
        {"keywords": "graduate scheme software", "location": "United Kingdom"},
        {"keywords": "engineering internship", "location": "United Kingdom"},
    ]

    count = 0
    for params in SEARCHES:
        try:
            resp = requests.post(
                f"https://jooble.org/api/{api_key}",
                json=params,
                headers={"Content-type": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(
                    f"  Jooble HTTP {resp.status_code} for "
                    f"'{params.get('keywords')}'"
                )
                continue

            for job in resp.json().get("jobs", []):
                title = job.get("title", "")
                company = job.get("company", "")
                location = job.get("location", "")
                job_url = job.get("link", "")
                updated = job.get("updated", "")

                if not is_relevant(title, company, location):
                    continue
                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": normalize_location(location),
                    "source":   "Jooble",
                    "deadline": updated[:10] if updated else None,
                }, existing_keys):
                    count += 1

            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Jooble '{params.get('keywords')}': {e}")

    print(f"  Added {count} from Jooble")
    return count


# ─── ARBEITNOW ───────────────────────────────────────────────────────────────

def scrape_arbeitnow(existing_keys: set) -> int:
    # I use Arbeitnow's free public API - no auth required.
    # It aggregates European tech jobs and is particularly strong for remote
    # and EU-based engineering roles.
    count = 0
    try:
        resp = requests.get(
            "https://arbeitnow.com/api/job-board-api",
            headers={"Accept": "application/json"},
            timeout=15,
        )
        if resp.status_code != 200:
            print(f"  Arbeitnow HTTP {resp.status_code}")
            return 0

        for job in resp.json().get("data", []):
            title = job.get("title", "")
            company = job.get("company_name", "")
            location = job.get("location", "")
            job_url = job.get("url", "")
            remote = job.get("remote", False)
            if remote and not location:
                location = "Remote"

            if not is_relevant(title, company, location):
                continue
            if insert_job({
                "company":  company,
                "role":     title,
                "type":     infer_type(title),
                "url":      job_url,
                "location": normalize_location(location),
                "source":   "Arbeitnow",
            }, existing_keys):
                count += 1

    except Exception as e:
        print(f"  Error Arbeitnow: {e}")

    print(f"  Added {count} from Arbeitnow")
    return count


# ─── JOBICY ──────────────────────────────────────────────────────────────────

def scrape_jobicy(existing_keys: set) -> int:
    # I use Jobicy's free open API - no auth required.
    # It covers remote-only tech roles so I skip the location check and accept
    # any matching student role since "Remote" is UK-acceptable.
    QUERIES = [
        {"industry": "engineering", "tag": "intern"},
        {"industry": "software-development", "tag": "intern"},
        {"industry": "data-science", "tag": "intern"},
    ]

    count = 0
    for params in QUERIES:
        try:
            resp = requests.get(
                "https://jobicy.com/api/v2/remote-jobs",
                params={**params, "count": 50},
                headers={"Accept": "application/json"},
                timeout=15,
            )
            if resp.status_code != 200:
                continue

            for job in resp.json().get("jobs", []):
                title = job.get("jobTitle", "")
                company = job.get("companyName", "")
                job_url = job.get("url", "")

                # I skip the location check here because Jobicy is remote-only;
                # I still require a student term and tech keyword.
                if not is_student_role(title):
                    continue
                if not any(k in title.lower() for k in TECH_KEYWORDS):
                    continue
                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": "Remote",
                    "source":   "Jobicy",
                }, existing_keys):
                    count += 1

            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Jobicy: {e}")

    print(f"  Added {count} from Jobicy")
    return count


# ─── DISCORD ALERT ──────────────────────────────────────────────────────────

def send_discord_alert(new_jobs: list[dict]) -> None:
    # I post new job findings to Discord so alerts appear on phone immediately
    # after the daily scraper run rather than waiting for the Sunday digest.
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL", "")
    if not webhook_url or not new_jobs:
        return

    # I batch into chunks of 20 to stay under Discord's embed field limit.
    CHUNK = 20
    for i in range(0, len(new_jobs), CHUNK):
        chunk = new_jobs[i:i + CHUNK]
        lines = []
        for j in chunk:
            company = j.get("company", "")
            role = j.get("role", "")
            url = j.get("url", "")
            jtype = j.get("type", "")
            label = f"[{company} - {role}]({url})" if url else f"{company} - {role}"
            lines.append(f"- **{jtype}** {label}")

        payload = {
            "embeds": [{
                "title": f"New jobs found ({len(new_jobs)} total)",
                "description": "\n".join(lines),
                "color": 0x5865F2,
            }]
        }
        try:
            requests.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
        except Exception as e:
            print(f"  Discord alert failed: {e}")


# ─── MAIN ───────────────────────────────────────────────────────────────────

def refresh_seen_timestamps() -> None:
    # I batch-update last_scraped_at for all entries seen this run so freshness
    # is always visible per-row, even though scraped applications are kept
    # permanently and never deleted. I only touch last_scraped_at - all other
    # columns (status, notes, starred etc.) remain exactly as the user left them.
    if not _seen_urls:
        return
    seen_list = list(_seen_urls)
    now = datetime.now(timezone.utc).isoformat()
    BATCH = 100
    try:
        for i in range(0, len(seen_list), BATCH):
            supabase.table("applications").update(
                {"last_scraped_at": now}
            ).in_("url", seen_list[i:i + BATCH]).execute()
        print(f"Refreshed timestamps for {len(seen_list)} existing entries.")
    except Exception as e:
        print(f"Warning: timestamp refresh failed: {e}")


def main():
    global _seen_urls, _new_jobs
    _seen_urls = set()
    _new_jobs = []

    print(f"Job scraper starting at {datetime.now().isoformat()} (SCRAPER_MODE={SCRAPER_MODE})")

    # I load the existing keys (and the URL set) up front so insert_job knows whether to insert a new
    # row or refresh an existing one. Nothing is ever deleted - the scraper only inserts and updates.
    existing_keys = load_existing_keys()
    print(f"Found {len(existing_keys)} existing applications in DB")

    total = 0

    # I only run Playwright scrapers in browser or all mode.
    if SCRAPER_MODE in ("browser", "all"):
        try:
            n = scrape_trackr_all(existing_keys)
            total += n
            _record_stat("The Trackr", n)
        except Exception as e:
            # I guard the call site too because an uncaught exception here would
            # abort the whole run - the try/except inside scrape_trackr_all only
            # catches per-category errors, not startup failures.
            print(f"  Error The Trackr: {e}")
            _record_stat("The Trackr", 0, str(e))

        try:
            n = scrape_company_sites_playwright(existing_keys)
            total += n
        except Exception as e:
            print(f"  Error company career sites: {e}")

    # I run all API scrapers when SCRAPER_MODE is api or all.
    if SCRAPER_MODE in ("api", "all"):
        # I run the JSON API scrapers because they are the most reliable and
        # fastest - no HTML parsing involved.
        print("\n--- Greenhouse ---")
        gh_total = 0
        for slug, name in GREENHOUSE_COMPANIES:
            if _over_budget():
                print("  [budget] skipping remaining Greenhouse companies")
                break
            n = scrape_greenhouse(slug, name, existing_keys)
            if n:
                print(f"  {name}: {n}")
            gh_total += n
        total += gh_total
        _record_stat("Greenhouse", gh_total)

        print("\n--- Lever ---")
        lv_total = 0
        for slug, name in LEVER_COMPANIES:
            if _over_budget():
                print("  [budget] skipping remaining Lever companies")
                break
            n = scrape_lever(slug, name, existing_keys)
            if n:
                print(f"  {name}: {n}")
            lv_total += n
        total += lv_total
        _record_stat("Lever", lv_total)

        print("\n--- Ashby ---")
        ab_total = 0
        for slug, name in ASHBY_COMPANIES:
            if _over_budget():
                print("  [budget] skipping remaining Ashby companies")
                break
            n = scrape_ashby(slug, name, existing_keys)
            if n:
                print(f"  {name}: {n}")
            ab_total += n
        total += ab_total
        _record_stat("Ashby", ab_total)

        print("\n--- SmartRecruiters ---")
        sr_total = 0
        for company_id, name in SMARTRECRUITERS_COMPANIES:
            if _over_budget():
                print("  [budget] skipping remaining SmartRecruiters companies")
                break
            n = scrape_smartrecruiters(company_id, name, existing_keys)
            if n:
                print(f"  {name}: {n}")
            sr_total += n
        total += sr_total
        _record_stat("SmartRecruiters", sr_total)

        if not _over_budget():
            print("\n--- Apple Careers ---")
            try:
                n = scrape_apple(existing_keys)
                total += n
                _record_stat("Apple Careers", n)
            except Exception as e:
                print(f"  Error Apple: {e}")
                _record_stat("Apple Careers", 0, str(e))

        if not _over_budget():
            print("\n--- Microsoft Careers ---")
            try:
                n = scrape_microsoft(existing_keys)
                total += n
                _record_stat("Microsoft Careers", n)
            except Exception as e:
                print(f"  Error Microsoft: {e}")
                _record_stat("Microsoft Careers", 0, str(e))

        if not _over_budget():
            print("\n--- Amazon Jobs ---")
            try:
                n = scrape_amazon(existing_keys)
                total += n
                _record_stat("Amazon Jobs", n)
            except Exception as e:
                print(f"  Error Amazon: {e}")
                _record_stat("Amazon Jobs", 0, str(e))

        if not _over_budget():
            print("\n--- Workday (NVIDIA / Intel / Morgan Stanley) ---")
            wd_total = 0
            for subdomain, wdnum, tenant, site_id, name in WORKDAY_COMPANIES:
                if _over_budget():
                    break
                try:
                    n = scrape_workday(subdomain, wdnum, tenant, site_id, name, existing_keys)
                    wd_total += n
                except Exception as e:
                    print(f"  Error {name} Workday: {e}")
            total += wd_total
            _record_stat("Workday", wd_total)

        if not _over_budget():
            print("\n--- Reed ---")
            n = scrape_reed(existing_keys)
            total += n
            _record_stat("Reed", n)

        if not _over_budget():
            print("\n--- Adzuna ---")
            n = scrape_adzuna(existing_keys)
            total += n
            _record_stat("Adzuna", n)

        if not _over_budget():
            print("\n--- Jooble ---")
            n = scrape_jooble(existing_keys)
            total += n
            _record_stat("Jooble", n)

        if not _over_budget():
            print("\n--- Arbeitnow ---")
            n = scrape_arbeitnow(existing_keys)
            total += n
            _record_stat("Arbeitnow", n)

        if not _over_budget():
            print("\n--- Jobicy ---")
            n = scrape_jobicy(existing_keys)
            total += n
            _record_stat("Jobicy", n)

        if not _over_budget():
            n = scrape_remotive(existing_keys)
            total += n
            _record_stat("Remotive", n)

        # I refresh last_scraped_at for everything seen this run, without touching any user-set
        # field. The scraper never deletes rows, so this is purely a freshness stamp.
        refresh_seen_timestamps()

    # I send a Discord alert with all newly found student roles so I know
    # what came in from today's run without waiting for the Sunday digest.
    if _new_jobs:
        print(
            f"\nSending Discord alert for {len(_new_jobs)} new student roles..."
        )
        send_discord_alert(_new_jobs)

    print(f"\nDone. Added {total} new jobs.")

    # I write a Markdown summary table to source-stats.md so the workflow can
    # cat it into $GITHUB_STEP_SUMMARY and make failures visible at a glance.
    if _source_stats:
        # I write to source-stats.md regardless of whether GITHUB_STEP_SUMMARY
        # is set so the file can be inspected locally too.
        lines = [
            "| Source | Rows added | Note |",
            "|---|---|---|",
        ]
        for stat in _source_stats:
            # I coerce None note to empty string for cleaner table output.
            note = stat.get("note") or ""
            lines.append(f"| {stat['source']} | {stat['rows']} | {note} |")
        summary_text = "\n".join(lines) + "\n"
        with open("source-stats.md", "w") as fh:
            fh.write(summary_text)


if __name__ == "__main__":
    main()
