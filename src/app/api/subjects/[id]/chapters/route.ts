import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { getChapterAccess } from "@/lib/access-control"

/**
 * GET /api/subjects/[id]/chapters
 * Fetch all chapters for a subject with access control
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        const userId = session?.user?.id || null

        const subject = await prisma.subject.findUnique({
            where: { id: params.id },
            include: {
                chapters: {
                    orderBy: { order: "asc" },
                    include: {
                        _count: {
                            select: { contents: true }
                        }
                    }
                }
            }
        })

        if (!subject) {
            return NextResponse.json(
                { success: false, error: "Subject not found" },
                { status: 404 }
            )
        }

        // Get access information for each chapter
        const chaptersWithAccess = await Promise.all(
            subject.chapters.map(async (chapter) => {
                const contentAccess = await getChapterAccess(userId, chapter.id)
                const freeContentCount = contentAccess.filter(c => c.isFree).length
                const totalContentCount = contentAccess.length

                return {
                    id: chapter.id,
                    title: chapter.title,
                    description: chapter.description,
                    order: chapter.order,
                    contentCount: totalContentCount,
                    freeContentCount,
                    hasFreeContent: freeContentCount > 0
                }
            })
        )

        return NextResponse.json({
            success: true,
            data: {
                subject: {
                    id: subject.id,
                    name: subject.name,
                    class: subject.class,
                    description: subject.description
                },
                chapters: chaptersWithAccess
            }
        })

    } catch (error) {
        console.error("Error fetching chapters:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch chapters" },
            { status: 500 }
        )
    }
}
