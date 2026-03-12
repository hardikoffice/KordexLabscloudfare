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
        const response = await fetch(`${API_URL}/blogs`);
        if (!response.ok) throw new Error("Failed to fetch blogs");
        return await response.ok ? response.json() : [];
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return [];
    }
}

export async function fetchTrendingBlogs(): Promise<Blog[]> {
    try {
        const response = await fetch(`${API_URL}/blogs/trending`);
        if (!response.ok) throw new Error("Failed to fetch trending blogs");
        return await response.ok ? response.json() : [];
    } catch (error) {
        console.error("Error fetching trending blogs:", error);
        return [];
    }
}

export async function fetchBlogById(id: string): Promise<Blog | null> {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch blog");
        return await response.json();
    } catch (error) {
        console.error("Error fetching blog:", error);
        return null;
    }
}
