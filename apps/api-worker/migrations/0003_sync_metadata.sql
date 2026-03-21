-- Create a table to track the last sync attempt for each ticker
CREATE TABLE IF NOT EXISTS sync_metadata (
    ticker TEXT PRIMARY KEY,
    last_sync_time INTEGER NOT NULL
);
