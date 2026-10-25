"use client";

import { motion } from "framer-motion";
import { NavButton } from "@/components/ui/NavButton";

export interface MaterialPreviewItem {
    id: string;
    title: string;
    imageUrl: string;
    order?: number;
}

interface SamplePreviewProps {
    hasSubscription?: boolean;
    previews?: MaterialPreviewItem[];
}

const SamplePreview = ({ hasSubscription = false, previews }: SamplePreviewProps) => {
    // Hide the entire section completely when 0 images exist
    if (!previews || previews.length === 0) {
        return null;
    }

    const items = previews;

    return (
        <section className="section-padding">
            <div className="container-main">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">Preview Our Materials</h2>
                    <p className="text-muted-foreground">High-quality test papers and structured notes</p>
                </div>
                <div className={`grid gap-8 items-center ${items.length === 1 ? "max-w-xl mx-auto" : items.length === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="card-academic p-4"
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full rounded-lg object-contain max-h-[550px] mx-auto shadow-xs"
                            />
                            <p className="mt-3 text-sm font-medium text-center text-muted-foreground">{item.title}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Only show Unlock Premium button if user does NOT have an active subscription */}
                {!hasSubscription && (
                    <div className="text-center mt-8">
                        <NavButton href="/pricing" size="lg">
                            Unlock Premium
                        </NavButton>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SamplePreview;
