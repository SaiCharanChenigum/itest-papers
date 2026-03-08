import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import ChapterViewerClient from "./ChapterViewerClient";

interface ChapterPageProps {
    params: Promise<{
        subjectSlug: string;
        chapterSlug: string; // This is actually the chapter ID now from the url
    }>;
}

const ChapterPage = async ({ params }: ChapterPageProps) => {
    const resolvedParams = await params;
    const { subjectSlug, chapterSlug: chapterId } = resolvedParams;

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            subject: true,
            contents: {
                orderBy: { order: "asc" }
            }
        }
    });

    if (!chapter || !chapter.subject) {
        return notFound();
    }

    const { subject } = chapter;

    // Determine user access
    const session = await auth();
    let hasAccess = false;

    // First chapter is free
    const isFree = chapter.order === 1;

    if (isFree) {
        hasAccess = true;
    } else if (session?.user?.id) {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                isActive: true,
                endsAt: { gt: new Date() },
                OR: [
                    { planType: "FULL_ACCESS", class: null }, // Combo (All Classes)
                    { planType: "FULL_ACCESS", class: subject.class }, // Premium (Specific Class)
                    { subjectId: subject.id } // Specific Subject
                ]
            }
        });
        if (subscription) hasAccess = true;
    }

    return (
        <article className="section-padding">
            <div className="container-main max-w-5xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-1.5">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href={`/${subjectSlug}`} className="hover:text-primary">Class {subject.class} {subject.name}</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{chapter.title}</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold mb-8">
                    ICSE Class {subject.class} {subject.name} – {chapter.title}
                </h1>

                {chapter.contents.length > 0 ? (
                    <ChapterViewerClient
                        contents={chapter.contents.map(c => {
                            const filePath = path.join(process.cwd(), 'public', c.fileUrl);
                            const fileExists = fs.existsSync(filePath);
                            return {
                                id: c.id,
                                title: c.title,
                                type: c.type,
                                fileUrl: c.fileUrl,
                                isFree: c.isFree,
                                exists: fileExists
                            };
                        })}
                        hasPremiumAccess={hasAccess}
                    />
                ) : (
                    <div className="text-center py-12 card-academic bg-slate-50 border-dashed">
                        <p className="text-muted-foreground">No study materials have been uploaded for this chapter yet.</p>
                    </div>
                )}
            </div>
        </article>
    );
};

export default ChapterPage;
