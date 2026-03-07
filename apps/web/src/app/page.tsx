"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, TrendingDown, Sparkles, BookOpen, Cpu } from "lucide-react";
import Link from "next/link";
import { stocks } from "@/lib/data/stocks";
import { blogs } from "@/lib/data/blogs";
import { tools } from "@/lib/data/tools";

function TickerTape() {
  const doubled = [...stocks, ...stocks];
  return (
    <div className="w-full overflow-hidden border-y border-[var(--card-border)] py-3 bg-[var(--surface)]">
      <div className="ticker-tape">
        {doubled.map((s, i) => (
          <Link
            href={`/markets/${s.ticker}`}
            key={`${s.ticker}-${i}`}
            className="flex items-center gap-2 px-6 whitespace-nowrap text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <span className="font-bold">{s.ticker}</span>
            <span>${s.price.toLocaleString()}</span>
            <span className={`flex items-center gap-0.5 ${s.change >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {s.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {s.change >= 0 ? "+" : ""}{s.change_percent.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center mesh-gradient overflow-hidden">
      {/* Animated orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", top: "10%", left: "10%" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)", bottom: "10%", right: "15%" }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", top: "50%", right: "30%" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm mb-6">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-[var(--muted-foreground)]">Your AI Ecosystem Dashboard</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
              Navigate the AI
            </span>
            <br />
            <span>Revolution</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
            Curated news, deep-dive tool comparisons, and real-time stock tracking — all in one immersive dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/blogs" className="glow-btn pulse-glow flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Explore AI News
            </Link>
            <Link href="/tools" className="px-6 py-3 rounded-xl font-semibold border border-[var(--card-border)] hover:bg-[var(--surface-hover)] transition-all flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Compare Tools
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrendingBlogs() {
  const trending = blogs.slice(0, 3);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Trending AI News</h2>
        <Link href="/blogs" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trending.map((blog, i) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href={`/blogs/${blog.id}`} className="group block glass-card overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.hero_image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {blog.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag-use-case">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg group-hover:text-[var(--primary)] transition-colors line-clamp-2">{blog.title}</h3>
                <div className="flex items-center gap-3 mt-3 text-sm text-[var(--muted-foreground)]">
                  <span>{blog.author}</span>
                  <span>·</span>
                  <span>{blog.read_time_minutes} min read</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";

function ToolOfTheWeek() {
  const [toolIndex, setToolIndex] = useState(0);

  useEffect(() => {
    // Calculate a stable index based on the date
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    setToolIndex(day % tools.length);
  }, []);

  const tool = tools[toolIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">🏆 Tool of the Day</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="glass-card p-8 relative overflow-hidden"
        style={{ boxShadow: "0 0 40px var(--primary-glow), 0 0 80px rgba(168,85,247,0.1)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }} />
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center text-3xl flex-shrink-0">
            <Cpu className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">{tool?.name}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium">
                {tool?.category}
              </span>
            </div>
            <p className="text-[var(--muted-foreground)] mb-4">{tool?.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {tool?.pros.map((p) => (
                <span key={p} className="tag-use-case">{p}</span>
              ))}
            </div>
            <Link href="/tools" className="glow-btn inline-flex items-center gap-2 text-sm">
              Compare Tools <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TickerTape />
      <TrendingBlogs />
      <ToolOfTheWeek />
    </>
  );
}
