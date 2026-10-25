import Link from "next/link";
import { prisma } from "@/lib/db";
import { BookOpen, Sparkles, ArrowRight, Clock, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
    title: "Cambridge IGCSE Study Materials & Test Papers | iTestPapers",
    description: "Chapter-wise notes, test papers, and practice materials for Cambridge IGCSE Grade 9 and Grade 10.",
};

export default async function IGCSEPage() {
    let igcseSubjects: any[] = [];
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            'SELECT id FROM "Subject" WHERE UPPER(board) = \'IGCSE\' AND "isActive" = true ORDER BY class ASC, name ASC'
        );
        if (rows.length > 0) {
            const ids = rows.map(r => r.id);
            igcseSubjects = await prisma.subject.findMany({
                where: {
                    id: { in: ids }
                },
                include: {
                    chapters: {
                        select: { id: true, title: true }
                    }
                },
                orderBy: [{ class: "asc" }, { name: "asc" }]
            });
        }
    } catch (e) {
        console.error("Failed to fetch IGCSE subjects:", e);
    }

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-16 pb-12 border-b border-border/40">
                <div className="container-main max-w-5xl text-center px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                        <Award className="w-3.5 h-3.5" /> Cambridge IGCSE Curriculum
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                        Cambridge IGCSE Study Materials
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Comprehensive syllabus notes, past paper questions, and topical practice papers tailored specifically for Cambridge IGCSE students.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="container-main max-w-5xl px-4 mt-12">
                {igcseSubjects.length > 0 ? (
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">Available IGCSE Subjects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {igcseSubjects.map((sub) => {
                                const slug = `igcse-class-${sub.class}-${sub.name.toLowerCase()}`;
                                return (
                                    <div key={sub.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
                                                Grade / Class {sub.class}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {sub.chapters.length} Chapters
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">
                                            IGCSE Class {sub.class} {sub.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                            {sub.description || `Chapter-wise notes, test papers and practice questions for IGCSE Class ${sub.class} ${sub.name}.`}
                                        </p>
                                        <Button asChild className="w-full">
                                            <Link href={`/${slug}`}>
                                                Explore Material <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Empty / Coming Soon Screen */
                    <div className="bg-white border border-border rounded-3xl p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-xs">
                            <Clock className="w-10 h-10" />
                        </div>

                        <span className="inline-block text-xs font-bold px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-widest mb-3">
                            Coming Soon
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                            IGCSE Curriculum Under Preparation
                        </h2>

                        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                            We are actively crafting chapter-wise study materials, revision notes, and exam-style test papers for the Cambridge IGCSE curriculum (Grades 9 & 10).
                        </p>

                        {/* Curriculum Features Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                                <h4 className="font-bold text-sm text-slate-800">Topical Notes</h4>
                                <p className="text-xs text-slate-500 mt-1">Syllabus-matched concept notes & summary points.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                                <h4 className="font-bold text-sm text-slate-800">Exam Test Papers</h4>
                                <p className="text-xs text-slate-500 mt-1">Structured & multiple-choice question papers.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
                                <h4 className="font-bold text-sm text-slate-800">Model Answers</h4>
                                <p className="text-xs text-slate-500 mt-1">Examiner tips and step-by-step marking schemes.</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
