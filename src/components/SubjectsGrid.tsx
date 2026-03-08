"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Microscope, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NavButton } from "@/components/ui/NavButton";

const subjects = [
    { title: "Biology Class 9", desc: "Cell, Tissues, Plant Physiology & more", to: "/icse-class-9-biology", icon: Microscope, color: "text-secondary" },
    { title: "Chemistry Class 9", desc: "Matter, Atoms, Chemical Reactions & more", to: "/icse-class-9-chemistry", icon: FlaskConical, color: "text-primary" },
    { title: "Biology Class 10", desc: "Genetics, Human Body Systems & more", to: "/icse-class-10-biology", icon: Microscope, color: "text-secondary" },
    { title: "Chemistry Class 10", desc: "Acids, Bases, Organic Chemistry & more", to: "/icse-class-10-chemistry", icon: FlaskConical, color: "text-primary" },
];

const SubjectsGrid = () => (
    <section id="subjects" className="section-padding">
        <div className="container-main">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Choose Your Subject</h2>
                <p className="text-muted-foreground max-w-md mx-auto">Chapter-wise study materials for ICSE Biology and Chemistry</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subjects.map((s, i) => (
                    <motion.div
                        key={s.to}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card-academic flex flex-col"
                    >
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-4 ${s.color}`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1">{s.desc}</p>
                        <NavButton href={s.to} variant="outline" size="sm" className="w-full">
                            View Chapters <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </NavButton>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default SubjectsGrid;
