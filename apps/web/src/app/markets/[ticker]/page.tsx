export const runtime = "edge";

"use client";
import { stocks } from "@/lib/data/stocks";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/lib/store";
import { useAuthStore } from "@/store/authStore";

export default function StockDetailPage() {
    const params = useParams();
    const ticker = decodeURIComponent(params.ticker as string);
    const stock = stocks.find((s) => s.ticker === ticker);
    const [livePrice, setLivePrice] = useState(stock?.price ?? 0);
    const [flashClass, setFlashClass] = useState("");

    const { favoriteStocks, toggleFavoriteStock, fetchFavorites } = useDashboardStore();
    const { isAuthenticated } = useAuthStore();
    const isFavorite = favoriteStocks.includes(ticker);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, fetchFavorites]);

    // Simulate real-time price updates
    useEffect(() => {
        if (!stock) return;
        const interval = setInterval(() => {
            const change = (Math.random() - 0.48) * 2;
            setLivePrice((prev) => {
                const newPrice = Math.max(0, prev + change);
                setFlashClass(change >= 0 ? "flash-green" : "flash-red");
                setTimeout(() => setFlashClass(""), 500);
                return parseFloat(newPrice.toFixed(2));
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [stock]);

    if (!stock) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Stock Not Found</h1>
                <Link href="/markets" className="text-[var(--primary)] hover:underline">← Back to Markets</Link>
            </div>
        );
    }

    const chartData = stock.history.map((price, i) => ({
        name: `Day ${i + 1}`,
        price,
    }));

    const isPositive = stock.change >= 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Markets
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-extrabold">{stock.ticker}</h1>
                            {isAuthenticated && (
                                <button
                                    onClick={() => toggleFavoriteStock(stock.ticker)}
                                    className={`p-2 rounded-full transition-all duration-300 ${isFavorite
                                        ? "bg-red-500/10 text-red-500"
                                        : "hover:bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
                                        }`}
                                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                                </button>
                            )}
                            <span className="text-sm px-3 py-1 rounded-lg bg-[var(--surface)] text-[var(--muted-foreground)]">{stock.exchange}</span>
                            <span className="text-sm px-3 py-1 rounded-lg bg-[var(--surface)] text-[var(--muted-foreground)]">{stock.asset_type}</span>
                        </div>
                        <p className="text-lg text-[var(--muted-foreground)]">{stock.company_name}</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-extrabold ${flashClass}`}>
                            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`flex items-center gap-2 justify-end text-lg font-medium ${isPositive ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.change_percent.toFixed(2)}%)
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="glass-card p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">Price History (20 Days)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "var(--success)" : "var(--danger)"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? "var(--success)" : "var(--danger)"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                            <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="var(--muted)" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--card-border)",
                                    borderRadius: "12px",
                                    color: "var(--foreground)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? "var(--success)" : "var(--danger)"}
                                strokeWidth={2}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Invest Now CTA */}
                <div className="glass-card p-8 text-center">
                    <h3 className="text-xl font-bold mb-2">Interested in {stock.ticker}?</h3>
                    <p className="text-[var(--muted-foreground)] mb-6">Start tracking this {stock.asset_type.toLowerCase()} and get real-time alerts.</p>
                    <button className="glow-btn pulse-glow text-lg px-8 py-4 flex items-center gap-2 mx-auto">
                        <ExternalLink className="w-5 h-5" /> Invest Now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
