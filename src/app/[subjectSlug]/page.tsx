import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import SubjectClient from "./SubjectClient";

interface SubjectPageProps {
    params: Promise<{
        subjectSlug: string;
    }>;
}

const SubjectPage = async ({ params }: SubjectPageProps) => {
    const resolvedParams = await params;
    const subjectSlug = resolvedParams.subjectSlug;

    // Parse board, class and subject from slug e.g. "icse-class-9-biology" -> board: "ICSE", class: 9, subject: "Biology"
    const slugParts = subjectSlug.split("-");
    const boardFromSlug = slugParts[0]?.toUpperCase() === "IGCSE" ? "IGCSE" : "ICSE";
    const classLevel = parseInt(slugParts[2]);
    const subjectName = slugParts[3] ? slugParts[3].charAt(0).toUpperCase() + slugParts[3].slice(1) : "";

    if (!classLevel || !subjectName) {
        return notFound();
    }

    // Find matching subject ID using direct SQL to match board, class and name without Prisma client validation errors
    let subjectId: string | null = null;
    try {
        const matchingRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            'SELECT id FROM "Subject" WHERE class = $1 AND LOWER(name) = LOWER($2) AND UPPER(board) = UPPER($3) AND "isActive" = true LIMIT 1',
            classLevel,
            subjectName,
            boardFromSlug
        );
        if (matchingRows.length > 0) {
            subjectId = matchingRows[0].id;
        }
    } catch (e) {
        console.error("Failed to find subject by raw query:", e);
    }

    if (!subjectId) {
        return notFound();
    }

    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
            chapters: {
                orderBy: {
                    order: "asc"
                },
                include: {
                    contents: {
                        where: { type: "NOTES" },
                        take: 1
                    }
                }
            }
        }
    });

    if (!subject) {
        return notFound();
    }

    // Determine user access
    const session = await auth();
    let hasAccess = false;

    if (session?.user?.id) {
        // Check if user has active subscription for this subject or full access
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                isActive: true,
                endsAt: { gt: new Date() },
                OR: [
                    { planType: "FULL_ACCESS", class: null },         // Combo: unlocks ALL classes
                    { planType: "FULL_ACCESS", class: classLevel },   // Premium: unlocks specific class only
                    { subjectId: subject.id }                          // Subject-specific plan
                ]
            }
        });
        if (subscription) hasAccess = true;
    }

    const currentBoard = (subject as any).board || boardFromSlug;
    const seoTitle = `${currentBoard} Class ${subject.class} ${subject.name} Notes & Test Papers`;
    const title = `${currentBoard} Class ${subject.class} ${subject.name}`;

    return (
        <section className="section-padding">
            <div className="container-main">
                {/* Breadcrumb */}
                <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    {currentBoard === "IGCSE" ? (
                        <>
                            <Link href="/igcse" className="hover:text-primary">{currentBoard}</Link>
                            <span>/</span>
                        </>
                    ) : null}
                    <span className="text-foreground font-medium">{title}</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{seoTitle}</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl">{subject.description}</p>

                <SubjectClient subject={subject} hasAccess={hasAccess} subjectSlug={subjectSlug} />

            </div>
        </section>
    );
};

export default SubjectPage;
