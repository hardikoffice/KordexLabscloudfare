"use client";
import { useDashboardStore } from "@/lib/store";
import { blogs } from "@/lib/data/blogs";
import { tools } from "@/lib/data/tools";
import { stocks } from "@/lib/data/stocks";
import { motion } from "framer-motion";
import { BookOpen, Cpu, TrendingUp, TrendingDown, Pin, Heart, Bookmark, Star } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
    const { savedBlogs, pinnedTools, favoriteStocks, toggleSavedBlog, togglePinnedTool, toggleFavoriteStock, fetchFavorites, fetchSavedBlogs } = useDashboardStore();

    useEffect(() => {
        fetchFavorites();
        fetchSavedBlogs();
    }, [fetchFavorites, fetchSavedBlogs]);
    const userBlogs = blogs.filter((b) => savedBlogs.includes(b.id));
    const userTools = tools.filter((t) => pinnedTools.includes(t.id));
    const userStocks = stocks.filter((s) => favoriteStocks.includes(s.ticker));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] bg-clip-text text-transparent">
                        Dashboard
                    </span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">Your personalized AI ecosystem at a glance.</p>
            </motion.div>

            {/* Bento Grid */}
            <div className="bento-grid">
                {/* Favorite Stocks */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 md:col-span-2 lg:col-span-2"
                    style={{ gridColumn: "span 2" }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h2 className="font-bold text-lg">Favorite Stocks</h2>
                    </div>
                    {userStocks.length > 0 ? (
                        <div className="space-y-3">
                            {userStocks.map((s) => (
                                <div key={s.ticker} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                                    <Link href={`/markets/${encodeURIComponent(s.ticker)}`} className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
                                            {s.ticker.replace("^", "").slice(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{s.ticker}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">{s.company_name}</p>
                                        </div>
                                    </Link>
                                    <div className="text-right mr-3">
                                        <p className="font-bold">${s.price.toLocaleString()}</p>
                                        <p className={`text-xs font-medium ${s.change >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                                            {s.change >= 0 ? "+" : ""}{s.change_percent.toFixed(2)}%
                                        </p>
                                    </div>
                                    <button onClick={() => toggleFavoriteStock(s.ticker)} className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors">
                                        <Heart className="w-4 h-4 text-[var(--danger)] fill-[var(--danger)]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--muted-foreground)] text-sm">No favorite stocks yet. Visit <Link href="/markets" className="text-[var(--primary)] hover:underline">Markets</Link> to add some.</p>
                    )}
                </motion.div>

                {/* Saved Blogs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Bookmark className="w-5 h-5 text-[var(--primary)]" />
                        <h2 className="font-bold text-lg">Saved Blogs</h2>
                    </div>
                    {userBlogs.length > 0 ? (
                        <div className="space-y-3">
                            {userBlogs.map((b) => (
                                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                                    <Link href={`/blogs/${b.id}`} className="flex-1">
                                        <p className="font-medium text-sm line-clamp-1 hover:text-[var(--primary)] transition-colors">{b.title}</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">{b.author} · {b.read_time_minutes} min</p>
                                    </Link>
                                    <button onClick={() => toggleSavedBlog(b.id)} className="p-1.5 rounded-lg hover:bg-[var(--card-border)] transition-colors flex-shrink-0">
                                        <Bookmark className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--muted-foreground)] text-sm">No saved blogs yet.</p>
                    )}
                </motion.div>

                {/* Pinned Tools */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Pin className="w-5 h-5 text-[var(--accent)]" />
                        <h2 className="font-bold text-lg">Pinned Tools</h2>
                    </div>
                    {userTools.length > 0 ? (
                        <div className="space-y-3">
                            {userTools.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{t.name}</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">{t.category}</p>
                                    </div>
                                    <button onClick={() => togglePinnedTool(t.id)} className="p-1.5 rounded-lg hover:bg-[var(--card-border)] transition-colors flex-shrink-0">
                                        <Pin className="w-4 h-4 text-[var(--accent)] fill-[var(--accent)]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--muted-foreground)] text-sm">No pinned tools yet.</p>
                    )}
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h2 className="font-bold text-lg mb-4">Quick Links</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/blogs" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                            <BookOpen className="w-6 h-6 text-[var(--primary)]" />
                            <span className="text-sm font-medium">AI News</span>
                        </Link>
                        <Link href="/tools" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                            <Cpu className="w-6 h-6 text-[var(--accent)]" />
                            <span className="text-sm font-medium">AI Tools</span>
                        </Link>
                        <Link href="/markets" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                            <TrendingUp className="w-6 h-6 text-[var(--success)]" />
                            <span className="text-sm font-medium">Markets</span>
                        </Link>
                        <Link href="/tools/compare" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
                            <TrendingDown className="w-6 h-6 text-[var(--secondary)]" />
                            <span className="text-sm font-medium">Compare</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
