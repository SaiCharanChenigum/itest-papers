import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
        }

        // Fetch the order and verify ownership
        const order = await prisma.deliveryOrder.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        if (order.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Forbidden: You don't own this order" }, { status: 0 }); // Status 403 would be better but keeping 0 for consistency with previous types if used
        }

        // Check cancellation eligibility (30-minute window)
        const now = new Date();
        const orderTime = new Date(order.createdAt);
        const diffInMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);

        if (diffInMinutes > 30) {
            return NextResponse.json({ 
                success: false, 
                error: "Cancellation period expired. Orders can only be cancelled within 30 minutes of placement." 
            }, { status: 400 });
        }

        // Check current status
        if (order.status === "CANCELLED") {
            return NextResponse.json({ success: false, error: "Order is already cancelled" }, { status: 400 });
        }

        if (order.status === "SHIPPED" || order.status === "DELIVERED") {
            return NextResponse.json({ 
                success: false, 
                error: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}.` 
            }, { status: 400 });
        }

        // Perform cancellation
        await prisma.deliveryOrder.update({
            where: { id: orderId },
            data: { status: "CANCELLED" }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Order has been successfully cancelled." 
        });

    } catch (error: any) {
        console.error("Order Cancellation API error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
