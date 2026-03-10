import { getBlogById } from "@/lib/blogs-server";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Tag, Bookmark } from "lucide-react";
import Link from "next/link";
import { BlogDetailClient } from "./BlogDetailClient";

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const blog = await getBlogById(id);

    if (!blog) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                <Link href="/blogs" className="text-[var(--primary)] hover:underline">← Back to AI News</Link>
            </div>
        );
    }

    return <BlogDetailClient blog={blog} />;
}
