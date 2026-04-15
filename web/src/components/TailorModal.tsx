"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, TrendingUp, AlertTriangle, FileDown } from "lucide-react";
import type { TailorReport } from "@/app/actions/search-jobs";

interface TailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TailorReport | null;
  jobTitle: string;
  company: string;
}

export default function TailorModal({ isOpen, onClose, report, jobTitle, company }: TailorModalProps) {
  if (!isOpen || !report) return null;

  const isHighMatch = report.matchScore >= 80;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-card border flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white">ATS Analysis Report</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-sm text-zinc-400 mb-6">
            We tailored your resume for <strong className="text-white">{jobTitle}</strong> at <strong className="text-white">{company}</strong>. 
            The ATS-optimized <strong className="text-purple-400">.pdf</strong> file has automatically downloaded.
          </p>

          {/* Score Box */}
          <div className="flex items-center gap-6 p-5 rounded-xl bg-black/40 border border-white/10 mb-6">
            <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 ${isHighMatch ? "border-green-500/50 text-green-400" : "border-amber-500/50 text-amber-400"}`}>
              <span className="text-2xl font-bold">{report.matchScore}%</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Match Score</h3>
              <p className="text-sm text-zinc-400">
                {isHighMatch 
                  ? "Excellent alignment! Your chances of passing the ATS are very high." 
                  : "Good baseline, but pay attention to the gap analysis below."}
              </p>
            </div>
          </div>

          {/* Keywords Added */}
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Keywords Optimized (Reframed)
            </h3>
            {report.keywordsAdded.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.keywordsAdded.map((kw, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No new keywords were structurally required.</p>
            )}
          </div>

          {/* Gap Analysis */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Gap Analysis & Recommendations
            </h3>
            <ul className="space-y-3">
              {report.gapAnalysis.map((gap, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 mt-4">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
