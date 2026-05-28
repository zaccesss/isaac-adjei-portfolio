"""
Job Scraper - runs via GitHub Actions once per day at midnight UTC.

Sources:
  - The Trackr (Playwright - JS rendered, best UK internship aggregator)
  - Greenhouse JSON API  (30+ companies)
  - Lever JSON API       (10+ companies)
  - Ashby Next.js embed  (10+ companies)
  - Gradcracker, RateMyPlacement, TargetJobs, BrightNetwork (BeautifulSoup)

Only student-facing roles are saved: internships, placements, spring/insight
weeks, graduate schemes, apprenticeships. Full-time permanent roles are
skipped unless they come from a priority company and contain a keyword.

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
from datetime import datetime, timedelta

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
        now = datetime.now()
        effective_cutoff = cutoff if cutoff is not None else CYCLE_CUTOFF
        return d >= effective_cutoff and d >= now
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


def insert_job(job: dict, existing_keys: set) -> bool:
    # I use a different date cutoff for full-time jobs (Jan 2026) vs internships (Sep 2025)
    cutoff = JOB_CUTOFF if job.get("type") == "Full-time Job" else CYCLE_CUTOFF
    if not is_date_relevant(job.get("deadline"), cutoff):
        return False

    # I skip dead links before touching the DB - a HEAD request is cheap
    # and saves polluting the table with 404 entries.
    url = job.get("url", "")
    if url and not is_url_alive(url):
        return False

    # I check the in-memory set before hitting the DB so deduplication costs
    # zero network round trips.
    key = dedupe_key(job["company"], job["role"], job.get("url", ""))
    if key in existing_keys:
        # I add the URL to the seen set so last_scraped_at is refreshed at the
        # end of the run - but I never re-insert or upsert here, which would
        # overwrite statuses or notes the user has set in the dashboard.
        if url:
            _seen_urls.add(url)
        return False

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
        "salary_range": job.get("salary_range", ""),
        "work_mode":    job.get("work_mode", ""),
        "source":       job.get("source", ""),
        # I default starred to False; I manually star interesting roles later.
        "starred":      False,
        "last_scraped_at": datetime.utcnow().isoformat(),
        "sponsors_visa": job.get("sponsors_visa", None),
        "category":     detect_category(job["company"], job["role"]),
    }

    try:
        # I use insert (not upsert) because existing entries are handled above
        # via the in-memory key check. If two scrapers somehow find the same URL
        # in one run the second insert will fail gracefully - the first already
        # added it to existing_keys so this branch is not reached in practice.
        supabase.table("applications").insert(record).execute()
        # I add the key to the in-memory set immediately so subsequent
        # duplicates within the same run are caught without another DB query.
        existing_keys.add(key)
        if url:
            _seen_urls.add(url)
        jtype = record.get("type", "")
        if jtype != "Full-time Job":
            _new_jobs.append(job)
        print(f"  + {job['company']} | {job['role']} {url}")
        return True
    except Exception as e:
        print(f"  ! Failed to insert {job['company']}: {e}")
        return False


# ─── THE TRACKR (Playwright - JS rendered) ──────────────────────────────────

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
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=HEADERS["User-Agent"],
            # I set locale here too so JS-based geo checks see a UK user.
            locale="en-GB",
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
                    job_url = (
                        prog_el.get_attribute("href")
                        if prog_el else ""
                    )
                    # I prepend the origin when the href is relative so the
                    # stored URL is always absolute.
                    if job_url and not job_url.startswith("http"):
                        job_url = (
                            f"https://app.the-trackr.com{job_url}"
                        )

                    # I parse dates from the remaining cells. The Trackr shows
                    # "21 May 26" style dates. I try multiple format strings
                    # because the year is sometimes 2-digit and sometimes 4.
                    opening_date = closing_date = None
                    for cell in cells[2:]:
                        text = cell.inner_text().strip()
                        for fmt in (
                            "%d %b %y",
                            "%d %b %Y",
                            "%d/%m/%Y",
                            "%d/%m/%y",
                        ):
                            try:
                                dt = datetime.strptime(text, fmt)
                                # I assume the first date is the opening date
                                # and the second is the deadline.
                                if not opening_date:
                                    opening_date = dt.strftime(
                                        "%Y-%m-%d"
                                    )
                                else:
                                    closing_date = dt.strftime(
                                        "%Y-%m-%d"
                                    )
                                break
                            except ValueError:
                                # I try the next format if this one fails.
                                pass

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

                    # I store the opening date in notes because there is no
                    # dedicated column for it.
                    if insert_job({
                        "company":      company,
                        "role":         programme,
                        "type":         job_type,
                        "url":          job_url or "",
                        "source":       "The Trackr",
                        "deadline":     closing_date,
                        "opening_date": opening_date,
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
                    location = meta.get("value") or ""
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

            if is_relevant(title, company_name, location, dept_names):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Greenhouse",
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title, company_name, location):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     "Full-time Job",
                    "url":      job_url,
                    "location": location,
                    "source":   "Greenhouse",
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


# ─── ASHBY (Next.js __NEXT_DATA__ embed) ─────────────────────────────────────

def scrape_ashby(
    slug: str, company_name: str, existing_keys: set
) -> int:
    """Ashby job boards embed all data in __NEXT_DATA__ - no headless needed.

    I use requests + BeautifulSoup here because although Ashby is a Next.js
    app, it statically generates the jobs page and embeds the full job list
    in the __NEXT_DATA__ script tag on first HTML load.
    """
    url = f"https://jobs.ashbyhq.com/{slug}"
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")

        # I target the script tag by id rather than iterating all scripts.
        el = soup.find("script", id="__NEXT_DATA__")
        if not el:
            print(f"  Ashby {company_name}: no __NEXT_DATA__ found")
            return 0

        data = json.loads(el.string)
        page_props = (
            data.get("props", {}).get("pageProps", {})
        )
        # I try multiple key names because different Ashby versions use
        # different field names for the jobs list.
        jobs = (
            page_props.get("jobPostings")
            or page_props.get("jobs")
            or page_props.get("allJobPostings")
            or []
        )

        for job in jobs:
            # I try multiple field names because Ashby's schema is
            # inconsistent across employers.
            title = job.get("title") or job.get("jobTitle", "")
            location = (
                job.get("locationName") or job.get("location", "")
            )
            # I fall back to constructing the URL from slug + id when
            # jobUrl is absent.
            job_url = (
                job.get("jobUrl")
                or f"{url}/{job.get('id', '')}"
            )

            if is_relevant(title, company_name, location):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Ashby",
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title, company_name, location):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     "Full-time Job",
                    "url":      job_url,
                    "location": location,
                    "source":   "Ashby",
                }, existing_keys):
                    count += 1

        time.sleep(0.5)
    except Exception as e:
        print(f"  Error Ashby {company_name}: {e}")
    return count


# ─── GRADCRACKER (BeautifulSoup - UK STEM, EEE focused) ──────────────────────

def scrape_gradcracker(existing_keys: set) -> int:
    # I target both computing/technology and electronic/electrical engineering
    # because EEE is my degree and many hardware/embedded roles appear there.
    print("\nScraping Gradcracker...")
    count = 0
    urls = [
        (
            "https://www.gradcracker.com/search/"
            "computing-technology/internship-jobs",
            "internship",
        ),
        (
            "https://www.gradcracker.com/search/"
            "computing-technology/work-placements",
            "Industrial Placement",
        ),
        (
            "https://www.gradcracker.com/search/"
            "electronic-electrical-engineering/internship-jobs",
            "internship",
        ),
        (
            "https://www.gradcracker.com/search/"
            "electronic-electrical-engineering/work-placements",
            "Industrial Placement",
        ),
        (
            "https://www.gradcracker.com/search/"
            "computing-technology/graduate-jobs",
            "Graduate",
        ),
    ]
    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            # I try multiple selector patterns in case Gradcracker changes
            # their markup.
            for item in soup.select(
                ".opportunity, .job-card, article, .tw-group"
            ):
                company_el = item.select_one(
                    ".company, .employer, h3, .tw-font-bold"
                )
                title_el = item.select_one(
                    ".title, .job-title, h2, a"
                )
                link_el = item.find("a")
                location_el = item.select_one(".location, .place")

                # I coerce missing elements to empty strings rather than
                # None so is_relevant never throws a TypeError.
                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                # I prepend the origin for relative links.
                if not link.startswith("http"):
                    link = f"https://www.gradcracker.com{link}"
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "Gradcracker",
                }, existing_keys):
                    count += 1
            # I sleep 2 seconds to avoid Gradcracker's Cloudflare rate limit.
            time.sleep(2)
        except Exception as e:
            print(f"  Error Gradcracker {url}: {e}")
    return count


# ─── RATEMYPLACEMENT ────────────────────────────────────────────────────────

def scrape_ratemyplacement(existing_keys: set) -> int:
    # I include engineering as well as technology because embedded and hardware
    # roles often appear under engineering on this board.
    print("\nScraping RateMyPlacement...")
    count = 0
    urls = [
        (
            "https://www.ratemyplacement.co.uk/jobs"
            "?role=technology&type=placement-year",
            "Industrial Placement",
        ),
        (
            "https://www.ratemyplacement.co.uk/jobs"
            "?role=technology&type=summer-internship",
            "Internship",
        ),
        (
            "https://www.ratemyplacement.co.uk/jobs"
            "?role=engineering&type=placement-year",
            "Industrial Placement",
        ),
    ]
    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            # I try multiple card selectors in case RateMyPlacement redesigns.
            for item in soup.select(
                ".job-listing, .vacancy-card, article, .opportunity-card"
            ):
                company_el = item.select_one(
                    ".company-name, .employer, h3"
                )
                title_el = item.select_one(".job-title, .role-title, h2")
                link_el = item.find("a")
                location_el = item.select_one(".location")

                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                if not link.startswith("http"):
                    link = (
                        f"https://www.ratemyplacement.co.uk{link}"
                    )
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "RateMyPlacement",
                }, existing_keys):
                    count += 1
            time.sleep(2)
        except Exception as e:
            print(f"  Error RateMyPlacement {url}: {e}")
    return count


# ─── TARGETJOBS ─────────────────────────────────────────────────────────────

def scrape_targetjobs(existing_keys: set) -> int:
    print("\nScraping TargetJobs...")
    count = 0
    # I target engineering alongside IT because semiconductor and aerospace
    # roles appear exclusively in the engineering category on TargetJobs.
    urls = [
        (
            "https://targetjobs.co.uk/internships/it-and-technology",
            "internship",
        ),
        (
            "https://targetjobs.co.uk/placements/it-and-technology",
            "Industrial Placement",
        ),
        (
            "https://targetjobs.co.uk/internships"
            "/engineering-and-manufacturing",
            "internship",
        ),
    ]
    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            for item in soup.select(".vacancy, article, .job-listing"):
                company_el = item.select_one(".employer, .company, h3")
                title_el = item.select_one(".job-title, h2, a")
                link_el = item.find("a")
                location_el = item.select_one(".location")

                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                if not link.startswith("http"):
                    link = f"https://targetjobs.co.uk{link}"
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "TargetJobs",
                }, existing_keys):
                    count += 1
            time.sleep(2)
        except Exception as e:
            print(f"  Error TargetJobs {url}: {e}")
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


def scrape_totaljobs(existing_keys: set) -> int:
    """TotalJobs - one of the largest UK job boards."""
    print("\nScraping TotalJobs...")
    count = 0
    urls = [
        (
            "https://www.totaljobs.com/jobs"
            "/software-engineer/internship-jobs",
            "internship",
        ),
        (
            "https://www.totaljobs.com/jobs"
            "/software-developer/internship-jobs",
            "internship",
        ),
        (
            "https://www.totaljobs.com/jobs"
            "/software-engineer/graduate-jobs",
            "Graduate",
        ),
        (
            "https://www.totaljobs.com/jobs"
            "/technology/placement-jobs",
            "Industrial Placement",
        ),
    ]
    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            # I try multiple card selectors because TotalJobs updates markup
            # periodically.
            for item in soup.select(
                "article.job-card, .job-tile, [data-testid='job-item']"
            ):
                company_el = item.select_one(
                    ".job-card__company, .company-name, h3.title"
                )
                title_el = item.select_one(
                    ".job-card__title, h2, "
                    "a[data-testid='job-item-title']"
                )
                link_el = item.find("a")
                location_el = item.select_one(
                    ".job-card__location, .location"
                )

                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                if not link.startswith("http"):
                    link = f"https://www.totaljobs.com{link}"
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "TotalJobs",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error TotalJobs {url}: {e}")
    return count


def scrape_prospects(existing_keys: set) -> int:
    """Prospects - the official UK graduate careers website.

    I scrape Prospects because it aggregates roles from smaller UK employers
    that do not have their own Greenhouse or Lever boards.
    """
    print("\nScraping Prospects...")
    count = 0
    urls = [
        (
            "https://www.prospects.ac.uk/jobs-and-work-experience"
            "/job-sectors/information-technology"
            "/it-internships-placements",
            "Industrial Placement",
        ),
        (
            "https://www.prospects.ac.uk/jobs-and-work-experience"
            "/job-sectors/engineering-and-manufacturing"
            "/engineering-internships",
            "internship",
        ),
        (
            "https://www.prospects.ac.uk/jobs-and-work-experience"
            "/job-sectors/information-technology/it-graduate-jobs",
            "Graduate",
        ),
    ]
    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for item in soup.select(
                ".job-listing, article, .vacancy-item"
            ):
                company_el = item.select_one(".company, .employer, h3")
                title_el = item.select_one(".title, h2, a")
                link_el = item.find("a")
                location_el = item.select_one(".location")

                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                if not link.startswith("http"):
                    link = f"https://www.prospects.ac.uk{link}"
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "Prospects",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error Prospects {url}: {e}")
    return count


def scrape_brightnetwork(existing_keys: set) -> int:
    # I use BrightNetwork's search endpoint rather than a category page
    # because the search results include roles from multiple sectors in one
    # request.
    print("\nScraping BrightNetwork...")
    count = 0
    searches = [
        (
            "https://www.brightnetwork.co.uk/search/"
            "?search=software+engineer+internship+uk",
            "internship",
        ),
        (
            "https://www.brightnetwork.co.uk/search/"
            "?search=engineering+placement+uk",
            "Industrial Placement",
        ),
        (
            "https://www.brightnetwork.co.uk/search/"
            "?search=technology+spring+week+uk",
            "Spring Week",
        ),
        (
            "https://www.brightnetwork.co.uk/search/"
            "?search=graduate+scheme+technology+uk",
            "Graduate",
        ),
    ]
    for url, job_type in searches:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            # I try three different card selectors to handle current and past
            # BrightNetwork markup.
            for card in soup.select(
                "[data-testid='job-card'], "
                ".job-card, "
                "article.opportunity"
            ):
                company_el = card.select_one(
                    ".company-name, [data-testid='company'], h3"
                )
                title_el = card.select_one(
                    ".job-title, [data-testid='job-title'], h2"
                )
                link_el = card.find("a")
                location_el = card.select_one(
                    ".location, [data-testid='location']"
                )

                company = (
                    company_el.get_text(strip=True)
                    if company_el else ""
                )
                title = (
                    title_el.get_text(strip=True)
                    if title_el else ""
                )
                link = (
                    link_el.get("href", "")
                    if link_el else ""
                )
                location = (
                    location_el.get_text(strip=True)
                    if location_el else ""
                )

                if not link.startswith("http"):
                    link = f"https://www.brightnetwork.co.uk{link}"
                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company":  company,
                    "role":     title,
                    "type":     job_type,
                    "url":      link,
                    "location": location,
                    "source":   "BrightNetwork",
                }, existing_keys):
                    count += 1
            time.sleep(2)
        except Exception as e:
            print(f"  Error BrightNetwork: {e}")
    return count


# ─── COMPANY LISTS ──────────────────────────────────────────────────────────

# I group companies by ATS vendor so it is easy to add new ones in the right
# section. Each tuple is (ats_slug, display_name).

# (greenhouse_slug, display_name)
GREENHOUSE_COMPANIES = [
    # Big tech & cloud
    ("cloudflare",        "Cloudflare"),
    ("stripe",            "Stripe"),
    ("figma",             "Figma"),
    ("anthropic",         "Anthropic"),
    ("databricks",        "Databricks"),
    ("snowflakecomputing", "Snowflake"),
    ("nvidia",            "NVIDIA"),
    ("coinbase",          "Coinbase"),
    ("samsara",           "Samsara"),
    ("coreweave",         "CoreWeave"),
    ("anduril",           "Anduril Industries"),
    ("scaleai",           "Scale AI"),
    # Finance & banking
    ("goldmansachs",      "Goldman Sachs"),
    ("wise",              "Wise"),
    ("revolut",           "Revolut"),
    # Fintech & payments
    ("brex",              "Brex"),
    ("ramp",              "Ramp"),
    ("plaid",             "Plaid"),
    ("rippling",          "Rippling"),
    ("adyen",             "Adyen"),
    ("klarna",            "Klarna"),
    # Trading & quant
    ("citadel",           "Citadel"),
    ("citadelsecurities", "Citadel Securities"),
    ("akunacapital",      "Akuna Capital"),
    ("imc",               "IMC Trading"),
    ("janestreet",        "Jane Street"),
    ("twosigma",          "Two Sigma"),
    ("optiver",           "Optiver"),
    # Developer tools & infra
    ("hashicorp",         "HashiCorp"),
    ("grafana",           "Grafana Labs"),
    ("sentry",            "Sentry"),
    ("mongodb",           "MongoDB"),
    ("elastic",           "Elastic"),
    ("confluent",         "Confluent"),
    ("datadog",           "Datadog"),
    ("retool",            "Retool"),
    ("notion",            "Notion"),
    ("duolingo",          "Duolingo"),
    ("airtable",          "Airtable"),
    ("asana",             "Asana"),
    ("hubspot",           "HubSpot"),
    ("intercom",          "Intercom"),
    ("squareup",          "Block (Square)"),
    ("robinhood",         "Robinhood"),
    ("atlassian",         "Atlassian"),
    ("zendesk",           "Zendesk"),
    # Cloud & security
    ("crowdstrike",       "CrowdStrike"),
    ("okta",              "Okta"),
    ("gitlab",            "GitLab"),
    ("jfrog",             "JFrog"),
    ("newrelic",          "New Relic"),
    ("dynatrace",         "Dynatrace"),
    ("snyk",              "Snyk"),
    ("twilio",            "Twilio"),
    ("pagerduty",         "PagerDuty"),
    ("sumo-logic",        "Sumo Logic"),
    ("harness",           "Harness"),
    ("wiz-io",            "Wiz"),
    # More developer tools
    ("1password",         "1Password"),
    ("zapier",            "Zapier"),
    ("segment",           "Segment"),
    ("amplitude",         "Amplitude"),
    ("mixpanel",          "Mixpanel"),
    ("postman",           "Postman"),
    ("miro",              "Miro"),
    # Deep tech & AI
    ("cohere",            "Cohere"),
    ("together",          "Together AI"),
    ("replicate",         "Replicate"),
    ("modal",             "Modal"),
    # UK tech companies
    ("thoughtmachine",    "Thought Machine"),
    ("darktrace",         "Darktrace"),
    ("onfido",            "Onfido"),
    ("improbable",        "Improbable"),
    ("monzo",             "Monzo"),
    ("checkout",          "Checkout.com"),
    ("starlingbank",      "Starling Bank"),
    ("benevolentai",      "BenevolentAI"),
    # Data & analytics
    ("fivetran",          "Fivetran"),
    ("dbtlabs",           "dbt Labs"),
    ("airbyte",           "Airbyte"),
    ("starburst",         "Starburst"),
    ("collibra",          "Collibra"),
    # Productivity & collaboration
    ("dropbox",           "Dropbox"),
    ("box",               "Box"),
    ("mural",             "MURAL"),
    ("coda",              "Coda"),
    # More cloud & infra
    ("fastly",            "Fastly"),
    ("cockroachlabs",     "CockroachDB"),
    ("weaviate",          "Weaviate"),
    ("pinecone",          "Pinecone"),
    # Defence & aerospace
    ("baesystems",        "BAE Systems"),
    ("leidos",            "Leidos"),
]

# (lever_slug, display_name)
LEVER_COMPANIES = [
    ("palantir",     "Palantir"),
    ("netlify",      "Netlify"),
    ("canva",        "Canva"),
    ("discord",      "Discord"),
    ("reddit",       "Reddit"),
    ("twitch",       "Twitch"),
    ("wealthsimple", "Wealthsimple"),
    ("shopify",      "Shopify"),
    ("cloudinary",   "Cloudinary"),
    ("mux",          "Mux"),
    ("launchdarkly", "LaunchDarkly"),
    ("tailscale",    "Tailscale"),
    ("fly",          "Fly.io"),
    ("zeditor",      "Zed"),
    ("intercom",     "Intercom"),
    ("zendesk",      "Zendesk"),
    ("docusign",     "DocuSign"),
    ("greenhouse",   "Greenhouse"),
    ("remote",       "Remote"),
    ("deel",         "Deel"),
    ("ripple",       "Ripple"),
    ("figma",        "Figma"),
    ("deliveroo",    "Deliveroo"),
    ("skyscanner",   "Skyscanner"),
    ("getmomo",      "Momo"),
    ("arm",          "ARM"),
    ("wayve",        "Wayve"),
]

# (ashby_slug, display_name)
ASHBY_COMPANIES = [
    ("linear",       "Linear"),
    ("perplexityai", "Perplexity AI"),
    ("cursor",       "Cursor"),
    ("vercel",       "Vercel"),
    ("railway",      "Railway"),
    ("loom",         "Loom"),
    ("iter",         "Iter"),
    ("mistralai",    "Mistral AI"),
    ("huggingface",  "Hugging Face"),
    ("supabase",     "Supabase"),
    ("neon",         "Neon"),
    ("turso",        "Turso"),
    ("planetscale",  "PlanetScale"),
    ("openai",       "OpenAI"),
    ("deepmind",     "Google DeepMind"),
    ("waymo",        "Waymo"),
    ("anyscale",     "Anyscale"),
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


# ─── GOOGLE CAREERS ──────────────────────────────────────────────────────────

def scrape_google(existing_keys: set) -> int:
    """Scrape Google UK internships via their careers search API."""
    print("\nScraping Google Careers (UK)...")
    count = 0
    search_terms = ["intern", "internship", "placement"]
    seen: set = set()
    for term in search_terms:
        try:
            resp = requests.get(
                "https://careers.google.com/api/v3/search/",
                params={
                    "q": term,
                    "location.address": "United Kingdom",
                    "employment_type": "INTERN",
                    "jlo": "en_US",
                    "num": 50,
                },
                headers={**HEADERS, "Referer": "https://careers.google.com/"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Google ({term}): HTTP {resp.status_code}")
                continue
            for job in resp.json().get("jobs", []):
                jid = job.get("id") or job.get("title", "")
                if jid in seen:
                    continue
                seen.add(jid)
                title = job.get("title", "")
                location = ""
                for loc in job.get("locations", []):
                    if isinstance(loc, dict):
                        location = loc.get("display", "") or loc.get("city", "")
                        if location:
                            break
                    elif isinstance(loc, str):
                        location = loc
                        break
                rel_url = job.get("relative_url") or job.get("apply_url") or ""
                job_url = (
                    f"https://careers.google.com{rel_url}"
                    if rel_url and rel_url.startswith("/")
                    else rel_url
                )
                if not is_relevant(title, "Google", location):
                    continue
                if insert_job({
                    "company":  "Google",
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Google Careers",
                }, existing_keys):
                    count += 1
            time.sleep(1)
        except Exception as e:
            print(f"  Error Google ({term}): {e}")
    print(f"  Added {count} from Google Careers")
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


# ─── AMAZON JOBS ─────────────────────────────────────────────────────────────

def scrape_amazon(existing_keys: set) -> int:
    """Scrape Amazon UK student roles from amazon.jobs JSON API."""
    print("\nScraping Amazon Jobs (UK)...")
    count = 0
    for query in ["software intern", "data intern", "engineer intern"]:
        try:
            resp = requests.get(
                "https://www.amazon.jobs/en/search.json",
                params={
                    "base_query": query,
                    "country":    "GBR",
                    "result_limit": "50",
                    "sort":       "relevant",
                },
                headers={**HEADERS, "Referer": "https://www.amazon.jobs/"},
                timeout=15,
            )
            if resp.status_code != 200:
                print(f"  Amazon ({query}): HTTP {resp.status_code}")
                continue
            for job in resp.json().get("jobs", []):
                title = job.get("title", "")
                city = job.get("city", "")
                country_code = job.get("country_code", "")
                location = (
                    f"{city}, UK"
                    if city and country_code == "GBR"
                    else city or ""
                )
                path = job.get("job_path", "")
                job_url = f"https://www.amazon.jobs{path}" if path else ""
                if not is_relevant(title, "Amazon", location):
                    continue
                if insert_job({
                    "company":  "Amazon",
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Amazon Jobs",
                }, existing_keys):
                    count += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error Amazon ({query}): {e}")
    print(f"  Added {count} from Amazon Jobs")
    return count


# ─── MILKROUND (UK student jobs) ──────────────────────────────────────────────

def scrape_milkround(existing_keys: set) -> int:
    # I scrape Milkround's tech/engineering jobs section for UK student roles.
    # Milkround is a major UK student job board with placement and internship listings.
    print("\nScraping Milkround (UK student jobs)...")
    count = 0
    keywords = ["software", "engineering", "technology", "data", "intern", "placement"]
    for keyword in keywords:
        url = f"https://www.milkround.com/jobs/{keyword}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                print(f"  Milkround ({keyword}): HTTP {resp.status_code}")
                continue
            soup = BeautifulSoup(resp.text, "html.parser")
            # I look for job cards - Milkround uses article elements with job listings
            job_cards = soup.find_all("article", class_=re.compile("job|listing|card"))
            if not job_cards:
                # Fallback: try finding by data attributes or generic containers
                job_cards = soup.find_all("div", attrs={"data-testid": re.compile("job|listing")})
            for card in job_cards[:20]:  # Limit per keyword to avoid spam
                try:
                    title_elem = card.find("h2") or card.find("h3") or card.find("a")
                    title = title_elem.get_text(strip=True) if title_elem else ""
                    company_elem = card.find(class_=re.compile("company|employer"))
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    location_elem = card.find(class_=re.compile("location|city"))
                    location = location_elem.get_text(strip=True) if location_elem else "United Kingdom"
                    link_elem = card.find("a", href=True)
                    job_url = link_elem["href"] if link_elem else ""
                    if job_url and not job_url.startswith("http"):
                        job_url = f"https://www.milkround.com{job_url}"
                    if not is_relevant_job(title, company, location):
                        continue
                    if insert_job({
                        "company": company,
                        "role": title,
                        "type": infer_type(title),
                        "url": job_url,
                        "location": normalize_location(location),
                        "source": "Milkround",
                    }, existing_keys):
                        count += 1
                except Exception as e:
                    continue
            time.sleep(1)  # Be polite to Milkround servers
        except Exception as e:
            print(f"  Error Milkround ({keyword}): {e}")
    print(f"  Added {count} from Milkround")
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

def delete_stale_entries() -> None:
    # I delete scraped entries that have not been seen in 30 days instead of
    # wiping the whole board. This means a job that disappears for a day does
    # not get lost - it only expires after a full month of absence.
    cutoff = (datetime.utcnow() - timedelta(days=30)).isoformat()
    try:
        supabase.table("applications").delete() \
            .eq("status", "scraped") \
            .lt("last_scraped_at", cutoff) \
            .execute()
        print(f"Deleted scraped entries not seen since {cutoff[:10]}")
    except Exception as e:
        print(f"Warning: could not delete stale entries: {e}")


def refresh_seen_timestamps() -> None:
    # I batch-update last_scraped_at for all entries seen this run so the
    # 30-day stale delete does not remove jobs that are still live on the
    # source sites. I only touch last_scraped_at - all other columns
    # (status, notes, starred etc.) remain exactly as the user left them.
    if not _seen_urls:
        return
    seen_list = list(_seen_urls)
    now = datetime.utcnow().isoformat()
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

    print(f"Job scraper starting at {datetime.now().isoformat()}")
    # I delete rows not seen in 30 days at the start of each run.
    # Only manually-added rows (status != "scraped") are preserved.
    delete_stale_entries()
    # I load existing keys after the stale delete so the set reflects
    # current DB state.
    existing_keys = load_existing_keys()
    print(f"Found {len(existing_keys)} existing applications in DB")

    total = 0

    # I run The Trackr first because it requires a headless browser and is the
    # most likely to fail - if it crashes the rest of the run still completes.
    total += scrape_trackr_all(existing_keys)

    # I run the JSON API scrapers next because they are the most reliable and
    # fastest - no HTML parsing involved.
    print("\n--- Greenhouse ---")
    for slug, name in GREENHOUSE_COMPANIES:
        n = scrape_greenhouse(slug, name, existing_keys)
        # I only print companies that actually yielded new rows so the log
        # stays readable.
        if n:
            print(f"  {name}: {n}")
        total += n

    print("\n--- Lever ---")
    for slug, name in LEVER_COMPANIES:
        n = scrape_lever(slug, name, existing_keys)
        if n:
            print(f"  {name}: {n}")
        total += n

    print("\n--- Ashby ---")
    for slug, name in ASHBY_COMPANIES:
        n = scrape_ashby(slug, name, existing_keys)
        if n:
            print(f"  {name}: {n}")
        total += n

    print("\n--- SmartRecruiters ---")
    for company_id, name in SMARTRECRUITERS_COMPANIES:
        n = scrape_smartrecruiters(company_id, name, existing_keys)
        if n:
            print(f"  {name}: {n}")
        total += n

    # Custom scrapers for big-tech companies that use their own ATS platforms
    # and are therefore not reachable via Greenhouse/Lever/Ashby.
    print("\n--- Big Tech Custom Scrapers ---")
    total += scrape_apple(existing_keys)
    total += scrape_google(existing_keys)
    total += scrape_microsoft(existing_keys)
    total += scrape_amazon(existing_keys)

    # I run the HTML scrapers after the API scrapers because they are slower
    # and more fragile - they are also the most likely to get rate-limited.
    total += scrape_gradcracker(existing_keys)
    total += scrape_ratemyplacement(existing_keys)
    total += scrape_targetjobs(existing_keys)
    total += scrape_brightnetwork(existing_keys)
    total += scrape_totaljobs(existing_keys)
    total += scrape_prospects(existing_keys)
    total += scrape_milkround(existing_keys)

    print("\n--- Reed ---")
    total += scrape_reed(existing_keys)

    print("\n--- Adzuna ---")
    total += scrape_adzuna(existing_keys)

    print("\n--- Jooble ---")
    total += scrape_jooble(existing_keys)

    print("\n--- Arbeitnow ---")
    total += scrape_arbeitnow(existing_keys)

    print("\n--- Jobicy ---")
    total += scrape_jobicy(existing_keys)

    # I run Remotive last because it is a dedicated full-time job source
    # (not an internship source) and only feeds the Jobs tab.
    total += scrape_remotive(existing_keys)

    # I refresh timestamps for all entries seen this run without overwriting
    # any user-set fields - this is what keeps jobs alive past the 30-day stale
    # delete without resetting statuses the user has changed.
    refresh_seen_timestamps()

    # I send a Discord alert with all newly found student roles so I know
    # what came in from today's run without waiting for the Sunday digest.
    if _new_jobs:
        print(
            f"\nSending Discord alert for {len(_new_jobs)} new student roles..."
        )
        send_discord_alert(_new_jobs)

    print(f"\nDone. Added {total} new jobs.")


if __name__ == "__main__":
    main()
