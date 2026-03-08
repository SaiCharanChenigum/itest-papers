"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const HeroSection = () => (
    <section className="section-padding overflow-hidden">
        <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4 tracking-wide uppercase">
                        ICSE Board Preparation
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                        ICSE Class 9 & 10{" "}
                        <span className="gradient-text">Test Papers, Notes</span>{" "}
                        & Study Materials
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                        Chapter-wise Biology & Chemistry preparation based on ICSE Board pattern. Start with a free chapter today.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href="#subjects">Try Free Topic</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="#subjects">View Subjects</Link>
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <img src="/hero-student.png" alt="Student studying biology and chemistry" className="w-full max-w-md rounded-2xl" />
                </motion.div>
            </div>
        </div>
    </section>
);

export default HeroSection;
