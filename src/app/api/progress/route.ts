import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { contentId, completed = false } = body;

        if (!contentId) {
            return NextResponse.json({ success: false, error: "Content ID is required" }, { status: 400 });
        }

        // Upsert progress: update if exists, create if not
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_contentId: {
                    userId: session.user.id,
                    contentId: contentId
                }
            },
            update: {
                lastAccessed: new Date(),
                // Only update completed to true, don't revert to false if already true
                ...(completed ? { completed: true } : {})
            },
            create: {
                userId: session.user.id,
                contentId: contentId,
                completed: completed,
                lastAccessed: new Date()
            }
        });

        return NextResponse.json({ success: true, progress });
    } catch (error: any) {
        console.error("Progress tracking error:", error);
        return NextResponse.json({ success: false, error: "Failed to record progress" }, { status: 500 });
    }
}
