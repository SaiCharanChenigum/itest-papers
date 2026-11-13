import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPricingRates } from "@/lib/pricing";

export async function GET() {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{
            id: string;
            planKey: string;
            name: string;
            price: number;
            updatedAt: Date;
        }>>('SELECT id, "planKey", name, price, "updatedAt" FROM "PricingPlan" ORDER BY price ASC');

        return NextResponse.json(rows);
    } catch (error) {
        console.error("[ADMIN_PRICING_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // Supports batch update: { rates: { CLASS_9_FULL: 299, CLASS_10_FULL: 299, ALL_ACCESS: 499 } }
        if (body.rates && typeof body.rates === "object") {
            for (const [planKey, price] of Object.entries(body.rates)) {
                const numericPrice = Number(price);
                if (!isNaN(numericPrice) && numericPrice >= 0) {
                    await prisma.$executeRawUnsafe(
                        'UPDATE "PricingPlan" SET price = $1, "updatedAt" = NOW() WHERE "planKey" = $2',
                        numericPrice,
                        planKey
                    );
                }
            }
        } 
        // Or single update: { planKey: "CLASS_9_FULL", price: 299 }
        else if (body.planKey && body.price !== undefined) {
            const numericPrice = Number(body.price);
            if (isNaN(numericPrice) || numericPrice < 0) {
                return new NextResponse("Invalid price amount", { status: 400 });
            }

            await prisma.$executeRawUnsafe(
                'UPDATE "PricingPlan" SET price = $1, "updatedAt" = NOW() WHERE "planKey" = $2',
                numericPrice,
                body.planKey
            );
        } else {
            return new NextResponse("Missing rates data", { status: 400 });
        }

        const updatedRates = await getPricingRates();
        return NextResponse.json({ success: true, rates: updatedRates });
    } catch (error) {
        console.error("[ADMIN_PRICING_PUT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

