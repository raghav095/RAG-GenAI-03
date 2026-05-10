"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage: Message = {
        role: "bot",
        content: data.answer || "Sorry, I couldn't process that.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "An error occurred while fetching the answer." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full glass rounded-t-[2.5rem] rounded-b-none overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">




      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
          <span className="font-semibold text-sm tracking-wide text-white/80 uppercase">AI Document Intelligence</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
            <Bot className="w-20 h-20 opacity-10 animate-bounce" />
            <div className="text-center">
              <p className="text-2xl font-bold tracking-tight mb-2">Ready to assist</p>
              <p className="text-white/20">Ask anything about your uploaded source</p>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-5",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110",
                msg.role === "user" ? "bg-accent rotate-3" : "bg-white/10 border border-white/20 -rotate-3"
              )}>
                {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6 text-accent" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-6 rounded-3xl text-lg leading-relaxed overflow-hidden",
                msg.role === "user" 
                  ? "bg-accent text-white rounded-tr-none shadow-[0_10px_30px_rgba(124,58,237,0.3)]" 
                  : "bg-white/5 border border-white/10 rounded-tl-none text-white/95 shadow-lg backdrop-blur-sm"
              )}>
                {msg.role === "bot" ? (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 gradient-text">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-accent">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        code: ({ children }) => <code className="bg-black/40 px-2 py-0.5 rounded text-accent font-mono text-base border border-white/5">{children}</code>,
                        pre: ({ children }) => <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto my-4">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-accent pl-4 italic text-white/60 my-4">{children}</blockquote>,
                        table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-white/10">{children}</table></div>,
                        th: ({ children }) => <th className="border border-white/10 p-2 bg-white/5">{children}</th>,
                        td: ({ children }) => <td className="border border-white/10 p-2">{children}</td>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center -rotate-3 animate-pulse">
                <Bot className="w-6 h-6 text-accent" />
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tl-none shadow-sm backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {/* Input */}
      <div className="p-8 border-t border-white/10 bg-white/5 shrink-0 backdrop-blur-xl">
        <div className="relative max-w-6xl mx-auto group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Deep analysis on your document..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-8 pr-20 focus:outline-none focus:border-accent/50 transition-all text-xl shadow-2xl placeholder:text-white/20"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-xl bg-accent text-white hover:bg-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-accent/40 active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
