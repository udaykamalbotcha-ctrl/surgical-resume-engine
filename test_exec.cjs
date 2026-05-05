const { execSync } = require('child_process');
try {
  const result = execSync('"C:\\Python314\\python.exe" "c:\\Users\\Hp\\Desktop\\Uday\\Antigravity\\Career Automation app\\src\\tools\\jobspy-cli.py" --search_term "Data Engineer" --location "Pune" --results_wanted 1').toString();
  console.log("Success:", result);
} catch(e) {
  console.error('ERROR:', e.message);
  console.error('STDOUT:', e.stdout?.toString());
  console.error('STDERR:', e.stderr?.toString());
}
