import { useState, useEffect, useCallback, useRef } from 'react';

export type Timeframe = '1D' | '1W' | '1Y' | '5Y' | 'All';

export interface StockDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useStockData(ticker: string, timeframe: Timeframe) {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getParams = useCallback((tf: Timeframe) => {
    const to = Math.floor(Date.now() / 1000);
    let from: number;
    let resolution: string;

    switch (tf) {
      case '1D':
        from = to - 24 * 60 * 60;
        resolution = '5';
        break;
      case '1W':
        from = to - 7 * 24 * 60 * 60;
        resolution = '60';
        break;
      case '1Y':
        from = to - 365 * 24 * 60 * 60;
        resolution = 'D';
        break;
      case '5Y':
        from = to - 5 * 365 * 24 * 60 * 60;
        resolution = 'W';
        break;
      case 'All':
        from = to - 20 * 365 * 24 * 60 * 60; // 20 years back
        resolution = 'M';
        break;
      default:
        from = to - 24 * 60 * 60;
        resolution = 'D';
    }
    return { from, to, resolution };
  }, []);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);

    const { from, to, resolution } = getParams(timeframe);
    
    try {
      const response = await fetch(`/api/stocks/${ticker}?resolution=${resolution}&from=${from}&to=${to}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch data');
      }
      const newData = await response.json();
      setData(newData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching stock data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [ticker, timeframe, getParams]);

  useEffect(() => {
    fetchData(true);

    // Setup 30-minute polling
    // 30 minutes = 30 * 60 * 1000 ms
    const POLL_INTERVAL = 30 * 60 * 1000;
    refreshIntervalRef.current = setInterval(() => {
      fetchData(false);
    }, POLL_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
}
