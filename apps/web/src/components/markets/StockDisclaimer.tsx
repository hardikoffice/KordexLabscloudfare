"use client";
import React from 'react';
import { Info } from "lucide-react";
import { motion } from "framer-motion";

export function StockDisclaimer() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6"
        >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                This stock's data is not realtime and updates every morning at <span className="text-[var(--foreground)] font-medium">8:00 AM UTC</span>.
            </p>
        </motion.div>
    );
}
