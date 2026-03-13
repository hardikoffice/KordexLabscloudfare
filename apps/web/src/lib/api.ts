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

const API_URL = process.env.NEXT_PUBLIC_NEWS_API_URL || "https://kordexlabs.onrender.com/api";

// Default placeholder image for blogs missing a hero image
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80";

function normalizeBlog(blog: Blog): Blog {
    return {
        ...blog,
        hero_image_url: blog.hero_image_url || DEFAULT_HERO_IMAGE,
        tags: Array.isArray(blog.tags) ? blog.tags : [],
    };
}

export async function fetchAllBlogs(): Promise<Blog[]> {
    try {
        // Render free tier can take 30-60s on cold start — use a generous timeout
        const response = await fetch(`${API_URL}/blogs`, { signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data: Blog[] = await response.json();
        if (data.length > 0) return data.map(normalizeBlog);
        return staticBlogs;
    } catch (error) {
        console.error("Error fetching blogs (using static fallback):", error);
        return staticBlogs;
    }
}

export async function fetchTrendingBlogs(): Promise<Blog[]> {
    try {
        const response = await fetch(`${API_URL}/blogs/trending`, { signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error("Failed to fetch trending blogs");
        const data: Blog[] = await response.json();
        if (data.length > 0) return data.map(normalizeBlog);
        return staticBlogs.slice(0, 3);
    } catch (error) {
        console.error("Error fetching trending blogs (using static fallback):", error);
        return staticBlogs.slice(0, 3);
    }
}

export async function fetchBlogById(id: string): Promise<Blog | null> {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`, { signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error("Failed to fetch blog");
        const blog: Blog = await response.json();
        return normalizeBlog(blog);
    } catch (error) {
        console.error("Error fetching blog (checking static fallback):", error);
        const staticBlog = staticBlogs.find(b => b.id === id);
        return staticBlog || null;
    }
}
