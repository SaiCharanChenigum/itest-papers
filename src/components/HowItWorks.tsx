"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, CreditCard, Unlock } from "lucide-react";

const steps = [
    { icon: UserPlus, title: "Register", desc: "Create a free account in seconds" },
    { icon: BookOpen, title: "Access Free Chapter", desc: "Try a complete chapter for free" },
    { icon: CreditCard, title: "Upgrade Plan", desc: "Choose a plan that fits your needs" },
    { icon: Unlock, title: "Unlock All Chapters", desc: "Get full access to all materials" },
];

const HowItWorks = () => (
    <section className="section-alt section-padding">
        <div className="container-main">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h2>
                <p className="text-muted-foreground">Get started in 4 simple steps</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, i) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 }}
                        className="text-center"
                    >
                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <step.icon className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                                {i + 1}
                            </span>
                        </div>
                        <h3 className="font-bold mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default HowItWorks;
