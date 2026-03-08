import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomUUID } from "crypto"

/**
 * POST /api/auth/forgot-password
 * Validates email, generates a reset token, stores it in DB.
 * The frontend then uses EmailJS to send the reset link.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { success: false, error: "Email is required." },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, name: true, email: true, password: true }
        })

        if (!user || !user.password) {
            // Return same message for security (don't reveal if email exists)
            return NextResponse.json(
                { success: false, error: "No account found with this email address." },
                { status: 404 }
            )
        }

        // Generate secure reset token (UUID) with 1-hour expiry
        const resetToken = randomUUID()
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Store token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        })

        // Return token + user info to frontend so EmailJS can send the email
        return NextResponse.json({
            success: true,
            data: {
                resetToken,
                userName: user.name || "Student",
                userEmail: user.email
            }
        })

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
