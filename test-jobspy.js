const { execSync } = require('child_process');

function buildCommandArgs(params) {
  const args = [];
  if (params.siteNames) args.push('--site_name', `"${params.siteNames}"`);
  if (params.searchTerm) args.push('--search_term', `"${params.searchTerm}"`);
  if (params.location) args.push('--location', `"${params.location}"`);
  if (params.resultsWanted) args.push('--results_wanted', `${params.resultsWanted}`);
  args.push('--format', 'json');
  return args;
}

try {
  console.log("Starting JobSpy Docker Test...");
  const params = {
    searchTerm: "Data Scientist",
    location: "India",
    siteNames: "indeed,linkedin",
    resultsWanted: 5
  };
  
  const args = buildCommandArgs(params);
  const cmd = `docker run jobspy ${args.join(' ')}`;
  
  console.log(`Executing Command: ${cmd}`);
  
  // Running synchronously and allowing stderr to print if any python exceptions occur
  const result = execSync(cmd, { stdio: 'pipe' }).toString();
  
  console.log("\n--- DOCKER RAW STDOUT ---");
  // Only print first 1000 characters if it's huge
  console.log(result.substring(0, 1000) + (result.length > 1000 ? "\n...[truncated]" : ""));
  
  const parsedData = JSON.parse(result);
  console.log(`\n✅ TEST SUCCESS: Parsed ${parsedData.length} jobs.`);
} catch (error) {
  console.error("\n❌ TEST FAILED");
  console.error("Error Message:", error.message);
  if (error.stderr) {
    console.error("\n--- DOCKER RAW STDERR ---");
    console.error(error.stderr.toString());
  }
}
