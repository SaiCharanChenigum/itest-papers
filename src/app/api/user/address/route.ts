import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const lastOrder = await prisma.deliveryOrder.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                fullName: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                pincode: true
            }
        });

        return NextResponse.json({ success: true, address: lastOrder || null });
    } catch (error) {
        console.error("Address fetch error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch address" }, { status: 500 });
    }
}
