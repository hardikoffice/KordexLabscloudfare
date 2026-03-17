"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CrosshairMode,
  UTCTimestamp,
  CandlestickSeries,
  AreaSeries
} from 'lightweight-charts';
import { useStockData, Timeframe } from '@/hooks/useStockData';
import { Activity, BarChart2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface StockChartProps {
  ticker: string;
  className?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ ticker, className }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [viewMode, setViewMode] = useState<'candle' | 'line'>('line');
  const { data, loading, error, refetch } = useStockData(ticker, timeframe);

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!data.length) return null;
    const latest = data[data.length - 1];
    const previous = data[0];
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    return {
      price: latest.close,
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(75, 85, 99, 0.2)' },
        horzLines: { color: 'rgba(75, 85, 99, 0.2)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(75, 85, 99, 0.5)',
      },
      timeScale: {
        borderColor: 'rgba(75, 85, 99, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: 400 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const chart = chartRef.current;

    // Clear existing series
    if (candleSeriesRef.current) {
      chart.removeSeries(candleSeriesRef.current);
      candleSeriesRef.current = null;
    }
    if (areaSeriesRef.current) {
      chart.removeSeries(areaSeriesRef.current);
      areaSeriesRef.current = null;
    }

    if (viewMode === 'candle') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
      series.setData(data as any);
      candleSeriesRef.current = series;
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: stats?.isPositive ? '#10B981' : '#EF4444',
        topColor: stats?.isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        bottomColor: stats?.isPositive ? 'rgba(16, 185, 129, 0)' : 'rgba(239, 68, 68, 0)',
        lineWidth: 2,
      });
      series.setData(data.map(d => ({ time: d.time as UTCTimestamp, value: d.close })));
      areaSeriesRef.current = series;
    }

    chart.timeScale().fitContent();
  }, [data, viewMode, stats?.isPositive]);

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold tracking-tight">{ticker}</h2>
            <span className="text-sm font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Stock</span>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-black tabular-nums">
              ${stats?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
            </div>
            {stats && (
              <div className={`flex items-center gap-1 font-bold text-lg ${stats.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setViewMode('line')}
              className={`p-2 rounded-md transition-all ${viewMode === 'line' ? 'bg-zinc-800 text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Line View"
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('candle')}
              className={`p-2 rounded-md transition-all ${viewMode === 'candle' ? 'bg-zinc-800 text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Candlestick View"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>

          {/* Timeframe Select */}
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {(['1D', '1W', '1Y', '5Y', 'All'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === tf ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Manual Refresh (Optional but helpful) */}
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative glass-card border-zinc-800/50 bg-black/20 p-4 rounded-2xl overflow-hidden min-h-[440px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-2xl p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-zinc-300 font-medium">{error}</p>
              <button onClick={() => refetch()} className="text-emerald-500 hover:scale-105 transition-transform font-bold underline">
                Try again
              </button>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
};
