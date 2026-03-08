import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ cartItemId: string }> }
) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { quantity } = body;

        if (typeof quantity !== 'number' || quantity < 1) {
            return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: params.cartItemId }
        });

        if (!cartItem) {
            return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
        }

        if (cartItem.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const updated = await prisma.cartItem.update({
            where: { id: params.cartItemId },
            data: { quantity }
        });

        return NextResponse.json({ success: true, cartItem: updated });
    } catch (error: any) {
        console.error("Cart PUT error:", error);
        return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ cartItemId: string }> }
) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: params.cartItemId }
        });

        if (!cartItem) {
            return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
        }

        if (cartItem.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await prisma.cartItem.delete({
            where: { id: params.cartItemId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cart DELETE error:", error);
        return NextResponse.json({ success: false, error: "Failed to remove from cart" }, { status: 500 });
    }
}
