import { blogs as staticBlogs } from "./data/blogs";

export interface Blog {
    id: string;
    title: string;
    author: string;
    read_time_minutes: number;
    hero_image_url: string;
    tags: string[];
    published_at: string;
    content_markdown: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kordexlabs.onrender.com/api";

export async function fetchAllBlogs(): Promise<Blog[]> {
    try {
        const response = await fetch(`${API_URL}/blogs`, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data: Blog[] = await response.json();
        if (data.length > 0) return data;
        // API returned empty — fall back to static data
        return staticBlogs;
    } catch (error) {
        console.error("Error fetching blogs (using static fallback):", error);
        return staticBlogs;
    }
}

export async function fetchTrendingBlogs(): Promise<Blog[]> {
    try {
        const response = await fetch(`${API_URL}/blogs/trending`, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error("Failed to fetch trending blogs");
        const data: Blog[] = await response.json();
        if (data.length > 0) return data;
        // API returned empty — fall back to static data (first 3)
        return staticBlogs.slice(0, 3);
    } catch (error) {
        console.error("Error fetching trending blogs (using static fallback):", error);
        return staticBlogs.slice(0, 3);
    }
}

export async function fetchBlogById(id: string): Promise<Blog | null> {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error("Failed to fetch blog");
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog (checking static fallback):", error);
        // Try to find in static data
        const staticBlog = staticBlogs.find(b => b.id === id);
        return staticBlog || null;
    }
}
