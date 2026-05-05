import json
import argparse
import sys
import logging
from jobspy import scrape_jobs

# Silence logging
logging.getLogger().setLevel(logging.CRITICAL)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site_name", type=str)
    parser.add_argument("--search_term", type=str)
    parser.add_argument("--location", type=str)
    parser.add_argument("--distance", type=int)
    parser.add_argument("--job_type", type=str)
    parser.add_argument("--results_wanted", type=int, default=10)
    parser.add_argument("--country_indeed", type=str)
    parser.add_argument("--format", type=str)
    parser.add_argument("--verbose", type=int)
    # Ignores other flags to prevent crash
    args, unknown = parser.parse_known_args()

    # Parse comma separated sites
    sites = ["indeed", "linkedin"]
    if args.site_name:
        sites = [s.strip() for s in args.site_name.replace('"', '').replace("'", "").split(',')]

    search_term = args.search_term.replace('"', '').replace("'", "") if args.search_term else None
    location = args.location.replace('"', '').replace("'", "") if args.location else None

    try:
        jobs = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            distance=args.distance,
            job_type=args.job_type,
            results_wanted=args.results_wanted,
            country_indeed=args.country_indeed or "india" if "india" in (location or "").lower() else "usa"
        )
        
        if jobs is not None and not jobs.empty:
            print(jobs.to_json(orient="records"))
        else:
            print("[]")
    except Exception as e:
        print("[]", file=sys.stderr)
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
