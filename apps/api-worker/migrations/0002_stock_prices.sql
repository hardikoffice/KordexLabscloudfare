-- Migration: Add stock_prices table for historical daily data
CREATE TABLE IF NOT EXISTS stock_prices (
    ticker TEXT NOT NULL,
    timestamp INTEGER NOT NULL, -- Unix timestamp (UTC)
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER NOT NULL,
    PRIMARY KEY (ticker, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_stock_prices_ticker_time ON stock_prices(ticker, timestamp DESC);
