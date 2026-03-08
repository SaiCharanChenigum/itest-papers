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

    // Parse class and subject from slug e.g. "icse-class-9-biology" -> class: 9, subject: "Biology"
    const slugParts = subjectSlug.split("-");
    const classLevel = parseInt(slugParts[2]);
    const subjectName = slugParts[3] ? slugParts[3].charAt(0).toUpperCase() + slugParts[3].slice(1) : "";

    if (!classLevel || !subjectName) {
        return notFound();
    }

    const subject = await prisma.subject.findFirst({
        where: {
            class: classLevel,
            name: {
                equals: subjectName,
                mode: "insensitive"
            },
            isActive: true
        },
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

    const seoTitle = `ICSE Class ${subject.class} ${subject.name} Notes & Test Papers`;
    const title = `ICSE Class ${subject.class} ${subject.name}`;

    return (
        <section className="section-padding">
            <div className="container-main">
                {/* Breadcrumb */}
                <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
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
