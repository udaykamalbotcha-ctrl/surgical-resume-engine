"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, ExternalLink, Wand2, Loader2 } from "lucide-react";
import type { Job } from "@/types";

interface JobResultsProps {
  jobs: Job[];
  onTailorResume: (job: Job) => void;
  isTailoring: boolean;
  tailoringJobId: string | null;
}

export default function JobResults({ jobs, onTailorResume, isTailoring, tailoringJobId }: JobResultsProps) {
  if (jobs.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Recent";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {jobs.map((job, idx) => {
        const isCurrentTailoring = isTailoring && tailoringJobId === (job.id || String(idx));
        
        return (
          <motion.div
            key={job.id || idx}
            variants={cardVariants}
            className="glass-card p-6 flex flex-col justify-between group hover:shadow-[0_0_24px_rgba(138,43,226,0.12)] transition-all duration-300"
          >
            {/* Header */}
            <div className="flex-1">
              {/* Site badge */}
              {job.site && (
                <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3 uppercase tracking-wide">
                  {job.site}
                </span>
              )}

              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 leading-snug">
                {job.title}
              </h3>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Briefcase className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                  <span className="truncate">{job.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(job.datePosted)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
              <button
                onClick={() => onTailorResume({ ...job, id: job.id || String(idx) })}
                disabled={isTailoring}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 hover:border-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCurrentTailoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Tailor My Resume
                  </>
                )}
              </button>
              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                  title="View job posting"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
