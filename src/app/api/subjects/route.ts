import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/subjects
 * Fetch all active subjects grouped by class
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const classFilter = searchParams.get("class")

        const where: any = { isActive: true }

        if (classFilter) {
            where.class = parseInt(classFilter)
        }

        const subjects = await prisma.subject.findMany({
            where,
            include: {
                _count: {
                    select: { chapters: true }
                }
            },
            orderBy: [
                { class: "asc" },
                { name: "asc" }
            ]
        })

        // Group by class for better frontend handling
        const grouped = subjects.reduce((acc: any, subject) => {
            const className = `class_${subject.class}`
            if (!acc[className]) {
                acc[className] = []
            }
            acc[className].push({
                id: subject.id,
                name: subject.name,
                class: subject.class,
                description: subject.description,
                imageUrl: subject.imageUrl,
                chapterCount: subject._count.chapters
            })
            return acc
        }, {})

        return NextResponse.json({
            success: true,
            data: {
                subjects,
                grouped
            }
        })

    } catch (error) {
        console.error("Error fetching subjects:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch subjects" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/subjects
 * Create a new subject (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, class: classNum, description, imageUrl } = body

        if (!name || !classNum) {
            return NextResponse.json(
                { success: false, error: "Name and class are required" },
                { status: 400 }
            )
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                class: classNum,
                description,
                imageUrl,
                isActive: true
            }
        })

        return NextResponse.json({
            success: true,
            data: subject
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating subject:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create subject" },
            { status: 500 }
        )
    }
}
