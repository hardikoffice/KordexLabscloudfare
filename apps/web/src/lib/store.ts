"use client";
import { create } from "zustand";


interface DashboardStore {
  savedBlogs: string[];
  pinnedTools: string[];
  favoriteStocks: string[];
  toggleSavedBlog: (id: string) => void;
  togglePinnedTool: (id: string) => void;
  toggleFavoriteStock: (ticker: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  savedBlogs: ["1", "3"],
  pinnedTools: ["1", "4"],
  favoriteStocks: ["NVDA", "MSFT", "GOOGL"],
  toggleSavedBlog: (id) =>
    set((s) => ({
      savedBlogs: s.savedBlogs.includes(id)
        ? s.savedBlogs.filter((b) => b !== id)
        : [...s.savedBlogs, id],
    })),
  togglePinnedTool: (id) =>
    set((s) => ({
      pinnedTools: s.pinnedTools.includes(id)
        ? s.pinnedTools.filter((t) => t !== id)
        : [...s.pinnedTools, id],
    })),
  toggleFavoriteStock: (ticker) =>
    set((s) => ({
      favoriteStocks: s.favoriteStocks.includes(ticker)
        ? s.favoriteStocks.filter((t) => t !== ticker)
        : [...s.favoriteStocks, ticker],
    })),
}));
