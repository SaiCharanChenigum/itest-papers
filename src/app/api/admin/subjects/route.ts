import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, class: classLevel, board = "ICSE", description = "" } = body;

        if (!name || !classLevel) {
            return new NextResponse("Name and class are required", { status: 400 });
        }

        const normalizedBoard = board.toUpperCase().trim() === "IGCSE" ? "IGCSE" : "ICSE";
        const id = randomUUID();
        const defaultSlots = ["NOTES", "TEST_PAPER"];

        await prisma.$executeRawUnsafe(
            'INSERT INTO "Subject" (id, name, class, board, description, "isActive", slots, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())',
            id,
            name.trim(),
            Number(classLevel),
            normalizedBoard,
            description,
            defaultSlots
        );

        const rows = await prisma.$queryRawUnsafe<any[]>(
            'SELECT * FROM "Subject" WHERE id = $1',
            id
        );

        return NextResponse.json({ ...rows[0], chapters: [] });
    } catch (error) {
        console.error("[SUBJECTS_POST]", error);
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
        const { id, name, class: classLevel, board } = body;

        if (!id) {
            return new NextResponse("Subject ID required", { status: 400 });
        }

        await prisma.$executeRawUnsafe(
            'UPDATE "Subject" SET name = COALESCE($1, name), class = COALESCE($2, class), board = COALESCE($3, board), "updatedAt" = NOW() WHERE id = $4',
            name ? name.trim() : null,
            classLevel ? Number(classLevel) : null,
            board ? board.toUpperCase().trim() : null,
            id
        );

        const rows = await prisma.$queryRawUnsafe<any[]>(
            'SELECT * FROM "Subject" WHERE id = $1',
            id
        );

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error("[SUBJECTS_PUT]", error);
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
            return new NextResponse("Subject ID required", { status: 400 });
        }

        await prisma.$executeRawUnsafe(
            'DELETE FROM "Subject" WHERE id = $1',
            id
        );

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("[SUBJECTS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
