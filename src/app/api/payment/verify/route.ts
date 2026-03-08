import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { verifyRazorpaySignature } from "@/lib/razorpay"

/**
 * POST /api/payment/verify
 * Verify Razorpay payment and activate subscription
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Invalid payment signature" },
                { status: 400 }
            )
        }

        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { razorpayOrderId: razorpay_order_id }
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, error: "Payment record not found" },
                { status: 404 }
            )
        }

        if (payment.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "SUCCESS"
            }
        })

        // Create subscription (365 days from now)
        const startsAt = new Date()
        const endsAt = new Date()
        endsAt.setDate(endsAt.getDate() + 365)

        const subscription = await prisma.subscription.create({
            data: {
                userId: session.user.id,
                planName: payment.planName,
                planType: payment.planType,
                subjectId: payment.subjectId,
                class: payment.class,
                amount: payment.amount,
                startsAt,
                endsAt,
                isActive: true,
                paymentId: payment.id
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                subscription: {
                    id: subscription.id,
                    planName: subscription.planName,
                    endsAt: subscription.endsAt
                }
            }
        })

    } catch (error) {
        console.error("Error verifying payment:", error)
        return NextResponse.json(
            { success: false, error: "Failed to verify payment" },
            { status: 500 }
        )
    }
}
