"""
Job Scraper - runs via GitHub Actions every 30 minutes.

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
import time
import json
import hashlib
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime

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

# I require at least one of these terms to confirm the role is student-facing
# rather than a permanent position that happens to mention "software".
STUDENT_TERMS = [
    "intern", "internship", "placement", "spring week", "spring insight",
    "insight week", "insight programme", "industrial placement",
    "year in industry", "summer", "co-op", "coop", "apprentice",
    "apprenticeship", "early career", "early talent", "new grad",
    "graduate scheme", "graduate programme", "off-cycle",
    "discovery programme", "work experience", "penultimate",
    "undergraduate", "student", "campus", "university",
]

# I only include London, Birmingham, Manchester (and areas within ~10 miles)
# plus Remote/Hybrid UK. Anything explicitly US or non-UK is rejected.
TARGET_LOCATIONS = [
    # London and Greater London
    "london", "canary wharf", "croydon", "ilford", "bromley", "harrow",
    "sutton", "kingston", "richmond", "wimbledon", "stratford", "greenwich",
    "hackney", "islington", "lambeth", "southwark", "wandsworth",
    # Birmingham and within ~10 miles
    "birmingham", "coventry", "wolverhampton", "solihull", "walsall",
    "west bromwich", "dudley", "sandwell", "sutton coldfield",
    # Manchester and within ~10 miles
    "manchester", "salford", "stockport", "oldham", "rochdale",
    "bolton", "bury", "trafford", "altrincham", "stretford",
    # Remote UK
    "remote", "work from home", "hybrid",
    # UK-wide (no city specified)
    "uk", "united kingdom", "england", "nationwide", "great britain",
]

# I reject any location that is explicitly in the US or clearly non-UK.
US_LOCATIONS = [
    "new york", "san francisco", "los angeles", "los angeles, ca",
    "seattle", "boston", "chicago", "austin", "denver", "atlanta",
    "miami", "dallas", "philadelphia", "portland", "san jose",
    "california", "new jersey", "texas", "washington, dc", "washington d.c.",
    "united states", "usa", "u.s.a", "u.s.", "north america",
]

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


def is_location_ok(location: str, is_priority: bool) -> bool:
    """True if the location is one of Isaac's target areas or unknown."""
    if not location:
        return True  # no location = include (many postings omit it)
    loc = location.lower()
    # Explicitly US = always reject regardless of company tier
    if any(us in loc for us in US_LOCATIONS):
        return False
    # UK target city/region = always accept
    if any(uk in loc for uk in TARGET_LOCATIONS):
        return True
    # Priority company + unknown non-US foreign location = accept
    # (e.g. "Global" or "Europe" at Goldman Sachs is likely London-relevant)
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
    "twilio", "sendgrid", "vonage", "bandwidth",
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
        return {
            dedupe_key(r["company"], r["role"], r.get("url") or "")
            for r in (res.data or [])
        }
    except Exception as e:
        # I log and continue rather than crashing - worst case I insert some
        # duplicates which are easy to clean up in Supabase.
        print(f"Warning: could not load existing keys: {e}")
        return set()


# ─── RELEVANCE ──────────────────────────────────────────────────────────────

def is_student_role(
    title: str, dept_names: list[str] | None = None
) -> bool:
    """Return True if this role is student/intern/placement facing."""
    # I check the title first because it is always present.
    t = title.lower()
    if any(term in t for term in STUDENT_TERMS):
        return True
    # I fall back to department names as a secondary signal for companies that
    # route all graduate roles through a dedicated department without labelling
    # each title individually.
    if dept_names:
        d = " ".join(dept_names).lower()
        if any(term in d for term in STUDENT_DEPTS):
            return True
    return False


def is_relevant_job(title: str) -> bool:
    """True if this is a full-time tech role (NOT a student/intern role).

    I use this for the Jobs tab. No location check - Jobs are anywhere.
    """
    # Must NOT be a student-facing role
    if is_student_role(title, None):
        return False
    title_lower = title.lower()
    return any(k in title_lower for k in TECH_KEYWORDS)


def is_relevant(
    title: str,
    company: str,
    location: str = "",
    dept_names: list[str] | None = None,
) -> bool:
    """True if this role should be saved.

    I require a student signal and a tech keyword for ALL companies - no
    exceptions. Priority companies only get a pass on strict location matching
    (they may not always label UK offices explicitly), but US locations are
    rejected for everyone.
    """
    # Step 1: must be student-facing - no full-time roles, ever
    if not is_student_role(title, dept_names):
        return False

    # Step 2: must be tech-related
    title_lower = title.lower()
    has_keyword = any(k in title_lower for k in TECH_KEYWORDS)
    if not has_keyword:
        return False

    # Step 3: location must be Isaac's target areas (or unknown)
    is_priority = any(p in company.lower() for p in PRIORITY_COMPANIES)
    return is_location_ok(location, is_priority)


def infer_type(title: str) -> str:
    # I infer the role type from keywords in the title rather than relying on
    # the source's categorisation because different boards use inconsistent
    # labels for the same role type.
    t = title.lower()
    if "placement" in t or "year in industry" in t or "industrial" in t:
        return "Industrial Placement"
    if "graduate scheme" in t or "graduate programme" in t:
        return "Graduate"
    if "spring" in t or "insight" in t or "discovery" in t:
        return "Spring Week"
    if "summer" in t:
        return "Summer Internship"
    if "apprentice" in t:
        return "Apprenticeship"
    if "new grad" in t or "university grad" in t:
        return "Graduate"
    # I default to "internship" so the DB type column is never empty.
    return "internship"


# ─── INSERT ─────────────────────────────────────────────────────────────────

def insert_job(job: dict, existing_keys: set) -> bool:
    # I use a different date cutoff for full-time jobs (Jan 2026) vs internships (Sep 2025)
    cutoff = JOB_CUTOFF if job.get("type") == "Full-time Job" else CYCLE_CUTOFF
    if not is_date_relevant(job.get("deadline"), cutoff):
        return False

    # I check the in-memory set before hitting the DB so deduplication costs
    # zero network round trips.
    key = dedupe_key(job["company"], job["role"], job.get("url", ""))
    if key in existing_keys:
        return False

    record = {
        "company":  job["company"],
        "role":     job["role"],
        "type":     job.get("type", "internship"),
        # I use "scraped" so I can filter auto-discovered roles from ones I
        # manually added in the dashboard.
        "status":       "scraped",
        "url":          job.get("url", ""),
        "location":     job.get("location", ""),
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
    }

    try:
        supabase.table("applications").insert(record).execute()
        # I add the key to the in-memory set immediately so subsequent
        # duplicates within the same run are caught without another DB query.
        existing_keys.add(key)
        print(f"  + {job['company']} | {job['role']}")
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
        ("summer-internships",    "Summer Internship"),
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
                    if not is_relevant(programme, company):
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
            elif is_relevant_job(title):
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
            # I prefer hostedUrl over applyUrl because it shows the full JD.
            job_url = job.get("hostedUrl", "")

            if is_relevant(title, company_name, location):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     infer_type(title),
                    "url":      job_url,
                    "location": location,
                    "source":   "Lever",
                }, existing_keys):
                    count += 1
            elif is_relevant_job(title):
                if insert_job({
                    "company":  company_name,
                    "role":     title,
                    "type":     "Full-time Job",
                    "url":      job_url,
                    "location": location,
                    "source":   "Lever",
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
            elif is_relevant_job(title):
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
            "Summer Internship",
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
    ("coinbase",          "Coinbase"),
    ("samsara",           "Samsara"),
    ("coreweave",         "CoreWeave"),
    ("anduril",           "Anduril Industries"),
    ("scaleai",           "Scale AI"),
    # Fintech & payments
    ("brex",              "Brex"),
    ("ramp",              "Ramp"),
    ("plaid",             "Plaid"),
    ("rippling",          "Rippling"),
    # Trading & quant
    ("citadel",           "Citadel"),
    ("citadelsecurities", "Citadel Securities"),
    ("akunacapital",      "Akuna Capital"),
    ("imc",               "IMC Trading"),
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
]


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
                if not is_relevant_job(title):
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


# ─── MAIN ───────────────────────────────────────────────────────────────────

def reset_scraped_entries() -> None:
    # I delete all previously scraped entries before each run so the DB
    # reflects only the latest scraper output. Manually added entries are safe
    # because they have a status other than "scraped".
    try:
        supabase.table("applications").delete().eq("status", "scraped").execute()
        print("Cleared previous scraped entries")
    except Exception as e:
        print(f"Warning: could not clear scraped entries: {e}")


def main():
    print(f"Job scraper starting at {datetime.now().isoformat()}")
    # I wipe all previous scraped rows first so stale/bad entries never
    # accumulate. Only manually-added rows (status != "scraped") are preserved.
    reset_scraped_entries()
    # I load existing keys after the reset so the set only contains manual entries.
    existing_keys = load_existing_keys()
    print(f"Found {len(existing_keys)} manual applications in DB")

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

    # I run the HTML scrapers last because they are the slowest and most
    # fragile - they are also the most likely to get rate-limited.
    total += scrape_gradcracker(existing_keys)
    total += scrape_ratemyplacement(existing_keys)
    total += scrape_targetjobs(existing_keys)
    total += scrape_brightnetwork(existing_keys)
    total += scrape_totaljobs(existing_keys)
    total += scrape_prospects(existing_keys)

    # I run Remotive last because it is a dedicated full-time job source
    # (not an internship source) and only feeds the Jobs tab.
    total += scrape_remotive(existing_keys)

    print(f"\nDone. Added {total} new jobs.")


if __name__ == "__main__":
    main()
