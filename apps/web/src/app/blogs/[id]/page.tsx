"use client";
import { Blog, fetchBlogById } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, Tag, Bookmark } from "lucide-react";
import Link from "next/link";
import { useDashboardStore } from "@/lib/store";

export default function BlogDetailPage() {
    const params = useParams();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const { savedBlogs, toggleSavedBlog, fetchSavedBlogs } = useDashboardStore();

    useEffect(() => {
        fetchSavedBlogs();
        const getBlog = async () => {
            if (params.id) {
                const data = await fetchBlogById(params.id as string);
                setBlog(data);
            }
            setLoading(false);
        };
        getBlog();
    }, [fetchSavedBlogs, params.id]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Loading Article...</h1>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                <Link href="/blogs" className="text-[var(--primary)] hover:underline">← Back to AI News</Link>
            </div>
        );
    }

    // Extract headings for TOC
    const headings = blog.content_markdown
        .split("\n")
        .filter((l) => l.startsWith("## ") || l.startsWith("### "))
        .map((l) => ({
            level: l.startsWith("### ") ? 3 : 2,
            text: l.replace(/^#{2,3}\s/, ""),
            id: l.replace(/^#{2,3}\s/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }));

    // Simple markdown rendering
    const renderMarkdown = (md: string) => {
        return md.split("\n\n").map((block, i) => {
            if (block.startsWith("### ")) {
                const text = block.replace("### ", "");
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return <h3 key={i} id={id} className="text-xl font-bold mt-8 mb-4 text-[var(--primary)]">{text}</h3>;
            }
            if (block.startsWith("## ")) {
                const text = block.replace("## ", "");
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return <h2 key={i} id={id} className="text-2xl font-bold mt-10 mb-4">{text}</h2>;
            }
            if (block.startsWith("| ")) {
                const rows = block.split("\n").filter((r) => !r.match(/^\|[-|]+\|$/));
                return (
                    <div key={i} className="overflow-x-auto my-6">
                        <table className="w-full glass-card text-sm">
                            <thead>
                                <tr>
                                    {rows[0]?.split("|").filter(Boolean).map((cell, j) => (
                                        <th key={j} className="px-4 py-3 text-left font-semibold border-b border-[var(--card-border)]">{cell.trim()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.slice(1).map((row, ri) => (
                                    <tr key={ri}>
                                        {row.split("|").filter(Boolean).map((cell, ci) => (
                                            <td key={ci} className="px-4 py-3 border-b border-[var(--card-border)]">{cell.trim()}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            if (block.startsWith("```")) {
                const code = block.replace(/```\w*\n?/, "").replace(/```$/, "");
                return (
                    <pre key={i} className="bg-[var(--surface)] rounded-xl p-4 overflow-x-auto my-4 text-sm font-mono">
                        <code>{code}</code>
                    </pre>
                );
            }
            if (block.startsWith("- ")) {
                return (
                    <ul key={i} className="list-disc list-inside space-y-2 my-4 text-[var(--muted-foreground)]">
                        {block.split("\n").map((item, j) => (
                            <li key={j}>{item.replace(/^- /, "")}</li>
                        ))}
                    </ul>
                );
            }
            if (block.match(/^\d+\. /)) {
                return (
                    <ol key={i} className="list-decimal list-inside space-y-2 my-4 text-[var(--muted-foreground)]">
                        {block.split("\n").map((item, j) => (
                            <li key={j}>{item.replace(/^\d+\.\s/, "")}</li>
                        ))}
                    </ol>
                );
            }
            return <p key={i} className="text-[var(--muted-foreground)] leading-relaxed my-4">{block}</p>;
        });
    };

    return (
        <>
            {/* Reading Progress */}
            <div className="reading-progress" style={{ width: `${progress}%` }} />

            <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex gap-8">
                    {/* Sticky TOC (Desktop) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">Table of Contents</h4>
                            <nav className="space-y-2">
                                {headings.map((h) => (
                                    <a
                                        key={h.id}
                                        href={`#${h.id}`}
                                        className={`block text-sm hover:text-[var(--primary)] transition-colors ${h.level === 3 ? "pl-4 text-[var(--muted-foreground)]" : "font-medium"
                                            }`}
                                    >
                                        {h.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6">
                            <ArrowLeft className="w-4 h-4" /> Back to AI News
                        </Link>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            {/* Hero */}
                            <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-96">
                                <Image src={blog.hero_image_url} alt={blog.title} fill className="object-cover" priority />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.map((t) => (
                                    <span key={t} className="tag-use-case flex items-center gap-1"><Tag className="w-3 h-3" />{t}</span>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{blog.title}</h1>

                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-[var(--card-border)]">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                                    <span className="font-medium text-[var(--foreground)]">{blog.author}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{blog.published_at}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{blog.read_time_minutes} min read</span>
                                </div>
                                <button
                                    onClick={() => toggleSavedBlog(blog.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-bold text-sm ${savedBlogs.includes(blog.id)
                                        ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]"
                                        : "bg-[var(--surface)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted)]"
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 ${savedBlogs.includes(blog.id) ? "fill-current" : ""}`} />
                                    {savedBlogs.includes(blog.id) ? "Saved to Dashboard" : "Save Article"}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="prose-custom">
                                {renderMarkdown(blog.content_markdown)}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </article>
        </>
    );
}
