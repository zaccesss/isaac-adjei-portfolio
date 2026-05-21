"""
Job Scraper - runs via GitHub Actions every 30 minutes.
Scrapes UK tech roles from the-trackr.com, BrightNetwork and TargetJobs.
Writes new listings to Supabase applications table with status "scraped".
Skips duplicates based on company + programme name.
"""

import os
import time
import json
import hashlib
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime, date

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    "Accept-Language": "en-GB,en;q=0.9",
}

# Roles and locations Isaac is interested in
TARGET_KEYWORDS = [
    "software", "engineer", "developer", "intern", "placement", "technology",
    "data", "ai", "machine learning", "embedded", "electronic", "hardware",
    "firmware", "fpga", "computer science", "computing", "cyber", "security",
    "devops", "cloud", "backend", "frontend", "fullstack", "full stack",
    "graduate", "spring week", "insight", "industrial placement",
]

TARGET_LOCATIONS = [
    "london", "birmingham", "remote", "hybrid", "work from home",
    "england", "uk", "united kingdom", "nationwide", "flexible",
]

# Companies to always include regardless of keyword matching
PRIORITY_COMPANIES = {
    "google", "amazon", "apple", "microsoft", "meta", "netflix", "nvidia",
    "arm", "rolls-royce", "rolls royce", "sky", "skyscanner", "spotify",
    "github", "playstation", "sony", "bbc", "bt", "deloitte", "pwc",
    "goldman sachs", "morgan stanley", "jpmorgan", "bloomberg",
    "deepmind", "anthropic", "openai", "palantir", "cloudflare",
    "salesforce", "oracle", "sap", "ibm", "intel", "amd",
    "qualcomm", "siemens", "bosch", "jlr", "jaguar land rover",
    "aston martin", "dyson", "mclaren", "national grid", "nhs",
    "gchq", "hmrc", "civil service", "dstl", "qinetiq",
}


def dedupe_key(company: str, programme: str) -> str:
    raw = f"{company.lower().strip()}|{programme.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def load_existing_keys() -> set:
    """Load company+programme combos already in the DB to avoid duplicates."""
    try:
        res = supabase.table("applications").select("company,role").execute()
        return {dedupe_key(r["company"], r["role"]) for r in (res.data or [])}
    except Exception as e:
        print(f"Warning: could not load existing keys: {e}")
        return set()


def is_relevant(title: str, company: str, location: str = "") -> bool:
    """Return True if this role is worth saving."""
    title_lower = title.lower()
    company_lower = company.lower()
    location_lower = location.lower()

    if any(c in company_lower for c in PRIORITY_COMPANIES):
        return True

    keyword_match = any(k in title_lower for k in TARGET_KEYWORDS)
    location_match = not location or any(loc in location_lower for loc in TARGET_LOCATIONS)

    return keyword_match and location_match


def insert_job(job: dict, existing_keys: set) -> bool:
    """Insert a job if not already present. Returns True if inserted."""
    key = dedupe_key(job["company"], job["role"])
    if key in existing_keys:
        return False

    # Map scraper type to our applications table type
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


# ─── SCRAPERS ────────────────────────────────────────────────────────────────

def scrape_trackr(category: str, job_type: str, existing_keys: set) -> int:
    """Scrape the-trackr.com for a given category URL."""
    url = f"https://app.the-trackr.com/uk-technology/{category}"
    print(f"\nScraping Trackr: {url}")
    count = 0
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")

        rows = soup.select("tr")
        for row in rows:
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

            # Dates
            opening_date = None
            closing_date = None
            date_cols = [c.get_text(strip=True) for c in cols if c.get_text(strip=True)]
            for dc in date_cols:
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

            if not company or not programme:
                continue

            if not is_relevant(programme, company):
                continue

            job = {
                "company": company,
                "role": programme,
                "type": job_type,
                "url": job_url,
                "source": "The Trackr",
                "deadline": closing_date,
                "notes": f"Opening: {opening_date}" if opening_date else "",
            }

            if insert_job(job, existing_keys):
                count += 1

        time.sleep(1)
    except Exception as e:
        print(f"  Error scraping Trackr {category}: {e}")
    return count


def scrape_brightnetwork(existing_keys: set) -> int:
    """Scrape BrightNetwork internships and placements."""
    print("\nScraping BrightNetwork...")
    count = 0
    search_urls = [
        ("https://www.brightnetwork.co.uk/search/?search=software+engineer+internship&location=london", "internship"),
        ("https://www.brightnetwork.co.uk/search/?search=software+engineer+placement&location=london", "Industrial Placement"),
        ("https://www.brightnetwork.co.uk/search/?search=technology+internship&location=birmingham", "internship"),
        ("https://www.brightnetwork.co.uk/search/?search=engineering+intern+uk+remote", "internship"),
    ]

    for url, job_type in search_urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")

            cards = soup.select("[data-testid='job-card'], .job-card, article.opportunity")
            for card in cards:
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

                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                job = {
                    "company": company,
                    "role": title,
                    "type": job_type,
                    "url": link,
                    "location": location,
                    "source": "BrightNetwork",
                }
                if insert_job(job, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping BrightNetwork: {e}")

    return count


def scrape_targetjobs(existing_keys: set) -> int:
    """Scrape TargetJobs for UK tech roles."""
    print("\nScraping TargetJobs...")
    count = 0
    urls = [
        ("https://targetjobs.co.uk/internships/it-and-technology", "internship"),
        ("https://targetjobs.co.uk/placements/it-and-technology", "Industrial Placement"),
        ("https://targetjobs.co.uk/graduate-jobs/it-and-technology", "Graduate"),
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

                if not company or not title:
                    continue
                if not is_relevant(title, company, location):
                    continue

                job = {
                    "company": company,
                    "role": title,
                    "type": job_type,
                    "url": link,
                    "location": location,
                    "source": "TargetJobs",
                }
                if insert_job(job, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping TargetJobs {url}: {e}")

    return count


def scrape_company_careers(existing_keys: set) -> int:
    """Direct company careers pages for priority firms."""
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

                if not title:
                    continue
                if not is_relevant(title, page["company"], location):
                    continue

                job = {
                    "company": page["company"],
                    "role": title,
                    "type": page["type"],
                    "url": link if link.startswith("http") else page["url"],
                    "location": location,
                    "source": "Company Website",
                }
                if insert_job(job, existing_keys):
                    count += 1

            time.sleep(2)
        except Exception as e:
            print(f"  Error scraping {page['company']}: {e}")

    return count


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    print(f"Job scraper starting at {datetime.now().isoformat()}")
    existing_keys = load_existing_keys()
    print(f"Found {len(existing_keys)} existing applications in DB")

    total = 0

    # The Trackr - all categories
    total += scrape_trackr("summer-internships", "Summer Internship", existing_keys)
    total += scrape_trackr("industrial-placements", "Industrial Placement", existing_keys)
    total += scrape_trackr("graduate-schemes", "Graduate", existing_keys)
    total += scrape_trackr("spring-weeks", "Spring Week", existing_keys)

    # Other job boards
    total += scrape_brightnetwork(existing_keys)
    total += scrape_targetjobs(existing_keys)
    total += scrape_company_careers(existing_keys)

    print(f"\nDone. Added {total} new jobs.")


if __name__ == "__main__":
    main()
