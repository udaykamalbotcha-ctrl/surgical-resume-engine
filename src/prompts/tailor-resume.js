export const tailorResumePrompt = (server) => {
  server.prompt(
    'tailor_resume',
    'Trigger the Brain vs Jailer AI tailoring protocol',
    {},
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `We are implementing a "Brain vs. Jailer" Architecture for the tailor_resume tool.

You (the Agent) will trigger the \`tailor_resume\` tool. The tool itself contains a direct LLM integration (The Brain) and a strict verification layer (The Jailer). 

Your job is simply to pass the full \`resumeText\` and the target \`job\` to the tool.

### The Tool's Internal Protocol (What you should know):
1. **Deep Structural Parser**: The tool parses the source resume to extract exact names, companies, projects, and text.
2. **The Brain (Gemini)**: The tool uses a live LLM to rewrite bullet points, injecting target JD keywords naturally (≤10% change).
3. **The Jailer**: The tool runs strict code-based verifications. If the Brain hallucinated a company, leaked meta-instructions, or altered the text volume by >15%, the Jailer will reject the output and force the Brain to retry. 
4. **The Fresher Safeguard**: If the parser detects no professional experience, the Brain is instructed to drop the "Professional Experience" header entirely and prioritize "Technical Engagements" and "Relevant Coursework".

Trigger the tool now. Do not attempt to summarize or tailor the resume yourself. Rely entirely on the \`tailor_resume\` tool to return the final ATS-optimized LaTeX and the success report.`,
          },
        },
      ],
    })
  );
};
