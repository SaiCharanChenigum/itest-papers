"use client";

import Link from "next/link";

const Footer = () => (
    <footer className="bg-foreground text-primary-foreground">
        <div className="container-main section-padding">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-lg font-bold mb-4 text-primary">itestpapers</h3>
                    <p className="text-sm text-primary-foreground/70 leading-relaxed">
                        ICSE Class 9 & 10 chapter-wise test papers, notes & study materials for Biology and Chemistry.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/50">Subjects</h4>
                    <ul className="space-y-2 text-sm text-primary-foreground/70">
                        <li><Link href="/icse-class-9-biology" className="hover:text-primary-foreground transition-colors">Class 9 Biology</Link></li>
                        <li><Link href="/icse-class-9-chemistry" className="hover:text-primary-foreground transition-colors">Class 9 Chemistry</Link></li>
                        <li><Link href="/icse-class-10-biology" className="hover:text-primary-foreground transition-colors">Class 10 Biology</Link></li>
                        <li><Link href="/icse-class-10-chemistry" className="hover:text-primary-foreground transition-colors">Class 10 Chemistry</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/50">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-primary-foreground/70">
                        <li><Link href="/pricing" className="hover:text-primary-foreground transition-colors">Pricing</Link></li>
                        <li><Link href="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
                        <li><Link href="/login" className="hover:text-primary-foreground transition-colors">Login</Link></li>
                        <li><Link href="/register" className="hover:text-primary-foreground transition-colors">Register</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/50">Legal</h4>
                    <ul className="space-y-2 text-sm text-primary-foreground/70">
                        <li><Link href="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms & Conditions</Link></li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
                © {new Date().getFullYear()} itestpapers.com — All rights reserved.
            </div>
        </div>
    </footer>
);

export default Footer;
