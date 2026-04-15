import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testPipeline() {
  console.log("=== PHASE 1: Parsing Resume ===");
  const resumePath = path.resolve("../Uday Kamal Resume.pdf");
  const dataBuffer = fs.readFileSync(resumePath);
  const data = await pdf(dataBuffer);
  const resumeText = data.text;
  console.log(`✅ Resume Parsed successfully. Length: ${resumeText.length} characters.`);

  console.log("\n=== PHASE 2: Extracting Keyword ===");
  const titlePatterns = [
    "data scientist", "machine learning engineer", "ml engineer", "ai engineer",
    "software engineer", "frontend developer", "backend developer", "full stack developer",
    "devops engineer", "product manager", "project manager", "data analyst",
    "cloud architect", "mobile developer", "ios developer", "android developer",
    "ui/ux designer", "systems engineer", "security analyst"
  ];
  const lowerText = resumeText.toLowerCase();
  let search_term = "Software Engineer";
  for (const title of titlePatterns) {
    if (lowerText.includes(title)) {
      search_term = title;
      break;
    }
  }
  console.log(`✅ Extracted Role (Search Term): "${search_term}"`);

  console.log("\n=== PHASE 3: Searching via MCP JobSpy ===");
  const MCP_SERVER_PATH = path.resolve("../src/index.js");
  console.log(`Spawning MCP Server at: ${MCP_SERVER_PATH}`);

  const transport = new StdioClientTransport({
    command: "node",
    args: [MCP_SERVER_PATH]
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  });

  await client.connect(transport);
  console.log("✅ Attached to MCP JobSpy Server via Stdio.");

  console.log("Calling 'search_jobs' tool...");
  const result = await client.callTool({
    name: "search_jobs",
    arguments: {
      searchTerm: search_term,
      location: "India",
      siteNames: "indeed,linkedin",
      resultsWanted: 5,
      format: "json"
    }
  });

  const content = result.content;
  const textContent = content.find(c => c.type === "text");
  
  if (textContent && textContent.text) {
    const parsedData = JSON.parse(textContent.text);
    console.log(`\n🎉 PIPELINE SUCCESS! Scraped ${parsedData.count} jobs matching "${search_term}".`);
    console.log("First job sample:");
    console.log(`- Title: ${parsedData.jobs[0]?.title}`);
    console.log(`- Company: ${parsedData.jobs[0]?.company}`);
    console.log(`- Job URL: ${parsedData.jobs[0]?.jobUrl}`);
  } else {
    console.log("❌ Test failed. No text content returned from MCP.");
  }

  await client.close();
  process.exit(0);
}

testPipeline().catch(console.error);
