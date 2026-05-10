"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onUploadSuccess: (fileName: string) => void;
}

export default function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        onUploadSuccess(file.name);
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

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-2xl glass flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-accent transition-colors duration-300">
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".pdf,.txt"
        onChange={handleUpload}
        disabled={isUploading}
      />
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.label
            key="upload"
            htmlFor="fileInput"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center cursor-pointer space-y-4"
          >
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-accent/60" />
            )}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">
                {isUploading ? "Indexing Document..." : "Upload your Document"}
              </h3>
              <p className="text-white/40 text-sm">
                PDF or Plain Text files supported
              </p>
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Indexed Successfully!</h3>
              <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> {fileName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
