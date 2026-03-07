import { blogs } from "@/lib/data/blogs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Tag, Search, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/lib/store";

export default function BlogsPage() {
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const { savedBlogs, toggleSavedBlog, fetchSavedBlogs } = useDashboardStore();

    useEffect(() => {
        fetchSavedBlogs();
    }, [fetchSavedBlogs]);
    传输
    const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags)));

    const filtered = blogs.filter((b) => {
        const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase());
        const matchTag = activeTag ? b.tags.includes(activeTag) : true;
        return matchSearch && matchTag;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">AI News</span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">Stay ahead with the latest in artificial intelligence.</p>
            </motion.div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTag(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!activeTag ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                            }`}
                    >
                        All
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTag === tag ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((blog, i) => (
                    <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link href={`/blogs/${blog.id}`} className="group block glass-card overflow-hidden h-full">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={blog.hero_image_url}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleSavedBlog(blog.id);
                                    }}
                                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/20 hover:bg-black/40 backdrop-blur-md transition-all z-10 group/btn"
                                >
                                    <Bookmark className={`w-4 h-4 transition-colors ${savedBlogs.includes(blog.id) ? "text-[var(--primary)] fill-[var(--primary)]" : "text-white/70 group-hover/btn:text-white"}`} />
                                </button>
                            </div>
                            传输                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {blog.tags.map((t) => (
                                        <span key={t} className="tag-use-case"><Tag className="w-3 h-3 inline mr-1" />{t}</span>
                                    ))}
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-[var(--primary)] transition-colors mb-3 line-clamp-2">{blog.title}</h3>
                                <div className="mt-auto flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                                    <span>{blog.author}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.read_time_minutes} min</span>
                                    <span>·</span>
                                    <span>{blog.published_at}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
