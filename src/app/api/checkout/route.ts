import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Razorpay from "razorpay";
import crypto from "crypto";

// Helper function to generate a unique order number
const generateOrderNumber = () => {
    return `ORD-${new Date().getTime().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { fullName, phone, address, city, state, pincode, paymentMethod } = body;

        // Basic validation
        if (!fullName || !phone || !address || !city || !state || !pincode || !paymentMethod) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Fetch user's cart items
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: session.user.id }
        });

        if (cartItems.length === 0) {
            return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
        }

        // Calculate total (₹99 per chapter + ₹60 delivery)
        const chapterPrice = 99;
        const deliveryFee = 60;
        const itemsTotal = cartItems.reduce((acc, item) => acc + (chapterPrice * item.quantity), 0);
        const finalTotal = itemsTotal + deliveryFee;

        // Create the initial Order Record in DB (Status: PENDING)
        const orderNumber = generateOrderNumber();
        const newOrder = await prisma.deliveryOrder.create({
            data: {
                orderNumber,
                userId: session.user.id,
                totalAmount: finalTotal,
                deliveryFee,
                paymentMethod: paymentMethod as "COD" | "ONLINE",
                status: paymentMethod === "COD" ? "PROCESSING" : "PENDING", // COD is immediately processing
                fullName,
                phone,
                address,
                city,
                state,
                pincode,
                items: {
                    create: cartItems.map(item => ({
                        chapterId: item.chapterId,
                        quantity: item.quantity,
                        priceAt: chapterPrice
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        chapter: true
                    }
                }
            }
        });

        if (paymentMethod === "COD") {
            // Clear the user's cart immediately
            await prisma.cartItem.deleteMany({
                where: { userId: session.user.id }
            });

            // Trigger the background API route to dispatch EmailJS
            await fetch(`${req.nextUrl.origin}/api/send-order-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderDetails: newOrder })
            }).catch(console.error);

            return NextResponse.json({ success: true, order: newOrder });
        } else {
            // ONLINE payment strategy -> Initialize Razorpay
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!
            });

            const rzpOrder = await razorpay.orders.create({
                amount: Math.round(finalTotal * 100), // Convert to paise
                currency: "INR",
                receipt: newOrder.id,
                payment_capture: true
            });

            // Save razorpayId to order
            await prisma.deliveryOrder.update({
                where: { id: newOrder.id },
                data: { razorpayId: rzpOrder.id }
            });

            return NextResponse.json({
                success: true,
                order: newOrder,
                razorpayOrder: rzpOrder
            });
        }
    } catch (error: any) {
        console.error("Checkout POST Error:", error);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}
