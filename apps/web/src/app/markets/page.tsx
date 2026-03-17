"use client";
import React from 'react';
import { stocks } from "@/lib/data/stocks";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { MarketCard } from "@/components/markets/MarketCard";

export default function MarketsPage() {
    const stocksList = stocks.filter((s) => s.asset_type === "Stock");
    const indices = stocks.filter((s) => s.asset_type === "Index");

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-[var(--success)] to-[var(--secondary)] bg-clip-text text-transparent">AI Markets</span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">Track AI stocks and indices in real time.</p>
            </motion.div>

            {/* Indices */}
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--primary)]" /> Indices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {indices.map((s, i) => (
                    <MarketCard 
                        key={s.ticker} 
                        ticker={s.ticker} 
                        name={s.company_name} 
                        exchange={s.exchange} 
                        index={i} 
                    />
                ))}
            </div>

            {/* Stocks */}
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--success)]" /> AI Stocks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocksList.map((s, i) => (
                    <MarketCard 
                        key={s.ticker} 
                        ticker={s.ticker} 
                        name={s.company_name} 
                        exchange={s.exchange} 
                        index={i + indices.length} 
                    />
                ))}
            </div>
        </div>
    );
}
