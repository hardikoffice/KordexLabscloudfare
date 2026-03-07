"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    avatar: string;
}

const testimonialData: Testimonial[] = [
    {
        id: 1,
        name: "Alex Rivera",
        role: "Senior Software Engineer",
        content: "The AI model comparison tool is a game-changer. I used to spend hours testing different LLMs for our backend, but KordexLabs lets me compare performance and pricing side-by-side in minutes. It's saved us so much time and money.",
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
    {
        id: 2,
        name: "Samantha Chen",
        role: "Equity Trader",
        content: "Having real-time AI stock data integrated directly with specialized AI news is exactly what I needed. The live ticker keeps me ahead of market shifts, and the technical insights are incredibly accurate for my daily workflow.",
        avatar: "https://i.pravatar.cc/150?u=samantha",
    },
    {
        id: 3,
        name: "Marcus Thorne",
        role: "Tech Founder & AI Enthusiast",
        content: "Staying updated in the AI space is a full-time job, but the curated news section on KordexLabs makes it easy. I rely on their deep dives to separate the hype from the true innovation. It's the first thing I check every morning.",
        avatar: "https://i.pravatar.cc/150?u=marcus",
    },
];

export default function Testimonials() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-transparent">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-[var(--muted-foreground)] bg-clip-text text-transparent"
                >
                    What Our Community Says
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-[var(--muted-foreground)] mt-4 max-w-2xl mx-auto"
                >
                    Join thousands of developers, investors, and enthusiasts navigating the AI revolution with KordexLabs.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonialData.map((testimonial, index) => (
                    <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                        className="glass-card p-8 flex flex-col h-full relative group transition-all duration-300 border border-[var(--card-border)] hover:border-[var(--primary)]/30 overflow-hidden"
                    >
                        {/* Background Glow Effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full" />

                        <Quote className="w-10 h-10 text-[var(--primary)] opacity-20 mb-6" />

                        <p className="text-[var(--muted-foreground)] text-lg italic mb-8 flex-grow leading-relaxed">
                            "{testimonial.content}"
                        </p>

                        <div className="flex items-center gap-4 border-t border-[var(--card-border)] pt-6 group-hover:border-[var(--primary)]/20 transition-colors">
                            <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[var(--card-border)] group-hover:border-[var(--primary)] transition-colors"
                                loading="lazy"
                            />
                            <div>
                                <h4 className="font-bold text-white transition-colors group-hover:text-[var(--primary)]">{testimonial.name}</h4>
                                <p className="text-sm text-[var(--muted-foreground)]">{testimonial.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
