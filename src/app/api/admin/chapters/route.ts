import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, subjectId, description, order } = body;

        if (!title || !subjectId) {
            return new NextResponse("Missing title or subjectId", { status: 400 });
        }

        const chapter = await prisma.chapter.create({
            data: {
                title,
                subjectId,
                description,
                order: order || 0
            }
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, title } = body;

        if (!id || !title) {
            return new NextResponse("Missing id or title", { status: 400 });
        }

        const chapter = await prisma.chapter.update({
            where: { id },
            data: { title }
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTERS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("Missing chapter id", { status: 400 });
        }

        const chapter = await prisma.chapter.delete({
            where: { id }
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTERS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
