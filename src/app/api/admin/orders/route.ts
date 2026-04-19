import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        
        // Authorization check
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const orders = await prisma.deliveryOrder.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
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
        console.error("Admin Orders GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
    }
}
