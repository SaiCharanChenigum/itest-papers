import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import { Mail } from "lucide-react";
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

    // Query configured slots for this subject
    let subjectSlots: string[] = ['NOTES', 'TEST_PAPER'];
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{ slots: string[] | null }>>(
            'SELECT slots FROM "Subject" WHERE id = $1',
            subject.id
        );
        if (rows[0]?.slots && rows[0].slots.length > 0) {
            subjectSlots = rows[0].slots;
        }
    } catch (e) {
        console.error("Failed to fetch slots for subject:", e);
    }

    // Merge configured subject slots with existing uploaded chapter contents
    const allSlotTypes = Array.from(new Set([...subjectSlots, ...chapter.contents.map(c => c.type)]));

    const formatSlotTitle = (typeStr: string) => {
        return typeStr
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const finalContents = allSlotTypes.map(slotType => {
        const found = chapter.contents.find(c => c.type === slotType);
        if (found) {
            const isExternalUrl = found.fileUrl.startsWith('http');
            const fileExists = isExternalUrl ? true : fs.existsSync(path.join(process.cwd(), 'public', found.fileUrl));
            return {
                id: found.id,
                title: found.title,
                type: found.type,
                fileUrl: found.fileUrl,
                isFree: found.isFree,
                exists: fileExists,
                isComingSoon: false
            };
        } else {
            return {
                id: `coming-soon-${slotType}`,
                title: `${chapter.title} ${formatSlotTitle(slotType)}`,
                type: slotType,
                fileUrl: "",
                isFree: true,
                exists: false,
                isComingSoon: true
            };
        }
    });

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

                {finalContents.length > 0 ? (
                    <ChapterViewerClient
                        contents={finalContents}
                        hasPremiumAccess={hasAccess}
                    />
                ) : (
                    <div className="text-center py-12 card-academic bg-slate-50 border-dashed">
                        <p className="text-muted-foreground">No study materials have been configured for this chapter yet.</p>
                    </div>
                )}

                {/* Solutions Notice */}
                <div className="mt-10 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground text-sm sm:text-base">Looking for Test Paper Solutions?</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                For complete step-by-step solutions and answer keys, please reach out to us at{" "}
                                <a
                                    href="mailto:itestpapers@gmail.com"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    itestpapers@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                    <a
                        href="mailto:itestpapers@gmail.com?subject=Request%20for%20Solutions%20-%20ICSE"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border hover:border-primary/40 text-foreground font-semibold text-xs sm:text-sm shadow-xs hover:bg-accent transition-colors shrink-0"
                    >
                        <Mail className="h-4 w-4 text-primary" /> Email for Solutions
                    </a>
                </div>
            </div>
        </article>
    );
};

export default ChapterPage;
