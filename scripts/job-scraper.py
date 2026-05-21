"""
Job Scraper - runs via GitHub Actions every 30 minutes.
Sources: The Trackr, BrightNetwork, TargetJobs, Gradcracker, RateMyPlacement,
         Milkround, Greenhouse API (Cloudflare, Stripe, Figma, Anthropic, etc.),
         Lever API (Palantir, Canva, Discord, etc.), and direct company career pages.
Writes new listings to Supabase applications table with status "scraped".
Skips duplicates based on company + role name.
"""

import os
import time
import hashlib
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    "Accept-Language": "en-GB,en;q=0.9",
}

TARGET_KEYWORDS = [
    "software", "engineer", "developer", "intern", "placement", "technology",
    "data", "ai", "machine learning", "embedded", "electronic", "hardware",
    "firmware", "fpga", "computer science", "computing", "cyber", "security",
    "devops", "cloud", "backend", "frontend", "fullstack", "full stack",
    "graduate", "spring week", "insight", "industrial placement", "swe",
    "infrastructure", "networking", "systems", "platform", "reliability",
]

TARGET_LOCATIONS = [
    "london", "birmingham", "manchester", "edinburgh", "cambridge", "bristol",
    "remote", "hybrid", "work from home", "england", "uk", "united kingdom",
    "nationwide", "flexible", "europe",
]

PRIORITY_COMPANIES = {
    "google", "amazon", "apple", "microsoft", "meta", "netflix", "nvidia",
    "arm", "rolls-royce", "rolls royce", "sky", "skyscanner", "spotify",
    "github", "playstation", "sony", "bbc", "bt", "deloitte", "pwc",
    "goldman sachs", "morgan stanley", "jpmorgan", "bloomberg",
    "deepmind", "anthropic", "openai", "palantir", "cloudflare",
    "salesforce", "oracle", "sap", "ibm", "intel", "amd", "qualcomm",
    "siemens", "bosch", "jlr", "jaguar land rover", "aston martin",
    "dyson", "mclaren", "national grid", "nhs", "gchq", "hmrc",
    "civil service", "dstl", "qinetiq", "stripe", "figma", "notion",
    "jane street", "citadel", "two sigma", "jump trading", "optiver",
    "de shaw", "susquehanna", "flow traders", "virtu", "imc trading",
    "databricks", "snowflake", "hashicorp", "grafana", "mongodb",
    "elastic", "confluent", "datadog", "fastly", "akamai", "digitalocean",
    "canonical", "red hat", "jetbrains", "atlassian", "shopify",
    "block", "square", "brex", "revolut", "monzo", "wise",
    "starling", "checkout.com", "klarna", "adyen", "rapyd",
    "waymo", "cruise", "zoox", "aurora", "mobileye",
    "hugging face", "cohere", "mistral", "stability ai",
    "boeing", "airbus", "bae systems", "leonardo", "thales",
    "ericsson", "nokia", "mediatek", "broadcom",
}


def dedupe_key(company: str, role: str) -> str:
    raw = f"{company.lower().strip()}|{role.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def load_existing_keys() -> set:
    try:
        res = supabase.table("applications").select("company,role").execute()
        return {dedupe_key(r["company"], r["role"]) for r in (res.data or [])}
    except Exception as e:
        print(f"Warning: could not load existing keys: {e}")
        return set()


def is_relevant(title: str, company: str, location: str = "") -> bool:
    title_lower = title.lower()
    company_lower = company.lower()
    location_lower = location.lower()

    if any(c in company_lower for c in PRIORITY_COMPANIES):
        return True

    keyword_match = any(k in title_lower for k in TARGET_KEYWORDS)
    location_match = not location or any(loc in location_lower for loc in TARGET_LOCATIONS)
    return keyword_match and location_match


def insert_job(job: dict, existing_keys: set) -> bool:
    key = dedupe_key(job["company"], job["role"])
    if key in existing_keys:
        return False

    record = {
        "company": job["company"],
        "role": job["role"],
        "type": job.get("type", "internship"),
        "status": "scraped",
        "url": job.get("url", ""),
        "location": job.get("location", ""),
        "notes": job.get("notes", ""),
        "applied_date": None,
        "deadline": job.get("deadline"),
        "salary_range": job.get("salary_range", ""),
        "work_mode": job.get("work_mode", ""),
        "source": job.get("source", ""),
        "starred": False,
    }

    try:
        supabase.table("applications").insert(record).execute()
        existing_keys.add(key)
        print(f"  + {job['company']} | {job['role']}")
        return True
    except Exception as e:
        print(f"  ! Failed to insert {job['company']}: {e}")
        return False


def infer_type(title: str) -> str:
    t = title.lower()
    if "placement" in t or "year in industry" in t:
        return "Industrial Placement"
    if "graduate" in t or "new grad" in t:
        return "Graduate"
    if "spring" in t or "insight" in t or "discovery" in t:
        return "Spring Week"
    if "summer" in t:
        return "Summer Internship"
    if "apprentice" in t:
        return "Apprenticeship"
    if "part-time" in t or "part time" in t:
        return "Part-time"
    return "internship"


# ─── SCRAPERS ─────────────────────────────────────────────────────────────────

def scrape_trackr(category: str, job_type: str, existing_keys: set) -> int:
    url = f"https://app.the-trackr.com/uk-technology/{category}"
    print(f"\nScraping Trackr: {url}")
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")

        for row in soup.select("tr"):
            cols = row.find_all("td")
            if len(cols) < 3:
                continue

            company_el = row.select_one("a[href*='company']") or (cols[1] if len(cols) > 1 else None)
            prog_el = row.select_one("a[href*='programme']") or (cols[2] if len(cols) > 2 else None)

            if not company_el or not prog_el:
                continue

            company = company_el.get_text(strip=True)
            programme = prog_el.get_text(strip=True)
            job_url = prog_el.get("href", "")
            if job_url and not job_url.startswith("http"):
                job_url = f"https://app.the-trackr.com{job_url}"

            opening_date = closing_date = None
            for dc in [c.get_text(strip=True) for c in cols]:
                try:
                    parts = dc.split(" ")
                    if len(parts) == 2 and len(parts[1]) == 2:
                        dt = datetime.strptime(dc, "%d %b %y")
                        if not opening_date:
                            opening_date = dt.strftime("%Y-%m-%d")
                        else:
                            closing_date = dt.strftime("%Y-%m-%d")
                except ValueError:
                    pass

            if not company or not programme or not is_relevant(programme, company):
                continue

            if insert_job({
                "company": company,
                "role": programme,
                "type": job_type,
                "url": job_url,
                "source": "The Trackr",
                "deadline": closing_date,
                "notes": f"Opening: {opening_date}" if opening_date else "",
            }, existing_keys):
                count += 1

        time.sleep(1)
    except Exception as e:
        print(f"  Error scraping Trackr {category}: {e}")
    return count


def scrape_greenhouse(company_slug: str, company_name: str, existing_keys: set) -> int:
    """Scrape any company using Greenhouse's public JSON API."""
    url = f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs?content=true"
    print(f"\nScraping Greenhouse: {company_name}")
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  Greenhouse {company_name}: HTTP {resp.status_code}")
            return 0

        for job in resp.json().get("jobs", []):
            title = job.get("title", "")
            location = job.get("location", {}).get("name", "")
            job_url = job.get("absolute_url", "")

            if not is_relevant(title, company_name, location):
                continue

            if insert_job({
                "company": company_name,
                "role": title,
                "type": infer_type(title),
                "url": job_url,
                "location": location,
                "source": "Greenhouse",
            }, existing_keys):
                count += 1

        time.sleep(1)
    except Exception as e:
        print(f"  Error scraping Greenhouse {company_name}: {e}")
    return count


def scrape_lever(company_slug: str, company_name: str, existing_keys: set) -> int:
    """Scrape any company using Lever's public JSON API."""
    url = f"https://api.lever.co/v0/postings/{company_slug}?mode=json"
    print(f"\nScraping Lever: {company_name}")
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  Lever {company_name}: HTTP {resp.status_code}")
            return 0

        for job in resp.json():
            title = job.get("text", "")
            location = job.get("categories", {}).get("location", "")
            job_url = job.get("hostedUrl", "")

            if not is_relevant(title, company_name, location):
                continue

            if insert_job({
                "company": company_name,
                "role": title,
                "type": infer_type(title),
                "url": job_url,
                "location": location,
                "source": "Lever",
            }, existing_keys):
                count += 1

        time.sleep(1)
    except Exception as e:
        print(f"  Error scraping Lever {company_name}: {e}")
    return count


def scrape_brightnetwork(existing_keys: set) -> int:
    print("\nScraping BrightNetwork...")
    count = 0
    searches = [
        ("https://www.brightnetwork.co.uk/search/?search=software+engineer+internship&location=london", "internship"),
        ("https://www.brightnetwork.co.uk/search/?search=software+engineer+placement+uk", "Industrial Placement"),
        ("https://www.brightnetwork.co.uk/search/?search=technology+internship&location=birmingham", "internship"),
        ("https://www.brightnetwork.co.uk/search/?search=engineering+intern+uk+remote", "internship"),
        ("https://www.brightnetwork.co.uk/search/?search=graduate+software+engineer+uk", "Graduate"),
    ]

    for url, job_type in searches:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for card in soup.select("[data-testid='job-card'], .job-card, article.opportunity"):
                company_el = card.select_one(".company-name, [data-testid='company'], h3")
                title_el = card.select_one(".job-title, [data-testid='job-title'], h2")
                link_el = card.find("a")
                location_el = card.select_one(".location, [data-testid='location']")

                company = company_el.get_text(strip=True) if company_el else ""
                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not link.startswith("http"):
                    link = f"https://www.brightnetwork.co.uk{link}"

                if not company or not title or not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company": company, "role": title, "type": job_type,
                    "url": link, "location": location, "source": "BrightNetwork",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping BrightNetwork: {e}")
    return count


def scrape_targetjobs(existing_keys: set) -> int:
    print("\nScraping TargetJobs...")
    count = 0
    urls = [
        ("https://targetjobs.co.uk/internships/it-and-technology", "internship"),
        ("https://targetjobs.co.uk/placements/it-and-technology", "Industrial Placement"),
        ("https://targetjobs.co.uk/graduate-jobs/it-and-technology", "Graduate"),
        ("https://targetjobs.co.uk/internships/engineering-and-manufacturing", "internship"),
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

                company = company_el.get_text(strip=True) if company_el else ""
                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not link.startswith("http"):
                    link = f"https://targetjobs.co.uk{link}"

                if not company or not title or not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company": company, "role": title, "type": job_type,
                    "url": link, "location": location, "source": "TargetJobs",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping TargetJobs {url}: {e}")
    return count


def scrape_gradcracker(existing_keys: set) -> int:
    """Gradcracker - UK STEM internships and placements, very relevant for EEE."""
    print("\nScraping Gradcracker...")
    count = 0
    urls = [
        ("https://www.gradcracker.com/search/computing-technology/internship-jobs", "internship"),
        ("https://www.gradcracker.com/search/computing-technology/work-placements", "Industrial Placement"),
        ("https://www.gradcracker.com/search/electronic-electrical-engineering/internship-jobs", "internship"),
        ("https://www.gradcracker.com/search/electronic-electrical-engineering/work-placements", "Industrial Placement"),
        ("https://www.gradcracker.com/search/computing-technology/graduate-jobs", "Graduate"),
    ]

    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for item in soup.select(".opportunity, .job-card, article"):
                company_el = item.select_one(".company, .employer, h3")
                title_el = item.select_one(".title, .job-title, h2, a")
                link_el = item.find("a")
                location_el = item.select_one(".location, .place")

                company = company_el.get_text(strip=True) if company_el else ""
                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not link.startswith("http"):
                    link = f"https://www.gradcracker.com{link}"

                if not company or not title or not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company": company, "role": title, "type": job_type,
                    "url": link, "location": location, "source": "Gradcracker",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping Gradcracker {url}: {e}")
    return count


def scrape_ratemyplacement(existing_keys: set) -> int:
    """RateMyPlacement - UK placements and internships."""
    print("\nScraping RateMyPlacement...")
    count = 0
    urls = [
        ("https://www.ratemyplacement.co.uk/jobs?role=technology&type=placement-year", "Industrial Placement"),
        ("https://www.ratemyplacement.co.uk/jobs?role=technology&type=summer-internship", "Summer Internship"),
        ("https://www.ratemyplacement.co.uk/jobs?role=engineering&type=placement-year", "Industrial Placement"),
    ]

    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for item in soup.select(".job-listing, .vacancy-card, article, .opportunity-card"):
                company_el = item.select_one(".company-name, .employer, h3")
                title_el = item.select_one(".job-title, .role-title, h2")
                link_el = item.find("a")
                location_el = item.select_one(".location")

                company = company_el.get_text(strip=True) if company_el else ""
                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not link.startswith("http"):
                    link = f"https://www.ratemyplacement.co.uk{link}"

                if not company or not title or not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company": company, "role": title, "type": job_type,
                    "url": link, "location": location, "source": "RateMyPlacement",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping RateMyPlacement {url}: {e}")
    return count


def scrape_milkround(existing_keys: set) -> int:
    """Milkround - UK graduate and intern jobs."""
    print("\nScraping Milkround...")
    count = 0
    urls = [
        ("https://www.milkround.com/jobs/it-and-internet/internships", "internship"),
        ("https://www.milkround.com/jobs/it-and-internet/placements", "Industrial Placement"),
        ("https://www.milkround.com/jobs/it-and-internet/graduate-jobs", "Graduate"),
        ("https://www.milkround.com/jobs/engineering/internships", "internship"),
    ]

    for url, job_type in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for item in soup.select(".job-card, article, .vacancy, .listing"):
                company_el = item.select_one(".company, .employer, h3")
                title_el = item.select_one(".title, h2, .job-title")
                link_el = item.find("a")
                location_el = item.select_one(".location")

                company = company_el.get_text(strip=True) if company_el else ""
                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not link.startswith("http"):
                    link = f"https://www.milkround.com{link}"

                if not company or not title or not is_relevant(title, company, location):
                    continue

                if insert_job({
                    "company": company, "role": title, "type": job_type,
                    "url": link, "location": location, "source": "Milkround",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping Milkround {url}: {e}")
    return count


def scrape_company_careers(existing_keys: set) -> int:
    """Direct HTML scraping for company career pages."""
    print("\nScraping company careers pages...")
    count = 0

    pages = [
        {
            "company": "ARM",
            "url": "https://careers.arm.com/search-jobs/?keywords=intern+OR+placement+OR+graduate",
            "type": "internship",
            "selector": ".job-listing, .career-item, article",
            "title_sel": "h2, .job-title, a",
            "location_sel": ".location",
        },
        {
            "company": "Rolls-Royce",
            "url": "https://careers.rolls-royce.com/search-jobs?keywords=intern+placement+graduate&location=UK",
            "type": "internship",
            "selector": ".job-card, article",
            "title_sel": "h2, .title, a",
            "location_sel": ".location",
        },
        {
            "company": "Sky",
            "url": "https://careers.sky.com/search-jobs/?keywords=intern+OR+placement+OR+graduate",
            "type": "internship",
            "selector": ".job, article, .vacancy",
            "title_sel": "h2, .job-title, a",
            "location_sel": ".location",
        },
        {
            "company": "Dyson",
            "url": "https://careers.dyson.com/en-gb/search/?type=intern",
            "type": "internship",
            "selector": ".job-card, article, .role",
            "title_sel": "h2, .title, a",
            "location_sel": ".location",
        },
        {
            "company": "BAE Systems",
            "url": "https://www.baesystems.com/en/careers/careers-in-baes/students-and-graduates",
            "type": "internship",
            "selector": ".job, article, .vacancy",
            "title_sel": "h2, .title, a",
            "location_sel": ".location",
        },
        {
            "company": "Airbus",
            "url": "https://www.airbus.com/en/careers/working-at-airbus/students-and-graduates",
            "type": "internship",
            "selector": ".job-card, article",
            "title_sel": "h2, .title, a",
            "location_sel": ".location",
        },
    ]

    for page in pages:
        try:
            resp = requests.get(page["url"], headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            for item in soup.select(page["selector"]):
                title_el = item.select_one(page["title_sel"])
                link_el = item.find("a")
                location_el = item.select_one(page["location_sel"])

                title = title_el.get_text(strip=True) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                location = location_el.get_text(strip=True) if location_el else ""

                if not title or not is_relevant(title, page["company"], location):
                    continue

                if insert_job({
                    "company": page["company"],
                    "role": title,
                    "type": page["type"],
                    "url": link if link.startswith("http") else page["url"],
                    "location": location,
                    "source": "Company Website",
                }, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping {page['company']}: {e}")
    return count


# ─── GREENHOUSE COMPANIES ─────────────────────────────────────────────────────

GREENHOUSE_COMPANIES = [
    ("cloudflare", "Cloudflare"),
    ("stripe", "Stripe"),
    ("figma", "Figma"),
    ("anthropic", "Anthropic"),
    ("notion", "Notion"),
    ("duolingo", "Duolingo"),
    ("databricks", "Databricks"),
    ("snowflake", "Snowflake"),
    ("brex", "Brex"),
    ("ramp", "Ramp"),
    ("scaleai", "Scale AI"),
    ("airtable", "Airtable"),
    ("hubspot", "HubSpot"),
    ("intercom", "Intercom"),
    ("zendesk", "Zendesk"),
    ("asana", "Asana"),
    ("squareup", "Block (Square)"),
    ("plaid", "Plaid"),
    ("robinhood", "Robinhood"),
    ("coinbase", "Coinbase"),
    ("rippling", "Rippling"),
    ("mongodb", "MongoDB"),
    ("elastic", "Elastic"),
    ("hashicorp", "HashiCorp"),
    ("grafana", "Grafana Labs"),
    ("sentry", "Sentry"),
    ("vercel", "Vercel"),
    ("linear", "Linear"),
    ("retool", "Retool"),
]

LEVER_COMPANIES = [
    ("palantir", "Palantir"),
    ("netlify", "Netlify"),
    ("pagerduty", "PagerDuty"),
    ("canva", "Canva"),
    ("discord", "Discord"),
    ("reddit", "Reddit"),
    ("twitch", "Twitch"),
    ("lyft", "Lyft"),
]


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    print(f"Job scraper starting at {datetime.now().isoformat()}")
    existing_keys = load_existing_keys()
    print(f"Found {len(existing_keys)} existing applications in DB")

    total = 0

    # The Trackr
    total += scrape_trackr("summer-internships", "Summer Internship", existing_keys)
    total += scrape_trackr("industrial-placements", "Industrial Placement", existing_keys)
    total += scrape_trackr("graduate-schemes", "Graduate", existing_keys)
    total += scrape_trackr("spring-weeks", "Spring Week", existing_keys)

    # UK job boards
    total += scrape_brightnetwork(existing_keys)
    total += scrape_targetjobs(existing_keys)
    total += scrape_gradcracker(existing_keys)
    total += scrape_ratemyplacement(existing_keys)
    total += scrape_milkround(existing_keys)

    # Greenhouse API - reliable JSON, no HTML parsing needed
    for slug, name in GREENHOUSE_COMPANIES:
        total += scrape_greenhouse(slug, name, existing_keys)

    # Lever API
    for slug, name in LEVER_COMPANIES:
        total += scrape_lever(slug, name, existing_keys)

    # Direct company career pages
    total += scrape_company_careers(existing_keys)

    print(f"\nDone. Added {total} new jobs.")


if __name__ == "__main__":
    main()
