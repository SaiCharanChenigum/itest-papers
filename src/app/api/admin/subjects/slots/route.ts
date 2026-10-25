import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { subjectId, slots } = body;

        if (!subjectId || !Array.isArray(slots)) {
            return new NextResponse("Invalid parameters", { status: 400 });
        }

        // Clean & normalize slot names
        const normalizedSlots = Array.from(
            new Set(
                slots
                    .map((s: string) => s.trim().toUpperCase().replace(/\s+/g, "_"))
                    .filter(Boolean)
            )
        );

        await prisma.$executeRawUnsafe(
            'UPDATE "Subject" SET "slots" = $1 WHERE "id" = $2',
            normalizedSlots,
            subjectId
        );

        const rows = await prisma.$queryRawUnsafe<any[]>(
            'SELECT * FROM "Subject" WHERE "id" = $1',
            subjectId
        );
        const updatedSubject = rows[0] || { id: subjectId, slots: normalizedSlots };

        return NextResponse.json(updatedSubject);
    } catch (error) {
        console.error("[SUBJECT_SLOTS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
