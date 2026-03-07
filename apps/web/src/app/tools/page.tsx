"use client";
import { Search, ArrowRight, ThumbsUp, ThumbsDown, DollarSign, Check, Trash2, AlertCircle, Filter, ChevronDown, RefreshCcw, ExternalLink, TrendingUp, TrendingDown, Clock, Newspaper, Briefcase, ArrowUp, SortAsc, History as HistoryIcon, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tools, AITool, PricingModel, AccessType } from "@/lib/data/tools";
import { blogs } from "@/lib/data/blogs";
import { stocks } from "@/lib/data/stocks";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ToolsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [search, setSearch] = useState("");
    const categories = Array.from(new Set(tools.map((t) => t.category)));
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
    const [toast, setToast] = useState<string | null>(null);
    const [selectedDetailTool, setSelectedDetailTool] = useState<AITool | null>(null);

    // Billing Cycle State
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    // Upvote & Sorting State
    const [upvotedToolIds, setUpvotedToolIds] = useState<string[]>([]);
    const [localUpvotes, setLocalUpvotes] = useState<Record<string, number>>({});
    const [sortBy, setSortBy] = useState<'upvotes' | 'newest' | 'alphabetical'>('upvotes');
    const [isUpvoting, setIsUpvoting] = useState<string | null>(null);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // New Filtering State
    const [showFilters, setShowFilters] = useState(false);
    const [pricingFilters, setPricingFilters] = useState<PricingModel[]>([]);
    const [accessFilters, setAccessFilters] = useState<AccessType[]>([]);

    // Persistence for Upvotes
    useEffect(() => {
        const saved = localStorage.getItem('kordex_upvoted_tools');
        if (saved) {
            try {
                setUpvotedToolIds(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load upvotes", e);
            }
        }
    }, []);

    const handleUpvote = async (e: React.MouseEvent, toolId: string) => {
        e.stopPropagation();
        if (upvotedToolIds.includes(toolId) || isUpvoting === toolId) return;

        setIsUpvoting(toolId);

        // Optimistic UI Update
        const newUpvoted = [...upvotedToolIds, toolId];
        setUpvotedToolIds(newUpvoted);
        setLocalUpvotes(prev => ({ ...prev, [toolId]: (prev[toolId] || 0) + 1 }));
        localStorage.setItem('kordex_upvoted_tools', JSON.stringify(newUpvoted));

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 600));
            console.log(`Backend: Upvoted tool ${toolId}`);
        } catch (error) {
            // Rollback on failure (optional for mock)
            console.error("Upvote failed", error);
        } finally {
            setIsUpvoting(null);
        }
    };

    const pricingOptions: PricingModel[] = ["Free", "Freemium", "Paid", "Enterprise"];
    const accessOptions: AccessType[] = ["Open Source", "Closed Source", "API Available"];

    const filtered = useMemo(() => {
        let result = tools.filter((tool) => {
            const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                tool.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !activeCategory || tool.category === activeCategory;
            const matchesPricing = pricingFilters.length === 0 || pricingFilters.includes(tool.pricing_model);
            const matchesAccess = accessFilters.length === 0 || tool.access_type.some(a => accessFilters.includes(a));

            return matchesSearch && matchesCategory && matchesPricing && matchesAccess;
        });

        // Apply Sorting
        return result.sort((a, b) => {
            const upvotesA = a.upvotes + (localUpvotes[a.id] || 0);
            const upvotesB = b.upvotes + (localUpvotes[b.id] || 0);

            if (sortBy === 'upvotes') {
                return upvotesB - upvotesA;
            } else if (sortBy === 'newest') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }, [search, activeCategory, pricingFilters, accessFilters, sortBy, localUpvotes]);

    const clearAllFilters = () => {
        setSearch("");
        setActiveCategory(null);
        setPricingFilters([]);
        setAccessFilters([]);
    };

    const toggleTool = (tool: AITool) => {
        const isSelected = selectedTools.find(t => t.id === tool.id);
        if (isSelected) {
            setSelectedTools(selectedTools.filter(t => t.id !== tool.id));
        } else {
            if (selectedTools.length >= 3) {
                setToast("You can only compare up to 3 tools at a time.");
                return;
            }
            setSelectedTools([...selectedTools, tool]);
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                    <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">AI Tools</span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg max-w-2xl font-medium">Discover, compare, and choose the best AI tools for your workflow.</p>
            </motion.div>

            {/* Filters & Search */}
            {/* Search, Filters & Billing Row */}
            <div className="space-y-6 mb-12">
                {/* Search Bar - Full Width Top Row */}
                <div className="relative group overflow-hidden rounded-3xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="Search by name, functionality, or category..."
                        className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-3xl py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all text-base font-medium shadow-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                        <div className="h-2/3 w-[1px] bg-[var(--card-border)] mr-2" />
                        <div className="px-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hidden sm:block">Press Escape to Clear</div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Sorting Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border transition-all font-black text-[13px] shadow-lg ${showSortDropdown ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--card-border)] bg-[var(--surface)] hover:border-[var(--muted)]'}`}
                            >
                                {sortBy === 'upvotes' && <Zap className="w-4 h-4 text-[var(--primary)]" />}
                                {sortBy === 'newest' && <HistoryIcon className="w-4 h-4 text-[var(--primary)]" />}
                                {sortBy === 'alphabetical' && <SortAsc className="w-4 h-4 text-[var(--primary)]" />}
                                <span className="uppercase tracking-wider">
                                    {sortBy === 'upvotes' ? 'Most Upvoted' : sortBy === 'newest' ? 'Recently Added' : 'Alphabetical'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showSortDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-0 top-full mt-2 w-full sm:w-64 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl"
                                        >
                                            {[
                                                { id: 'upvotes', label: 'Most Upvoted', icon: Zap },
                                                { id: 'newest', label: 'Recently Added', icon: HistoryIcon },
                                                { id: 'alphabetical', label: 'Alphabetical', icon: SortAsc },
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        setSortBy(option.id as any);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${sortBy === option.id ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30' : 'hover:bg-[var(--surface)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                                                >
                                                    <option.icon className="w-4 h-4" />
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Filter Toggle */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border transition-all font-black text-[13px] shadow-lg ${showFilters ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--card-border)] bg-[var(--surface)] hover:border-[var(--muted)]'}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="uppercase tracking-wider">Filters</span>
                                {(pricingFilters.length > 0 || accessFilters.length > 0) && (
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-black">
                                        {pricingFilters.length + accessFilters.length}
                                    </span>
                                )}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute left-0 top-full mt-2 z-50 w-80 glass-card p-6 shadow-2xl border-[var(--primary)]/20"
                                    >
                                        <div className="relative z-10">
                                            <div className="mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-4 flex items-center gap-2">
                                                    <DollarSign className="w-3 h-3" /> Pricing Model
                                                </h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {pricingOptions.map(option => (
                                                        <label key={option} className="flex items-center gap-3 cursor-pointer group hover:bg-[var(--surface)] p-2 rounded-xl transition-colors">
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={pricingFilters.includes(option)}
                                                                    onChange={() => {
                                                                        setPricingFilters(prev =>
                                                                            prev.includes(option) ? prev.filter(p => p !== option) : [...prev, option]
                                                                        );
                                                                    }}
                                                                />
                                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${pricingFilters.includes(option) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--muted)] group-hover:border-[var(--primary)]'}`}>
                                                                    {pricingFilters.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-bold text-[var(--foreground)]">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-4 flex items-center gap-2">
                                                    <RefreshCcw className="w-3 h-3" /> Access Type
                                                </h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {accessOptions.map(option => (
                                                        <label key={option} className="flex items-center gap-3 cursor-pointer group hover:bg-[var(--surface)] p-2 rounded-xl transition-colors">
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={accessFilters.includes(option)}
                                                                    onChange={() => {
                                                                        setAccessFilters(prev =>
                                                                            prev.includes(option) ? prev.filter(p => p !== option) : [...prev, option]
                                                                        );
                                                                    }}
                                                                />
                                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${accessFilters.includes(option) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--muted)] group-hover:border-[var(--accent)]'}`}>
                                                                    {accessFilters.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-bold text-[var(--foreground)]">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={clearAllFilters}
                                                className="w-full py-3 rounded-xl text-[10px] font-black bg-[var(--surface)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-all border border-[var(--card-border)] uppercase tracking-widest"
                                            >
                                                Reset All Filters
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-1" />

                        {/* Billing Toggle - Grouped with buttons */}
                        <div className="flex items-center h-fit bg-[var(--surface)] p-1 rounded-2xl border border-[var(--card-border)] shadow-lg">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                            >
                                {billingCycle === 'monthly' && (
                                    <motion.div
                                        layoutId="billing-pill"
                                        className="absolute inset-0 bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/30"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">Monthly</span>
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                            >
                                {billingCycle === 'annual' && (
                                    <motion.div
                                        layoutId="billing-pill"
                                        className="absolute inset-0 bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/30"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">Annual</span>
                                <div className={`relative z-10 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${billingCycle === 'annual' ? 'bg-white text-[var(--primary)] shadow-sm' : 'bg-[var(--primary)]/20 text-[var(--primary)]'}`}>
                                    -20%
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Row */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-2 mr-3 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--card-border)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Categories</span>
                        </div>
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all shadow-sm uppercase tracking-wider ${!activeCategory ? "bg-[var(--foreground)] text-[var(--background)] scale-105 shadow-xl" : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--card-border)] text-[var(--muted-foreground)]"}`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                                className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all shadow-sm uppercase tracking-wider ${activeCategory === cat ? "bg-[var(--foreground)] text-[var(--background)] scale-105 shadow-xl" : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--card-border)] text-[var(--muted-foreground)]"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Compare CTA */}
                {filtered.length > 0 && (
                    <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group border-[var(--primary)]/20">
                        <div className="relative z-10">
                            <h3 className="font-black text-xl mb-1 flex items-center gap-2">
                                <div className="relative w-6 h-6 flex-shrink-0">
                                    <Image
                                        src="/logo-v2.png"
                                        alt="KordexLabs Logo"
                                        fill
                                        className="object-contain mix-blend-screen"
                                    />
                                </div>
                                Interactive Comparison Matrix
                            </h3>
                            <p className="text-[var(--muted-foreground)] font-medium">Evaluate AI tools side-by-side to find your perfect match.</p>
                        </div>
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    router.push("/tools/compare");
                                } else {
                                    router.push("/login?callback=/tools/compare");
                                }
                            }}
                            className="glow-btn flex items-center gap-2 whitespace-nowrap px-10 py-4 rounded-2xl relative z-10 font-bold uppercase tracking-widest text-sm transition-transform hover:scale-105"
                        >
                            Explore Matrix <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>

            {/* Tool Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                {filtered.map((tool, i) => {
                    const isSelected = selectedTools.some(t => t.id === tool.id);
                    return (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`glass-card p-6 flex flex-col group relative transition-all cursor-pointer ${isSelected ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-2xl shadow-[var(--primary)]/5' : 'hover:border-[var(--muted)] hover:bg-[var(--surface)] hover:shadow-xl'}`}
                            onClick={() => toggleTool(tool)}
                        >
                            {/* Relocated Selection Checkbox - Top Left for Better UX */}
                            <div className="absolute top-3 left-3 z-20">
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[var(--primary)] border-[var(--primary)] scale-110 shadow-lg shadow-[var(--primary)]/40' : 'border-[var(--muted)] group-hover:border-[var(--primary)]/50 bg-black/20'}`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center text-xl flex-shrink-0 font-black text-[var(--primary)] overflow-hidden shadow-inner border border-[var(--card-border)]">
                                        {tool.logo_url ? <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" /> : tool.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg group-hover:text-[var(--primary)] transition-colors line-clamp-1 leading-tight">{tool.name}</h3>
                                        <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider block mt-0.5">{tool.category}</span>
                                    </div>
                                </div>

                                {/* Product Hunt Style Upvote - Top Right */}
                                <button
                                    onClick={(e) => handleUpvote(e, tool.id)}
                                    disabled={upvotedToolIds.includes(tool.id) || isUpvoting === tool.id}
                                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl border transition-all shrink-0 shadow-sm ${upvotedToolIds.includes(tool.id) ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/40 scale-105' : 'bg-[var(--surface)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] active:scale-95'}`}
                                >
                                    <ArrowUp className={`w-5 h-5 mb-1 transition-transform ${isUpvoting === tool.id ? 'animate-bounce' : ''} ${upvotedToolIds.includes(tool.id) ? 'scale-110' : ''}`} />
                                    <span className="text-xs font-black">{tool.upvotes + (localUpvotes[tool.id] || 0)}</span>
                                </button>
                            </div>

                            <p className="text-[13px] text-[var(--muted-foreground)] font-medium mb-6 line-clamp-2 leading-relaxed h-[40px]">{tool.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6 h-[24px] overflow-hidden">
                                {tool.pros.slice(0, 1).map((p) => (
                                    <span key={p} className="px-3 py-1 rounded-full bg-[var(--primary)]/5 text-[var(--primary)] text-[10px] font-black uppercase tracking-wider border border-[var(--primary)]/10">{p}</span>
                                ))}
                                {tool.pricing_model === 'Free' && <span className="px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-[10px] font-black uppercase tracking-wider border border-[var(--success)]/10">Free</span>}
                            </div>

                            <div className="mt-auto pt-5 border-t border-[var(--card-border)]/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-baseline gap-0.5 text-[var(--primary)]">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-lg font-black tracking-tighter">
                                            {tool.priceMonthly !== undefined ? (
                                                billingCycle === 'monthly' ? tool.priceMonthly : (tool.priceAnnual || tool.priceMonthly)
                                            ) : tool.pricing_tier.split(' ')[0]}
                                        </span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] font-black uppercase ml-0.5">/mo</span>
                                    </div>
                                    {billingCycle === 'annual' && tool.priceAnnual && tool.priceMonthly && tool.priceAnnual < tool.priceMonthly && (
                                        <span className="px-2 py-0.5 rounded-md bg-[var(--success)]/10 text-[var(--success)] text-[9px] font-black uppercase tracking-tighter">
                                            Save {Math.round((1 - tool.priceAnnual / tool.priceMonthly) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDetailTool(tool);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-2"
                                >
                                    Details <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full py-20 flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-[var(--surface)] border border-[var(--card-border)] flex items-center justify-center mb-6 shadow-inner">
                            <Search className="w-8 h-8 text-[var(--muted-foreground)]" />
                        </div>
                        <h3 className="text-xl font-black mb-2">No matching tools found</h3>
                        <p className="text-[var(--muted-foreground)] max-w-xs mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
                        <button
                            onClick={clearAllFilters}
                            className="glow-btn px-8 py-3 rounded-2xl flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" /> Clear All Filters
                        </button>
                    </motion.div>
                )
                }
            </div>

            {/* Tool Detail Modal */}
            <AnimatePresence>
                {selectedDetailTool && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedDetailTool(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-[var(--background)] border border-[var(--card-border)] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative h-32 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                <button
                                    onClick={() => setSelectedDetailTool(null)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors z-10"
                                >
                                    <Trash2 className="w-4 h-4 rotate-45" />
                                </button>
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-24 h-24 rounded-3xl bg-[var(--surface)] border-4 border-[var(--background)] shadow-xl flex items-center justify-center overflow-hidden">
                                        {selectedDetailTool.logo_url ? <img src={selectedDetailTool.logo_url} alt={selectedDetailTool.name} className="w-full h-full object-contain p-2" /> : <span className="text-4xl font-black text-[var(--primary)]">{selectedDetailTool.name.charAt(0)}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 pt-12">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-black">{selectedDetailTool.name}</h2>
                                            <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-widest">{selectedDetailTool.category}</span>
                                        </div>
                                        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">{selectedDetailTool.description}</p>

                                        {selectedDetailTool.parent_company && (
                                            <div className="mt-4 flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span>Owned by <span className="font-bold text-[var(--foreground)]">{selectedDetailTool.parent_company}</span></span>
                                                </div>
                                                {/* Market Performance Widget */}
                                                {selectedDetailTool.ticker && (() => {
                                                    const stockData = stocks.find(s => s.ticker === selectedDetailTool.ticker);
                                                    if (!stockData) return null;
                                                    const isPositive = stockData.change_percent >= 0;
                                                    return (
                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isPositive ? 'bg-[var(--success)]/5 border-[var(--success)]/20' : 'bg-[var(--danger)]/5 border-[var(--danger)]/20'} shadow-sm`}>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-tighter leading-none mb-0.5">{stockData.ticker}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black">${stockData.price.toFixed(2)}</span>
                                                                    <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                                                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                                        {Math.abs(stockData.change_percent)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-auto shrink-0 self-start">
                                        <div className="glass-card p-6 !bg-[var(--surface)] ring-1 ring-[var(--card-border)] min-w-[240px] shadow-lg">
                                            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Pricing Plan</div>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <div className="text-4xl font-black text-[var(--primary)]">
                                                    {selectedDetailTool.priceMonthly !== undefined ? (
                                                        `$${billingCycle === 'monthly' ? selectedDetailTool.priceMonthly : (selectedDetailTool.priceAnnual || selectedDetailTool.priceMonthly)}`
                                                    ) : selectedDetailTool.pricing_tier.split(' ')[0]}
                                                </div>
                                                {selectedDetailTool.priceMonthly !== undefined && (
                                                    <span className="text-sm text-[var(--muted-foreground)] font-bold">/month</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                                <div className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-bold uppercase tracking-wider">{selectedDetailTool.pricing_model}</div>
                                                {billingCycle === 'annual' && selectedDetailTool.priceAnnual && selectedDetailTool.priceMonthly && selectedDetailTool.priceAnnual < selectedDetailTool.priceMonthly && (
                                                    <div className="px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-[11px] font-bold">
                                                        Save {Math.round((1 - selectedDetailTool.priceAnnual / selectedDetailTool.priceMonthly) * 100)}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--success)]">
                                            <ThumbsUp className="w-4 h-4" /> Pros
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedDetailTool.pros.map(p => (
                                                <div key={p} className="flex gap-2 text-sm">
                                                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-[var(--success)]" />
                                                    <span>{p}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--danger)]">
                                            <ThumbsDown className="w-4 h-4" /> Cons
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedDetailTool.cons.map(c => (
                                                <div key={c} className="flex gap-2 text-sm text-[var(--muted-foreground)]">
                                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--danger)]" />
                                                    <span>{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12">
                                    <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" /> Use Cases
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDetailTool.use_cases.map(u => (
                                            <span key={u} className="tag-use-case px-4 py-2 font-medium">{u}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Related News Section */}
                                {(() => {
                                    const toolName = selectedDetailTool.name.toLowerCase();
                                    const parentName = selectedDetailTool.parent_company?.toLowerCase() || '';
                                    const relatedBlogs = blogs.filter(b =>
                                        b.title.toLowerCase().includes(toolName) ||
                                        b.content_markdown.toLowerCase().includes(toolName) ||
                                        (parentName && b.title.toLowerCase().includes(parentName.split(' ')[0]))
                                    ).slice(0, 3);

                                    if (relatedBlogs.length === 0) return null;

                                    return (
                                        <div className="pt-8 border-t border-[var(--card-border)]">
                                            <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                                                <Newspaper className="w-5 h-5 text-[var(--primary)]" /> Related AI News
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {relatedBlogs.map(blog => (
                                                    <Link
                                                        key={blog.id}
                                                        href={`/blogs/${blog.id}`}
                                                        className="group glass-card overflow-hidden !p-0 hover:border-[var(--primary)] transition-all flex flex-col h-full"
                                                    >
                                                        <div className="h-32 overflow-hidden bg-[var(--surface)]">
                                                            <img
                                                                src={blog.hero_image_url}
                                                                alt={blog.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="p-4 flex flex-col flex-1">
                                                            <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)] mb-2 font-bold uppercase">
                                                                <Clock className="w-3 h-3" /> {blog.read_time_minutes}m read
                                                            </div>
                                                            <h5 className="font-bold text-sm leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">{blog.title}</h5>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Footer Actions */}
                            <div className="shrink-0 p-6 bg-[var(--surface)] border-t border-[var(--card-border)] flex items-center justify-between gap-4">
                                <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">Explore more AI insights or compare this tool.</span>
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        onClick={() => toggleTool(selectedDetailTool)}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${selectedTools.some(t => t.id === selectedDetailTool.id) ? 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20' : 'bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20'}`}
                                    >
                                        {selectedTools.some(t => t.id === selectedDetailTool.id) ? 'Remove from Compare' : 'Add to Compare'}
                                    </button>
                                    <Link
                                        href={`/tools/compare?ids=${selectedDetailTool.id}`}
                                        className="glow-btn px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2"
                                    >
                                        Compare Matrix <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filtered.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-16 flex flex-col items-center text-center max-w-xl mx-auto shadow-xl"
                >
                    <div className="w-20 h-20 rounded-3xl bg-[var(--surface)] flex items-center justify-center mb-6 shadow-inner ring-1 ring-[var(--card-border)]">
                        <Search className="w-10 h-10 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-[var(--foreground)]">No tools matched your search</h3>
                    <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
                        We couldn't find any AI tools matching your current configuration. Try adjusting your filters or search query to see more results.
                    </p>
                    <button
                        onClick={clearAllFilters}
                        className="glow-btn px-10 py-4 rounded-2xl flex items-center gap-2 font-black transition-transform active:scale-95"
                    >
                        <Trash2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        Clear All Filters
                    </button>
                </motion.div>
            )}

            {/* Sticky Action Bar */}
            <AnimatePresence>
                {selectedTools.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
                    >
                        <div className="glass-card p-4 flex items-center justify-between gap-4 shadow-2xl border-[var(--primary)]/30">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex -space-x-3 overflow-hidden mr-2">
                                    {selectedTools.map((tool) => (
                                        <div key={tool.id} className="w-10 h-10 rounded-full border-2 border-[var(--background)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-lg">
                                            {tool.logo_url ? <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain p-1.5" /> : <span className="text-xs font-bold text-[var(--primary)]">{tool.name.charAt(0)}</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                                        {selectedTools.length} {selectedTools.length === 1 ? "Tool" : "Tools"} Selected
                                    </span>
                                    <button
                                        onClick={() => setSelectedTools([])}
                                        className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--danger)] flex items-center gap-1 transition-colors uppercase tracking-wider font-bold"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" /> Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (isAuthenticated) {
                                            router.push(`/tools/compare?ids=${selectedTools.map(t => t.id).join(',')}`);
                                        } else {
                                            router.push(`/login?callback=/tools/compare?ids=${selectedTools.map(t => t.id).join(',')}`);
                                        }
                                    }}
                                    className="glow-btn py-2 px-6 flex items-center gap-2 text-sm whitespace-nowrap"
                                >
                                    Compare Selected <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--danger)] shadow-2xl flex items-center gap-2 pointer-events-none"
                    >
                        <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
                        <span className="text-xs font-medium">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
