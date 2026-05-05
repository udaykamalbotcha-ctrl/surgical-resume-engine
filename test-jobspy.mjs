import { execSync } from 'child_process';

try {
  console.log("Starting Python JobSpy Test...");
  
  // A script to grab JSON string of jobs from python
  const pyScript = `
import json
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["indeed", "linkedin"],
    search_term="Data Scientist",
    location="India",
    results_wanted=5,
    country_indeed='India' 
)

# Convert to JSON and print
if jobs is not None and not jobs.empty:
    print(jobs.to_json(orient="records"))
else:
    print("[]")
`;

  const cmd = `python -c "${pyScript.replace(/\n/g, ' ')}"`;
  
  const result = execSync(cmd, { stdio: 'pipe' }).toString();
  
  const parsedData = JSON.parse(result);
  console.log(`\n✅ TEST SUCCESS: Parsed ${parsedData.length} jobs.`);
} catch (error) {
  console.error("\n❌ TEST FAILED");
  console.error("Error Message:", error.message);
  if (error.stderr) {
    console.error("\n--- STDERR ---");
    console.error(error.stderr.toString());
  }
}
