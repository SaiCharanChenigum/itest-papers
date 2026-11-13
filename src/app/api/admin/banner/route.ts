import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_BANNER } from "@/lib/banner";

export async function GET() {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{
            id: string;
            isActive: boolean;
            backgroundColor: string;
            height: number;
            elements: any;
            updatedAt: Date | null;
        }>>(
            'SELECT id, "isActive", "backgroundColor", height, elements, "updatedAt" FROM "HomepageBanner" WHERE id = \'current\' LIMIT 1'
        );

        if (rows.length > 0) {
            let parsedElements = [];
            const raw = rows[0].elements;
            if (Array.isArray(raw)) {
                parsedElements = raw;
            } else if (typeof raw === "string") {
                try {
                    parsedElements = JSON.parse(raw);
                } catch {
                    parsedElements = [];
                }
            }

            return NextResponse.json({
                id: rows[0].id,
                isActive: rows[0].isActive ?? true,
                backgroundColor: rows[0].backgroundColor || "#ffffff",
                height: rows[0].height || 260,
                elements: parsedElements,
                updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : null,
            });
        }

        return NextResponse.json(DEFAULT_BANNER);
    } catch (error) {
        console.error("[BANNER_GET]", error);
        return NextResponse.json(DEFAULT_BANNER);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { isActive = true, backgroundColor = "#ffffff", height = 260, elements = [] } = body;

        // Ensure table exists
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "HomepageBanner" (
                id TEXT PRIMARY KEY DEFAULT 'current',
                "isActive" BOOLEAN DEFAULT true,
                "backgroundColor" TEXT DEFAULT '#ffffff',
                height INT DEFAULT 260,
                elements JSONB DEFAULT '[]'::jsonb,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const elementsJson = JSON.stringify(elements);

        await prisma.$executeRawUnsafe(
            `INSERT INTO "HomepageBanner" (id, "isActive", "backgroundColor", height, elements, "updatedAt")
             VALUES ('current', $1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET
                "isActive" = EXCLUDED."isActive",
                "backgroundColor" = EXCLUDED."backgroundColor",
                height = EXCLUDED.height,
                elements = EXCLUDED.elements,
                "updatedAt" = CURRENT_TIMESTAMP`,
            isActive,
            backgroundColor,
            height,
            elementsJson
        );

        return NextResponse.json({
            success: true,
            banner: {
                id: "current",
                isActive,
                backgroundColor,
                height,
                elements,
                updatedAt: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("[BANNER_POST]", error);
        return new NextResponse(error.message || "Failed to save banner", { status: 500 });
    }
}

