"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Zap, Download } from "lucide-react";

const items = [
    { icon: BookOpen, label: "ICSE Pattern Based", desc: "Aligned with latest ICSE syllabus" },
    { icon: FileText, label: "Chapter-wise Notes", desc: "Structured, easy-to-follow notes" },
    { icon: Zap, label: "Instant Access", desc: "Start learning immediately" },
    { icon: Download, label: "Downloadable PDFs", desc: "Offline study support" },
];

const TrustSection = () => (
    <section className="section-alt section-padding">
        <div className="container-main">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {items.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center p-6"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default TrustSection;
