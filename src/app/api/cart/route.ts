import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: session.user.id },
            include: {
                chapter: {
                    select: {
                        id: true,
                        title: true,
                        subject: {
                            select: { name: true, class: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add standard price since it's fixed at ₹99
        const formattedItems = cartItems.map(item => ({
            id: item.id,
            chapterId: item.chapterId,
            quantity: item.quantity,
            title: item.chapter.title,
            subjectName: item.chapter.subject.name,
            className: `Class ${item.chapter.subject.class}`,
            price: 99
        }));

        return NextResponse.json({ success: true, cartItems: formattedItems });
    } catch (error: any) {
        console.error("Cart GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { chapterId } = body;

        if (!chapterId) {
            return NextResponse.json({ success: false, error: "Chapter ID is required" }, { status: 400 });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_chapterId: {
                    userId: session.user.id,
                    chapterId
                }
            }
        });

        if (existingItem) {
            // Unlikely to happen due to UI, but if it does, increase quantity
            const updated = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + 1 }
            });
            return NextResponse.json({ success: true, cartItem: updated });
        }

        // Add new item to cart
        const newItem = await prisma.cartItem.create({
            data: {
                userId: session.user.id,
                chapterId,
                quantity: 1
            }
        });

        return NextResponse.json({ success: true, cartItem: newItem });
    } catch (error: any) {
        console.error("Cart POST error:", error);
        return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 });
    }
}
