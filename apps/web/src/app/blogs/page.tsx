import { getAllBlogs } from "@/lib/blogs-server";
import Link from "next/link";
import { Clock, Tag, Search, Bookmark } from "lucide-react";
import { BlogsClientList } from "./BlogsClientList";

export default async function BlogsPage() {
    const allBlogs = await getAllBlogs();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">AI News</span>
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">Stay ahead with the latest in artificial intelligence.</p>
            </div>

            <BlogsClientList initialBlogs={allBlogs} />
        </div>
    );
}
