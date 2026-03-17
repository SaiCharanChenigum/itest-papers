"use client";

import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-accent/30 py-16 md:py-24 border-b border-border text-center">
                <div className="container-main px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
                    <p className="text-lg text-muted-foreground">
                        Have a question or feedback? We're here to help you.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-20">
                <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Get in touch</h2>

                    <div className="space-y-8">
                        {/* Email Card */}
                        <div className="flex gap-6 items-start">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground text-lg">Email</p>
                                <a
                                    href="mailto:itestpapers.support@gmail.com"
                                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                                >
                                    itestpapers.support@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="flex gap-6 items-start">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground text-lg">Phone</p>
                                <a
                                    href="tel:+918106207258"
                                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                                >
                                    +91 81062 07258
                                </a>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="flex gap-6 items-start">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground text-lg">Address</p>
                                <p className="text-base text-muted-foreground">
                                    Mumbai, Maharashtra, India
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Response Time Info */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 mt-12">
                        <h3 className="font-bold text-foreground mb-3 text-lg">Response Time</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We typically respond within 24 hours on business days. For urgent queries regarding order delivery, please call our support number directly.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
