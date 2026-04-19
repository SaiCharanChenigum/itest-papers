import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DeliveryOrderStatus } from "@prisma/client";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;
        
        // Authorization check
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !Object.values(DeliveryOrderStatus).includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        // Prevent updates if order is already cancelled
        const currentOrder = await prisma.deliveryOrder.findUnique({
            where: { id },
            select: { status: true }
        });

        if (!currentOrder) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        if (currentOrder.status === "CANCELLED") {
            return NextResponse.json({ success: false, error: "Cannot update a cancelled order" }, { status: 400 });
        }

        const updatedOrder = await prisma.deliveryOrder.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error("Admin Order Update error:", error);
        return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
    }
}
