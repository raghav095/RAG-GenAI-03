"use client";

import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import { BookOpen, Zap, Shield, Sparkles, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    title: "Instant Indexing",
    desc: "Process complex PDFs and long documents in seconds."
  },
  {
    icon: <Sparkles className="w-5 h-5 text-accent" />,
    title: "AI Analysis",
    desc: "Get deep insights and accurate summaries from your sources."
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
    title: "Natural Chat",
    desc: "Ask questions just like you're talking to an expert."
  }
];


export default function Home() {
  const router = useRouter();

  const handleUploadSuccess = (fileName: string) => {
    router.push(`/chat?file=${encodeURIComponent(fileName)}`);
  };

  return (
    <main className="min-h-screen w-screen relative overflow-x-hidden bg-[#050505] text-white flex flex-col">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            Next Generation RAG
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Talk to your <span className="gradient-text">Documents</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/40 leading-relaxed">
            Upload your research papers, legal documents, or notes and let our AI 
            help you find the answers you need in seconds.
          </p>
        </motion.div>

        {/* Upload Container with Glow */}
        <div className="relative group mb-24">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-bold text-sm mb-2 text-white/80">{f.title}</h3>
              <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="p-8 text-center text-white/10 text-xs tracking-widest uppercase font-bold z-10">
        Powered by OpenAI & Qdrant
      </div>
    </main>
  );
}
