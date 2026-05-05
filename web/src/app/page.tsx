"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight,
  CheckCircle2, AlertCircle, Search, Loader2,
  Mail
} from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import JobResults from "@/components/JobResults";
import TailorModal from "@/components/TailorModal";
import { searchJobs, suggestKeywords, executeResumeTailoring as tailorResume, type TailorReport } from "@/app/actions/search-jobs";
import type { Job } from "@/types";

export default function Home() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Job search state
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("India");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Tailor Resume state
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringJobId, setTailoringJobId] = useState<string | null>(null);
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [tailorReport, setTailorReport] = useState<TailorReport | null>(null);
  const [tailoredJob, setTailoredJob] = useState<{title: string, company: string}>({ title: "", company: "" });

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleUploadSuccess = useCallback(
    (text: string) => {
      setResumeText(text);
      showToast("success", "Resume parsed successfully! Text has been captured.");
    },
    [showToast]
  );

  const handleUploadError = useCallback(
    (error: string) => {
      showToast("error", error);
    },
    [showToast]
  );

  // Auto-suggest keywords when resume is parsed
  useEffect(() => {
    if (resumeText) {
      suggestKeywords(resumeText).then((keywords) => {
        setSearchTerm(keywords);
      });
    }
  }, [resumeText]);

  // Handle job search
  const handleSearchJobs = useCallback(async () => {
    if (!searchTerm.trim()) {
      showToast("error", "Please enter search keywords.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const result = await searchJobs({
      searchTerm: searchTerm.trim(),
      location,
      siteNames: "indeed,linkedin",
      resultsWanted: 10,
    });

    setIsSearching(false);

    if (result.success) {
      setJobs(result.data.jobs);
      showToast(
        "success",
        `Found ${result.data.count} job${result.data.count !== 1 ? "s" : ""} matching your search.`
      );
    } else {
      showToast("error", result.error);
    }
  }, [searchTerm, location, showToast]);

  // Tailor Resume click handler
  const handleTailorResume = useCallback(
    async (job: Job) => {
      if (!resumeText) {
        showToast("error", "Please upload a resume first.");
        return;
      }

      setIsTailoring(true);
      setTailoringJobId(job.id || null);

      try {
        const result = await tailorResume(resumeText, job);

        if (!result.success || !result.bufferObj || !result.report) {
          throw new Error(result.error || "Generation failed silently.");
        }

        // 1. Download the file locally
        const byteCharacters = atob(result.bufferObj);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        // Sanitize filename
        const safeCompany = job.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `Tailored_Resume_${safeCompany}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 2. Open Feedback Modal
        setTailorReport(result.report);
        setTailoredJob({ title: job.title, company: job.company });
        setTailorModalOpen(true);

      } catch (error) {
        console.error("Tailor Error:", error);
        showToast("error", error instanceof Error ? error.message : "Failed to tailor resume.");
      } finally {
        setIsTailoring(false);
        setTailoringJobId(null);
      }
    },
    [resumeText, showToast]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };


  return (
    <div className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -40, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl w-full"
      >
        {/* Hero Section — Dual-Column: Problem vs. Solution */}
        <div className="text-center mb-0">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-custom-purple/10 border border-custom-purple/20 text-custom-purple-light text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-12 text-white leading-none"
          >
            Don&apos;t Just Apply.<br />
            <span className="text-gradient">Be the Perfect Match.</span>
          </motion.h1>

          {/* Dual-Column Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6 mb-12 text-left"
          >
            {/* LEFT — The Problem (Failing Neon) */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 0.55, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl p-8 backdrop-blur-md bg-black/30 border border-white/8 flex flex-col gap-5"
            >
              {/* Analog static noise overlay */}
              <div className="noise-overlay" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="neon-flicker-text text-sm font-bold text-zinc-400 tracking-wide uppercase">The Manual Friction</h2>
              </div>
              <p
                className="text-xl text-zinc-400 leading-relaxed relative z-10"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
              >
                Manual tailoring is a soul-crushing career tax. You sacrifice your evenings to job
                descriptions that might{" "}
                <span className="text-zinc-300 font-medium">never see a human eye.</span>
              </p>
              <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
                <p className="text-xs text-zinc-600 font-mono">STATUS: BROKEN PROCESS</p>
              </div>
            </motion.div>

            {/* RIGHT — The Solution */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              onMouseEnter={() => {
                const cvs = document.querySelector("canvas");
                if (cvs) cvs.style.setProperty("--particle-flare", "1");
                document.querySelector("#solution-card")?.classList.add("flare-active");
              }}
              onMouseLeave={() => {
                document.querySelector("#solution-card")?.classList.remove("flare-active");
              }}
              id="solution-card"
              className="relative rounded-2xl p-8 backdrop-blur-md bg-custom-purple/5 border border-custom-purple/50 flex flex-col gap-5 aura-pulse transition-all duration-500 group"
            >
              {/* Neon glow ring on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-custom-purple/10 via-transparent to-custom-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-custom-purple/20 border border-custom-purple/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-custom-purple-light" />
                </div>
                <h2 className="text-lg font-bold text-custom-purple-light tracking-wide uppercase text-sm">The Surgical Edge</h2>
              </div>
              <p
                className="text-xl text-zinc-200 leading-relaxed relative z-10"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
              >
                This surgical AI engine fetches listings and executes{" "}
                <span className="text-white font-semibold">factual, high-precision edits</span>{" "}
                in seconds. Don&apos;t just land on the desk—
                <span className="text-custom-purple-light font-semibold">lead the list.</span>
              </p>

              {/* Surgical Metrics Badges Footer */}
              <div className="mt-auto pt-4 border-t border-custom-purple/20 relative z-10 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-custom-purple/10 border border-custom-purple/25 text-custom-purple-light text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  100% Factual Grounding
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-custom-purple/10 border border-custom-purple/25 text-custom-purple-light text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  ≤10% Edit Constraint
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById("resume-upload-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-custom-purple-light transition-all flex items-center gap-2 group shadow-lg shadow-custom-purple/20"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </motion.div>
        </div>


        {/* Resume Upload Section */}
        <motion.div
          id="resume-upload-section"
          variants={itemVariants}
          className="mb-16 pt-[20vh]"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">Upload Your Resume</h2>
          <p className="text-zinc-500 text-center mb-8">
            Drop your PDF resume below to get started
          </p>
          <ResumeUpload onSuccess={handleUploadSuccess} onError={handleUploadError} />
        </motion.div>

        {/* Parsed Resume Preview - Interactive Dashboard */}
        <AnimatePresence>
          {resumeText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16 space-y-6"
            >
              <div className="glass-card p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Resume Dashboard
                  </h3>
                  <span className="text-xs font-medium px-2.5 py-1 rounded bg-white/10 text-zinc-300">
                    {Math.ceil(resumeText.length / 5)} words
                  </span>
                </div>
                
                {/* Visual Skill Badges based on text */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {["Python", "Machine Learning", "AWS", "SQL", "React", "Node", "Data Science", "Generative AI"]
                    .filter(skill => resumeText.toLowerCase().includes(skill.toLowerCase()))
                    .map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                        {skill}
                      </span>
                  ))}
                </div>

                {/* Scrolling Raw Text Area */}
                <div className="relative rounded-lg bg-black/40 border border-white/5 p-4">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none rounded-t-lg z-10" />
                  <pre className="text-sm text-zinc-400 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed custom-scrollbar relative z-0">
                    {resumeText}
                  </pre>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none rounded-b-lg z-10" />
                </div>
              </div>

              {/* The "Flattery" Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]"
                id="flattery"
              >
                <h3 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Top 3 Things I Loved About Your Resume
                </h3>
                <ul className="space-y-4">
                  {/* Flattery Item 1: Metrics */}
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <span className="text-green-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Strong Focus on Impact Metrics</p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        {resumeText.includes("%") 
                          ? "You explicitly use percentages and numbers to prove your value. Recruiters absolutely love seeing quantifiable results." 
                          : "Your formatting is extremely clean and parseable by standard ATS systems, ensuring you get past the robots."}
                      </p>
                    </div>
                  </li>
                  {/* Flattery Item 2: Modern Tech */}
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <span className="text-green-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Highly Relevant Tech Stack</p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        Your skills section hits all the major keywords in today's tech ecosystem. You are positioning yourself perfectly for modern roles.
                      </p>
                    </div>
                  </li>
                  {/* Flattery Item 3: Seniority/Clarity */}
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <span className="text-green-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Excellent Professional Narrative</p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        Your professional summary clearly defines your value proposition. It's concise and straight to the point without unnecessary fluff.
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Search Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-2xl font-bold mb-2 text-center">Find Your Next Role</h2>
          <p className="text-zinc-500 text-center mb-8">
            {resumeText
              ? "We auto-filled keywords from your resume. Feel free to adjust."
              : "Enter keywords to search for jobs across India."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            {/* Search term input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchJobs()}
                placeholder="e.g. react, python, data analyst…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
                id="search-term-input"
              />
            </div>

            {/* Location input */}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="sm:w-48 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
              id="location-input"
            />

            {/* Search button */}
            <button
              onClick={handleSearchJobs}
              disabled={isSearching}
              className="px-8 py-3 rounded-xl bg-custom-purple text-white font-semibold hover:bg-custom-purple-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-custom-purple/20"
              id="search-jobs-btn"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Jobs
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading Skeleton for Search */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-3 w-16 bg-white/5 rounded mb-4" />
                  <div className="h-5 w-3/4 bg-white/5 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/5 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-white/5 rounded mb-6" />
                  <div className="h-10 w-full bg-white/5 rounded-lg" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Results */}
        {!isSearching && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <JobResults 
              jobs={jobs} 
              onTailorResume={handleTailorResume}
              isTailoring={isTailoring}
              tailoringJobId={tailoringJobId}
            />
          </motion.div>
        )}

        {/* No results message */}
        {!isSearching && hasSearched && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 glass-card mb-10"
          >
            <p className="text-zinc-400">No jobs found. Try different keywords or location.</p>
          </motion.div>
        )}
      </motion.div>

      {/* The Architect Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onMouseEnter={() => {
          const cvs = document.querySelector("canvas");
          if (cvs) cvs.style.setProperty("--particle-flare", "1");
          document.querySelector("#architect-card")?.classList.add("flare-active");
        }}
        onMouseLeave={() => {
          document.querySelector("#architect-card")?.classList.remove("flare-active");
        }}
        id="architect-card"
        className="relative max-w-4xl w-full mx-auto mt-12 mb-8 p-8 md:p-12 rounded-[2rem] backdrop-blur-md bg-white/5 border border-custom-purple/20 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_40px_rgba(176,101,255,0.08)] hover:shadow-[0_0_60px_rgba(176,101,255,0.2)] transition-all duration-500 overflow-hidden group z-10"
      >
        {/* Subtle neon ring on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-custom-purple/10 via-transparent to-custom-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex-1 text-center md:text-left relative z-10">
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase mb-3">Engineered by</p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-5 leading-none font-sans">
            Uday Kamal
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed mb-8 max-w-xl mx-auto md:mx-0">
            Software Engineer specializing in Agent-first AI architectures and high-precision career automation.
          </p>
          <div className="inline-block bg-black/40 border border-white/10 px-4 py-2 rounded-lg shadow-inner">
            <p className="text-[13px] font-mono text-custom-purple-light">
              <span className="text-zinc-500">//</span> 100% Factual Integrity | 0% Hallucinations
            </p>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col gap-4 relative z-10 shrink-0">
          <a href="https://github.com/udaykamalbotcha-ctrl" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-custom-purple-light hover:border-custom-purple/40 hover:bg-custom-purple/10 transition-all group/btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover/btn:scale-110 transition-transform"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.6-.2-1.4-.7-2.6-1.6-3.6.2-.5.3-1.2 0-2.6 0 0-1-.3-3.3 1.2a11 11 0 0 0-6 0c-2.3-1.5-3.3-1.2-3.3-1.2-.3 1.4-.2 2.1 0 2.6-.9 1-1.4 2.2-1.6 3.6 0 3.6 3 5.6 6 5.6a4.8 4.8 0 0 0-1 3.2v4"></path><path d="M9 18c-4.51 1.2-5-2.5-7-3"></path></svg>
          </a>
          <a href="https://www.linkedin.com/in/uday-kamal/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-custom-purple-light hover:border-custom-purple/40 hover:bg-custom-purple/10 transition-all group/btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover/btn:scale-110 transition-transform"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a href="mailto:uday.kamal.botcha@gmail.com" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-custom-purple-light hover:border-custom-purple/40 hover:bg-custom-purple/10 transition-all group/btn">
            <Mail className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
          </a>
        </div>
      </motion.div>

      {/* Tailor Modal */}
      <AnimatePresence>
        {tailorModalOpen && (
          <TailorModal
            isOpen={tailorModalOpen}
            onClose={() => setTailorModalOpen(false)}
            report={tailorReport}
            jobTitle={tailoredJob.title}
            company={tailoredJob.company}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
