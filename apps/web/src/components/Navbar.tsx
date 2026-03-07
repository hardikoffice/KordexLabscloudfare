"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "AI News" },
    { href: "/tools", label: "AI Tools" },
    { href: "/markets", label: "Markets" },
    { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 overflow-hidden">
                            <Image
                                src="/logo-v2.png"
                                alt="KordexLabs Logo"
                                fill
                                className="object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-screen"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                            KordexLabs
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks
                            .filter(link => link.label !== "Dashboard" || isAuthenticated)
                            .map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                        ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">

                        <div className="hidden md:flex items-center gap-2 border-l border-[var(--card-border)] pl-3 ml-1">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--card-border)]">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                                            <UserIcon className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-200 truncate max-w-[100px]">
                                            {user?.full_name || user?.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg text-gray-400 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-white transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-lg shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)]"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-card mx-4 mb-4 overflow-hidden border border-[var(--card-border)]"
                    >
                        <div className="p-4 flex flex-col gap-2">
                            {navLinks
                                .filter(link => link.label !== "Dashboard" || isAuthenticated)
                                .map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium ${pathname === link.href
                                            ? "bg-[var(--primary)] text-white shadow-lg"
                                            : "hover:bg-[var(--surface-hover)]"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            <div className="h-px bg-[var(--card-border)] my-2" />
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-3 flex items-center gap-3 bg-[var(--surface-hover)] rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-200">{user?.full_name}</span>
                                            <span className="text-xs text-[var(--muted-foreground)]">{user?.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-bold text-[var(--danger)] bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="px-4 py-3 rounded-xl text-sm font-bold text-center border border-[var(--card-border)] hover:bg-[var(--surface-hover)] transition-all"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setMobileOpen(false)}
                                        className="px-4 py-3 rounded-xl text-sm font-bold text-center bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
