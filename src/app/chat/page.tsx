"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import UploadZone from "@/components/UploadZone";
import { BookOpen, ArrowLeft, X, Layers, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  // 1. Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("notebook_files");
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved files", e);
      }
    }
  }, []);

  // 2. Handle initial file from URL and save to localStorage
  useEffect(() => {
    const initialFile = searchParams.get("file");
    if (initialFile && !files.includes(initialFile)) {
      const newFiles = [initialFile, ...files.filter(f => f !== initialFile)];
      setFiles(newFiles);
      localStorage.setItem("notebook_files", JSON.stringify(newFiles));
    }
  }, [searchParams]);

  // 3. Save to localStorage whenever files change
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem("notebook_files", JSON.stringify(files));
    }
  }, [files]);


  const handleUploadSuccess = (fileName: string) => {
    if (!files.includes(fileName)) {
      setFiles(prev => [fileName, ...prev]);
    }
    setIsUploadModalOpen(false);
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden bg-[#050505] text-white">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* FULL HEIGHT LEFT SIDEBAR */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-y-0 left-0 w-80 z-30 px-4 pt-6 pb-0"
      >
        <div className="w-full h-full glass p-6 rounded-t-[2.5rem] rounded-b-none border border-white/10 shadow-2xl flex flex-col">
          {/* Sidebar Top */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight italic">NotebookAI</span>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Document Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Knowledge Base</h3>
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">{files.length} SOURCES</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              <AnimatePresence initial={false}>
                {files.map((file, idx) => (
                  <motion.div
                    key={file}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                        <BookOpen className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate text-white/80">{file}</p>
                        <p className="text-[9px] text-green-500/50 font-bold">READY</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const nextFiles = files.filter(f => f !== file);
                        setFiles(nextFiles);
                        localStorage.setItem("notebook_files", JSON.stringify(nextFiles));
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all shrink-0"
                      title="Remove source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </motion.div>
                ))}
              </AnimatePresence>
              
              {files.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-20">
                  <Layers className="w-8 h-8 mb-2" />
                  <p className="text-[10px] font-bold">No Sources</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full py-4 text-xs font-bold text-white/40 hover:text-white transition-all border border-white/10 rounded-2xl hover:bg-accent hover:border-accent hover:text-white group flex items-center justify-center gap-2 shadow-xl"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Add Source
            </button>
          </div>
        </div>
      </motion.div>

      {/* FULL HEIGHT MAIN CHAT AREA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-y-0 left-80 right-0 z-20 px-4 pt-6 pb-0"
      >
        <ChatInterface activeFiles={files} />
      </motion.div>


      {/* UPLOAD MODAL OVERLAY */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl px-6"
            >
              <div className="glass p-1 rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <div className="p-8 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Add New Source</h2>
                    <p className="text-white/30 text-sm">Upload another document to expand your knowledge base.</p>
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white/40" />
                  </button>
                </div>
                <div className="p-8">
                  <UploadZone onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
