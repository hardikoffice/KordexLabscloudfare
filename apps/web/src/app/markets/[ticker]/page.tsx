"use client";
export const runtime = "edge";

import { stocks } from "@/lib/data/stocks";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store";
import { useAuthStore } from "@/store/authStore";
import { StockChart } from "@/components/markets/StockChart";

export default function StockDetailPage() {
    const params = useParams();
    const ticker = decodeURIComponent(params.ticker as string);
    const stock = stocks.find((s) => s.ticker === ticker);

    const { favoriteStocks, toggleFavoriteStock, fetchFavorites } = useDashboardStore();
    const { isAuthenticated } = useAuthStore();
    const isFavorite = favoriteStocks.includes(ticker);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, fetchFavorites]);

    if (!stock) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Stock Not Found</h1>
                <Link href="/markets" className="text-[var(--primary)] hover:underline">← Back to Markets</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Markets
                </Link>
                
                {isAuthenticated && (
                    <button
                        onClick={() => toggleFavoriteStock(stock.ticker)}
                        className={`p-2.5 rounded-xl transition-all duration-300 border ${isFavorite
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-zinc-900/50 hover:bg-zinc-800 text-[var(--muted-foreground)] border-zinc-800"
                            }`}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                )}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Real Chart Component */}
                <div className="mb-12">
                    <StockChart ticker={ticker} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* About Section */}
                    <div className="lg:col-span-2 glass-card p-8">
                        <h3 className="text-xl font-bold mb-4">About {stock.company_name}</h3>
                        <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
                            {stock.company_name} ({stock.ticker}) is a leading player listed on {stock.exchange}. 
                            As an artificial intelligence focused asset, it represents a key component of the modern digital economy.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-xs text-zinc-500 block">Exchange</span>
                                <span className="font-bold">{stock.exchange}</span>
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-xs text-zinc-500 block">Asset Type</span>
                                <span className="font-bold">{stock.asset_type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Invest Now CTA */}
                    <div className="glass-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
                        <h3 className="text-xl font-bold mb-2">Interested in {stock.ticker}?</h3>
                        <p className="text-[var(--muted-foreground)] mb-6 text-sm">Start tracking this {stock.asset_type.toLowerCase()} and get real-time alerts.</p>
                        <button className="glow-btn pulse-glow w-full py-4 flex items-center justify-center gap-2">
                            <ExternalLink className="w-5 h-5" /> Trade Now
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
