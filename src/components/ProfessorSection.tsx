"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, Star } from "lucide-react";

const highlights = [
    { icon: GraduationCap, label: "M.Sc., B.Ed." },
    { icon: BookOpen, label: "30 Years Experience" },
    { icon: Award, label: "ICSE • IGCSE • IB" },
    { icon: Star, label: "Proven Board Results" },
];

const ProfessorSection = () => (
    <section className="section-padding">
        <div className="container-main">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Meet Your Educator</h2>
                <p className="text-muted-foreground">Learn from an expert with decades of proven results</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto rounded-2xl border bg-card p-8 shadow-sm"
            >
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Rajendra Burriwar</h3>
                <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full mb-4">
                    30+ Years of Excellence
                </span>

                <p className="text-sm font-medium text-primary mb-1">M.Sc., B.Ed.</p>
                <p className="text-sm text-muted-foreground mb-4">
                    Biology &amp; Chemistry Educator&ensp;|&ensp;ICSE • IGCSE
                </p>

                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    A highly accomplished Biology and Chemistry educator with 30&nbsp;years of teaching experience across ICSE and IGCSE curricula. Renowned for a strong track record in board examination results, concept-driven teaching, and structured academic planning.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    Expertise lies in simplifying complex scientific concepts, fostering analytical thinking, and building strong foundational understanding. Committed to student success with a proven history of guiding learners towards high scores and consistently outstanding performance in Secondary and Senior Secondary grades.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {highlights.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-sm">
                            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0">
                                <Icon className="h-4 w-4" />
                            </span>
                            <span className="font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    </section>
);

export default ProfessorSection;