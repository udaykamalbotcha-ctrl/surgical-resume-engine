"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, X } from "lucide-react";
import clsx from "clsx";
import { parseResume } from "@/app/actions/parse-resume";

interface ResumeUploadProps {
  onSuccess: (text: string) => void;
  onError?: (error: string) => void;
}

export default function ResumeUpload({ onSuccess, onError }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        onError?.("Please upload a PDF file.");
        return;
      }

      setFileName(file.name);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      const result = await parseResume(formData);

      setIsLoading(false);

      if (result.success) {
        onSuccess(result.text);
      } else {
        onError?.(result.error);
        setFileName(null);
      }
    },
    [onSuccess, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={clsx(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
          "bg-[rgba(255,255,255,0.02)] backdrop-blur-xl",
          isDragging
            ? "border-purple-500 shadow-[0_0_30px_rgba(138,43,226,0.15)]"
            : "border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(138,43,226,0.08)]",
          isLoading && "pointer-events-none opacity-70"
        )}
      >
        {/* Subtle glow on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-purple-500/5 pointer-events-none" />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          id="resume-upload-input"
        />

        <div className="flex flex-col items-center gap-4 relative z-10">
          {isLoading ? (
            <>
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <p className="text-zinc-400">Parsing your resume…</p>
            </>
          ) : fileName ? (
            <>
              <FileText className="w-10 h-10 text-purple-400" />
              <div className="flex items-center gap-2">
                <p className="text-zinc-300 font-medium">{fileName}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <p className="text-sm text-zinc-500">Click to replace</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-zinc-500" />
              <div>
                <p className="text-zinc-300 font-medium">
                  Drop your resume here or{" "}
                  <span className="text-purple-400 underline underline-offset-4">browse</span>
                </p>
                <p className="text-sm text-zinc-500 mt-1">PDF files only, up to 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
