import { prisma } from "@/lib/db";

export interface PricingRates {
    CLASS_9_FULL: number;
    CLASS_10_FULL: number;
    ALL_ACCESS: number;
}

export const DEFAULT_PRICING_RATES: PricingRates = {
    CLASS_9_FULL: 299,
    CLASS_10_FULL: 299,
    ALL_ACCESS: 499,
};

/**
 * Fetch dynamic pricing rates from Neon PostgreSQL.
 * Falls back to default values if table is unreachable.
 */
export async function getPricingRates(): Promise<PricingRates> {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{ planKey: string; price: number }>>(
            'SELECT "planKey", price FROM "PricingPlan"'
        );

        const rates: PricingRates = { ...DEFAULT_PRICING_RATES };
        for (const row of rows) {
            if (row.planKey in rates) {
                rates[row.planKey as keyof PricingRates] = Number(row.price);
            }
        }
        return rates;
    } catch (e) {
        console.error("Failed to fetch dynamic pricing rates, using fallback:", e);
        return DEFAULT_PRICING_RATES;
    }
}

