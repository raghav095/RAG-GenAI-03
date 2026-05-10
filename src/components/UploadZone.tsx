"use client";

import { useState, useRef } from "react";
import { FileText, CheckCircle2, Loader2, FileUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onUploadSuccess: (fileName: string) => void;
}

export default function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
        // Wait a beat for the success animation
        setTimeout(() => {
          onUploadSuccess(file.name);
        }, 1500);
      } else {
        const errorData = await res.json();
        alert(`Upload failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative group"
          >
            {/* Background Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-emerald-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center p-8 py-12
                rounded-[2rem] bg-[#0c0c0c] border border-white/[0.05]
                hover:border-accent/40 transition-all duration-500 cursor-pointer
                ${isDragActive ? "border-accent scale-[1.02] bg-[#111]" : ""}
                ${isUploading ? "pointer-events-none" : ""}
              `}
            >
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={onFileChange}
                disabled={isUploading}
              />
              
              <div className="mb-6 relative">
                {isUploading ? (
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-500 shadow-2xl">
                    <FileUp className="w-8 h-8 text-accent" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-white/90">
                  {isUploading ? "Optimizing..." : "Add Source"}
                </h3>
                <p className="text-white/20 text-[11px] font-medium tracking-tight">
                  {isUploading 
                    ? "Indexing your document." 
                    : "Drop your PDF or TXT here."}
                </p>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-white/[0.05]" />
              <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-white/[0.05]" />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-12 rounded-[2rem] bg-accent/5 border border-accent/20 backdrop-blur-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Source Indexed</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white/50 text-[10px] font-mono">
                <FileText className="w-3 h-3 text-accent" />
                {fileName}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
