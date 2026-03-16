import { create } from "zustand";
import { useNotificationStore } from "@/store/notificationStore";

interface DashboardStore {
  savedBlogs: string[];
  favoriteStocks: string[];
  toggleSavedBlog: (id: string) => Promise<void>;
  toggleFavoriteStock: (ticker: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchSavedBlogs: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  savedBlogs: [],
  favoriteStocks: [],
  fetchFavorites: async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const token = authData ? JSON.parse(authData)?.state?.token : null;
      console.log("Fetching favorites with token:", token ? "exists" : "missing");

      if (!token) return;

      const res = await fetch(`${API_BASE}/favorites/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ favoriteStocks: data.map((f: any) => f.ticker) });
      } else {
        console.error("Fetch favorites failed:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }
  },
  fetchSavedBlogs: async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const token = authData ? JSON.parse(authData)?.state?.token : null;
      if (!token) return;

      const res = await fetch(`${API_BASE}/saved-blogs/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ savedBlogs: data.map((b: any) => b.blog_id) });
      }
    } catch (err) {
      console.error("Failed to fetch saved blogs:", err);
    }
  },
  toggleSavedBlog: async (id) => {
    const isSaved = get().savedBlogs.includes(id);
    const authData = localStorage.getItem('auth-storage');
    const token = authData ? JSON.parse(authData)?.state?.token : null;
    const { addNotification } = useNotificationStore.getState();

    if (!token) {
      addNotification("Please login to save blogs", "info");
      return;
    }

    try {
      if (isSaved) {
        const res = await fetch(`${API_BASE}/saved-blogs/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          set((s) => ({ savedBlogs: s.savedBlogs.filter((b) => b !== id) }));
          addNotification("Blog removed from reading list", "info");
        } else {
          addNotification("Failed to remove blog", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/saved-blogs`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ blog_id: id })
        });
        if (res.ok) {
          set((s) => ({ savedBlogs: [...s.savedBlogs, id] }));
          addNotification("Blog saved to your dashboard!", "success");
        } else {
          addNotification("Failed to save blog", "error");
        }
      }
    } catch (err) {
      console.error("Toggle saved blog failed:", err);
      addNotification("Network error. Please try again.", "error");
    }
  },
  toggleFavoriteStock: async (ticker) => {
    const isFav = get().favoriteStocks.includes(ticker);
    const authData = localStorage.getItem('auth-storage');
    const token = authData ? JSON.parse(authData)?.state?.token : null;
    const { addNotification } = useNotificationStore.getState();

    console.log(`Toggling favorite for ${ticker}. Current isFav: ${isFav}. Token: ${token ? "exists" : "missing"}`);

    if (!token) {
      console.warn("No auth token found, cannot toggle favorite.");
      addNotification("Please login to save favorites", "info");
      return;
    }

    try {
      if (isFav) {
        const res = await fetch(`${API_BASE}/favorites/${ticker}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          set((s) => ({ favoriteStocks: s.favoriteStocks.filter((t) => t !== ticker) }));
          addNotification(`${ticker} removed from favorites`, "info");
        } else {
          console.error("Delete favorite failed:", res.status, await res.text());
          addNotification(`Failed to remove ${ticker}`, "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ticker })
        });
        if (res.ok) {
          set((s) => ({ favoriteStocks: [...s.favoriteStocks, ticker] }));
          addNotification(`${ticker} added to favorites!`, "success");
        } else {
          console.error("Post favorite failed:", res.status, await res.text());
          addNotification(`Failed to add ${ticker}`, "error");
        }
      }
    } catch (err) {
      console.error("Toggle favorite failed:", err);
      addNotification("Network error. Please try again.", "error");
    }
  },
}));
