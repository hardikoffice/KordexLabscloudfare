import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--card-border)] mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="KordexLabs"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                                KordexLabs
                            </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            The premier dashboard for the AI ecosystem. Stay ahead with curated news, tool comparisons, and real-time market data.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Platform</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/blogs" className="text-sm hover:text-[var(--primary)] transition-colors">AI News</Link>
                            <Link href="/tools" className="text-sm hover:text-[var(--primary)] transition-colors">AI Tools</Link>
                            <Link href="/markets" className="text-sm hover:text-[var(--primary)] transition-colors">Markets</Link>
                            <Link href="/dashboard" className="text-sm hover:text-[var(--primary)] transition-colors">Dashboard</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Resources</h4>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-[var(--muted-foreground)]">API Documentation</span>
                            <span className="text-sm text-[var(--muted-foreground)]">Developer Guide</span>
                            <span className="text-sm text-[var(--muted-foreground)]">Status Page</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Company</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/about" className="text-sm hover:text-[var(--primary)] transition-colors">About</Link>
                            <Link href="/privacy" className="text-sm hover:text-[var(--primary)] transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-sm hover:text-[var(--primary)] transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted-foreground)]">
                    © 2026 KordexLabs. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
