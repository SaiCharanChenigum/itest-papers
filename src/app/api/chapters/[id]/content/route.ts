import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { getChapterAccess } from "@/lib/access-control"

/**
 * GET /api/chapters/[id]/content
 * Fetch all content for a chapter with access control
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        const userId = session?.user?.id || null

        const chapter = await prisma.chapter.findUnique({
            where: { id: params.id },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        class: true
                    }
                }
            }
        })

        if (!chapter) {
            return NextResponse.json(
                { success: false, error: "Chapter not found" },
                { status: 404 }
            )
        }

        // Get content with access information
        const contentWithAccess = await getChapterAccess(userId, params.id)

        return NextResponse.json({
            success: true,
            data: {
                chapter: {
                    id: chapter.id,
                    title: chapter.title,
                    description: chapter.description,
                    subject: chapter.subject
                },
                content: contentWithAccess,
                hasSubscription: userId ? contentWithAccess.some(c => !c.isFree && c.isAccessible) : false
            }
        })

    } catch (error) {
        console.error("Error fetching content:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch content" },
            { status: 500 }
        )
    }
}
