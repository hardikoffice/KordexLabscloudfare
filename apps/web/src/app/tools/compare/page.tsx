"use client";
import { tools } from "@/lib/data/tools";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

function CompareToolsContent() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const searchParams = useSearchParams();
    const idsString = searchParams.get("ids");
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?callback=${window.location.pathname}${window.location.search}`);
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (idsString) {
            setSelected(idsString.split(","));
        } else {
            // Default selection if no IDs are provided
            setSelected(["1", "2", "4"]);
        }
    }, [idsString]);

    const toggleTool = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const selectedTools = tools.filter((t) => selected.includes(t.id));
    const attributes = [
        { key: "category", label: "Category" },
        { key: "pricing_tier", label: "Pricing" },
        { key: "description", label: "Description" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/tools" className="inline-flex items-center gap-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-8 group bg-[var(--surface)] px-4 py-2 rounded-xl transition-all border border-[var(--card-border)] hover:border-[var(--primary)]/50 shadow-lg">
                <div className="relative w-5 h-5 flex-shrink-0">
                    <Image
                        src="/logo-v2.png"
                        alt="Logo"
                        fill
                        className="object-contain mix-blend-screen"
                    />
                </div>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to AI Tools
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">Comparison Matrix</span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">Select tools to compare them side by side.</p>
            </motion.div>

            {/* Tool Selector */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => toggleTool(tool.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selected.includes(tool.id)
                            ? "bg-[var(--primary)] text-white shadow-lg"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]"
                            }`}
                        style={selected.includes(tool.id) ? { boxShadow: "0 0 15px var(--primary-glow)" } : {}}
                    >
                        {tool.name}
                    </button>
                ))}
            </div>

            {/* Comparison Table */}
            {selectedTools.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                    <motion.table
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full glass-card min-w-[600px]"
                        style={{ borderCollapse: "separate", borderSpacing: 0 }}
                    >
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-[var(--muted)] rounded-tl-2xl z-10">Feature</th>
                                {selectedTools.map((tool) => (
                                    <th key={tool.id} className="px-6 py-4 text-center min-w-[200px]">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center text-xl font-black text-[var(--primary)] overflow-hidden shadow-inner border border-[var(--card-border)] relative">
                                                {tool.logo_url ? (
                                                    <Image
                                                        src={tool.logo_url}
                                                        alt={tool.name}
                                                        fill
                                                        className="object-contain p-2"
                                                    />
                                                ) : tool.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-base">{tool.name}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attr) => (
                                <tr key={attr.key} className="border-t border-[var(--card-border)]">
                                    <td className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-sm font-medium z-10">{attr.label}</td>
                                    {selectedTools.map((tool) => (
                                        <td key={tool.id} className="px-6 py-4 text-center text-sm text-[var(--muted-foreground)]">
                                            {attr.key === "category" ? tool.category : attr.key === "pricing_tier" ? tool.pricing_tier : tool.description}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Pros */}
                            <tr className="border-t border-[var(--card-border)]">
                                <td className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-sm font-medium z-10">Pros</td>
                                {selectedTools.map((tool) => (
                                    <td key={tool.id} className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {tool.pros.map((p) => (
                                                <span key={p} className="inline-flex items-center gap-1 text-xs">
                                                    <Check className="w-3 h-3 text-[var(--success)]" /> <span className="tag-use-case">{p}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Cons */}
                            <tr className="border-t border-[var(--card-border)]">
                                <td className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-sm font-medium z-10">Cons</td>
                                {selectedTools.map((tool) => (
                                    <td key={tool.id} className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {tool.cons.map((c) => (
                                                <span key={c} className="inline-flex items-center gap-1 text-xs">
                                                    <X className="w-3 h-3 text-[var(--danger)]" /> <span className="tag-limitation">{c}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Use Cases */}
                            <tr className="border-t border-[var(--card-border)]">
                                <td className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-sm font-medium z-10">Use Cases</td>
                                {selectedTools.map((tool) => (
                                    <td key={tool.id} className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {tool.use_cases.map((uc) => (
                                                <span key={uc} className="tag-use-case text-xs">{uc}</span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Limitations */}
                            <tr className="border-t border-[var(--card-border)]">
                                <td className="sticky left-0 bg-[var(--surface)] px-6 py-4 text-sm font-medium rounded-bl-2xl z-10">Limitations</td>
                                {selectedTools.map((tool) => (
                                    <td key={tool.id} className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {tool.limitations.map((lim) => (
                                                <span key={lim} className="tag-limitation text-xs">{lim}</span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </motion.table>
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <p className="text-[var(--muted-foreground)]">Select at least one tool to begin comparing.</p>
                </div>
            )}
        </div>
    );
}

export default function CompareToolsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
            <CompareToolsContent />
        </Suspense>
    );
}
