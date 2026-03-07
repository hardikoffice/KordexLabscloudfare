"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STORAGE_KEY = "kordex_ai_callout_dismissed";

export default function AICallout() {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Check if the user has already dismissed the callout in this browser session
        const isDismissed = sessionStorage.getItem(STORAGE_KEY);

        if (!isDismissed) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // 3-second delay

            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem(STORAGE_KEY, "true");
    };

    if (!shouldRender) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed z-50 bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto md:w-80"
                >
                    <div className="bg-white border border-gray-200 shadow-2xl p-6 md:rounded-2xl relative overflow-hidden group">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Market Insights</span>
                            </div>

                            <h3 className="text-gray-900 text-lg font-bold leading-tight mb-4">
                                Want to invest in <span className="text-blue-600">AI stocks?</span>
                            </h3>

                            <Link
                                href="/markets"
                                onClick={handleDismiss}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-all hover:shadow-lg active:scale-95"
                            >
                                Start Trading AI
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
