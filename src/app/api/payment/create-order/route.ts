import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createRazorpayOrder, SUBSCRIPTION_PLANS } from "@/lib/razorpay"

/**
 * POST /api/payment/create-order  
 * Create a Razorpay order for subscription purchase
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
        const { planKey, subjectId } = body

        // Validate plan
        const plan = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS]

        if (!plan) {
            return NextResponse.json(
                { success: false, error: "Invalid subscription plan" },
                { status: 400 }
            )
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            plan.amount,
            plan.name,
            session.user.id
        )

        // Store payment record in database
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                razorpayOrderId: razorpayOrder.id,
                amount: plan.amount,
                currency: "INR",
                status: "PENDING",
                planName: plan.name,
                planType: plan.planType,
                subjectId: plan.planType === "SUBJECT" ? subjectId : null,
                class: plan.class
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                paymentId: payment.id
            }
        })

    } catch (error) {
        console.error("Error creating payment order:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create payment order" },
            { status: 500 }
        )
    }
}
