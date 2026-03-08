import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token, password } = body

        if (!token || !password) {
            return NextResponse.json(
                { success: false, error: "Token and new password are required." },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 8 characters." },
                { status: 400 }
            )
        }

        // Find user with this token
        const user = await prisma.user.findUnique({
            where: { resetToken: token },
            select: { id: true, resetTokenExpiry: true }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired reset link." },
                { status: 400 }
            )
        }

        // Check token expiry
        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return NextResponse.json(
                { success: false, error: "This reset link has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Hash new password and clear reset token
        const hashedPassword = await bcrypt.hash(password, 12)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Password updated successfully. You can now log in."
        })

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
