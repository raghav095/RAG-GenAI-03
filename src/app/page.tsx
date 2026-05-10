"use client";

import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const handleUploadSuccess = (fileName: string) => {
    router.push(`/chat?file=${encodeURIComponent(fileName)}`);
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden bg-[#050505] text-white">
      {/* Sophisticated Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />

      {/* INDEPENDENT HEADING AREA (Top 35% fixed zone) */}
      <div className="absolute top-0 left-0 w-full h-[45vh] flex flex-col items-center justify-center z-10 px-8">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.8] mix-blend-exclusion">

            Talk to your <br />
            <span className="gradient-text italic">Knowledge</span>
          </h1>
          <p className="max-w-md mx-auto text-base text-white/20 leading-relaxed font-medium tracking-tight">
            The minimal interface for deep document analysis. <br />
            Built for speed. Optimized for precision.
          </p>
        </motion.div>
      </div>

      {/* INDEPENDENT UPLOADER AREA (Bottom 55% fixed zone) */}
      <div className="absolute bottom-0 left-0 w-full h-[55vh] flex flex-col items-center justify-start z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full px-8"
        >
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </motion.div>
      </div>

      {/* Minimalistic Technical Footer */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 text-[9px] font-black tracking-[0.5em] uppercase text-white/[0.03] pointer-events-none">
        <span>RAG.ENGINE_03</span>
        <div className="w-1 h-1 rounded-full bg-white/[0.05]" />
        <span>Vercel_Ready</span>
        <div className="w-1 h-1 rounded-full bg-white/[0.05]" />
        <span>Qdrant_Vector_db</span>
      </div>
    </main>
  );
}
