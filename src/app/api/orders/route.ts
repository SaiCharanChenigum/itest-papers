import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const orders = await prisma.deliveryOrder.findMany({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        chapter: {
                            select: { title: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, orders });
    } catch (error: any) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
    }
}
