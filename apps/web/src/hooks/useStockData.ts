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
    const toDate = new Date();
    const to = toDate.toISOString().split('T')[0];
    let fromDate = new Date();
    let multiplier = '1';
    let timespan = 'day';

    switch (tf) {
      case '1D':
        fromDate.setDate(toDate.getDate() - 1);
        multiplier = '30';
        timespan = 'minute';
        break;
      case '1W':
        fromDate.setDate(toDate.getDate() - 7);
        multiplier = '1';
        timespan = 'hour';
        break;
      case '1Y':
        fromDate.setFullYear(toDate.getFullYear() - 1);
        multiplier = '1';
        timespan = 'day';
        break;
      case '5Y':
        fromDate.setFullYear(toDate.getFullYear() - 5);
        multiplier = '1';
        timespan = 'week';
        break;
      case 'All':
        fromDate.setFullYear(toDate.getFullYear() - 20);
        multiplier = '1';
        timespan = 'month';
        break;
    }
    
    const from = fromDate.toISOString().split('T')[0];
    return { from, to, multiplier, timespan };
  }, []);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);

    const { from, to, multiplier, timespan } = getParams(timeframe);
    
    try {
      const response = await fetch(`/api/stocks/${ticker}?multiplier=${multiplier}&timespan=${timespan}&from=${from}&to=${to}`);
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
