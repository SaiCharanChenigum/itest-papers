"use client";

import { motion } from "framer-motion";
import { NavButton } from "@/components/ui/NavButton";

interface SamplePreviewProps {
    hasSubscription?: boolean;
}

const SamplePreview = ({ hasSubscription = false }: SamplePreviewProps) => (
    <section className="section-padding">
        <div className="container-main">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Preview Our Materials</h2>
                <p className="text-muted-foreground">High-quality test papers and structured notes</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="card-academic p-4"
                >
                    <img src="/homepage_middle_notes_1772274623642.png" alt="Mock test paper preview" className="w-full rounded-lg" />
                    <p className="mt-3 text-sm font-medium text-center text-muted-foreground">Sample Test Paper</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="card-academic p-4"
                >
                    <img src="/homepage_subjects_1772274552257.png" alt="Chapter notes preview" className="w-full rounded-lg" />
                    <p className="mt-3 text-sm font-medium text-center text-muted-foreground">Sample Chapter Notes</p>
                </motion.div>
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

export default SamplePreview;
