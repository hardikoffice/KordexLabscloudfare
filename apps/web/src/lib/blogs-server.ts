import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { blogs as staticBlogs, Blog } from './data/blogs';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content/blog');

export async function getAllBlogs(): Promise<Blog[]> {
    let aiBlogs: Blog[] = [];

    // 1. Read MDX files from content/blog
    if (fs.existsSync(BLOG_CONTENT_DIR)) {
        const files = fs.readdirSync(BLOG_CONTENT_DIR);

        aiBlogs = files
            .filter(file => file.endsWith('.mdx'))
            .map(file => {
                const filePath = path.join(BLOG_CONTENT_DIR, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContent);

                return {
                    id: data.slug || file.replace('.mdx', ''),
                    title: data.title,
                    author: data.author || 'KordexLabs AI',
                    read_time_minutes: Math.ceil(content.split(' ').length / 200),
                    hero_image_url: data.image || '/images/blog/default-ai.png',
                    tags: data.tags || [],
                    published_at: data.date || new Date().toISOString().split('T')[0],
                    content_markdown: content,
                } as Blog;
            });
    }

    // 2. Merge with static blogs
    // Note: We use static blogs for defaults, and AI blogs for new content
    const allBlogs = [...aiBlogs, ...staticBlogs].sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    return allBlogs;
}

export async function getBlogById(id: string): Promise<Blog | undefined> {
    const all = await getAllBlogs();
    return all.find(b => b.id === id);
}
