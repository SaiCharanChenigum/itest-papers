import { BookOpen, Target, Users, Award } from "lucide-react";

export const metadata = {
    title: "About Us | iTestPapers",
    description: "Learn about our mission to help ICSE students succeed.",
};

const values = [
    {
        icon: BookOpen,
        title: "Quality Content",
        description: "Crafted by educators with 20+ years of ICSE teaching expertise.",
    },
    {
        icon: Target,
        title: "Focus",
        description: "Manageable chapter-wise breakdowns to master one topic at a time.",
    },
    {
        icon: Users,
        title: "Student-First",
        description: "Exam-oriented materials designed around how students actually learn.",
    },
    {
        icon: Award,
        title: "Results",
        description: "Thousands of students have successfully improved their board scores.",
    },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero */}
            <section className="bg-accent/30 py-16 md:py-24 border-b border-border">
                <div className="container-main px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        About <span className="text-primary">iTestPapers</span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Empowering ICSE Class 9 & 10 students across India with chapter-wise structured preparation.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-20">
                <div className="container-main px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            iTestPapers was born to solve a clear problem: ICSE students struggle to find well-organized, curriculum-aligned study materials.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We partnered with senior faculty members, including Prof. Rajendra with 20+ years of teaching experience, to create test papers and notes that are precise and exam-focused.
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="grid sm:grid-cols-2 gap-8 pt-8">
                        {values.map((v) => (
                            <div key={v.title} className="bg-card p-6 rounded-2xl border border-border space-y-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <v.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-foreground text-xl">{v.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-8">
                        <a
                            href="/contact"
                            className="inline-flex h-12 px-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                        >
                            Speak to Support
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
