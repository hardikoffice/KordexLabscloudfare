"use client";
import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useStockData } from '@/hooks/useStockData';

interface MarketCardProps {
  ticker: string;
  name: string;
  exchange: string;
  index?: number;
  stats?: {
    latest: number;
    change: number;
    changePercent: number;
    history: number[];
  } | null;
  loading?: boolean;
}

export function MarketCard({ ticker, name, exchange, index = 0, stats, loading }: MarketCardProps) {
  const MiniChart = ({ data: sparkData, positive }: { data: number[]; positive: boolean }) => {
    if (!sparkData || sparkData.length === 0) return null;
    const min = Math.min(...sparkData);
    const max = Math.max(...sparkData);
    const range = max - min || 1;
    const width = 120;
    const height = 40;
    const points = sparkData
      .map((v, i) => `${(i / (sparkData.length - 1)) * width},${height - ((v - min) / range) * height}`)
      .join(" ");

    return (
      <svg width={width} height={height} className="opacity-80">
        <polyline
          fill="none"
          stroke={positive ? "var(--success)" : "var(--danger)"}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/markets/${encodeURIComponent(ticker)}`} className="glass-card p-5 group hover:border-[var(--primary)] transition-all block">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold group-hover:text-[var(--primary)] transition-colors">{ticker}</h3>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--primary)]" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{name}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--muted-foreground)]">{exchange}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="min-h-[48px]">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-1">
                <div className="h-6 w-20 bg-[var(--surface)] rounded"></div>
                <div className="h-4 w-12 bg-[var(--surface)] rounded"></div>
              </div>
            ) : stats ? (
              <>
                <span className="text-lg font-bold">${stats.latest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className={`text-sm font-medium ${stats.change >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)} ({stats.change >= 0 ? "+" : ""}{stats.changePercent.toFixed(2)}%)
                </div>
              </>
            ) : (
              <span className="text-[var(--muted-foreground)] text-sm">NO DATA</span>
            )}
          </div>
          {!loading && stats && <MiniChart data={stats.history} positive={stats.change >= 0} />}
        </div>
      </Link>
    </motion.div>
  );
}
