import json
from jobspy import scrape_jobs

# This is a test script to see what data the python package natively returns.
try:
    jobs = scrape_jobs(
        site_name=["indeed", "linkedin"],
        search_term="Data Scientist",
        location="India",
        results_wanted=5,
        country_indeed='India'
    )

    if jobs is not None and not jobs.empty:
        print(jobs.to_json(orient="records"))
    else:
        print("[]")
except Exception as e:
    print("[]")
    print(f"Error scraping: {e}")
