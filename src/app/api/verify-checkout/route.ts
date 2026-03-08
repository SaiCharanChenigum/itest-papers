import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = body;

        // Verify Signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(text)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: "Payment verification failed. Invalid signature" }, { status: 400 });
        }

        // Signature is valid. Update Delivery Order status.
        const updatedOrder = await prisma.deliveryOrder.update({
            where: { id: internal_order_id },
            data: { status: "PROCESSING" },
            include: {
                items: {
                    include: {
                        chapter: true
                    }
                }
            }
        });

        // Clear the user's cart now that payment is confirmed
        await prisma.cartItem.deleteMany({
            where: { userId: session.user.id }
        });

        // Trigger the background API route to dispatch EmailJS
        await fetch(`${req.nextUrl.origin}/api/send-order-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderDetails: updatedOrder })
        }).catch(console.error);

        return NextResponse.json({ success: true, orderNumber: updatedOrder.orderNumber });
    } catch (error: any) {
        console.error("Verify Checkout POST Error:", error);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}
