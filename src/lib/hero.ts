import { prisma } from "@/lib/db";

export interface HeroImageData {
    imageUrl: string;
    publicId?: string | null;
    altText?: string | null;
    updatedAt?: string | null;
}

export const DEFAULT_HERO_IMAGE =
    "https://res.cloudinary.com/rlvifgwa/image/upload/v1794417351/itestpapers/hero/wwzry0u4tkzqzaglybjy.jpg";

/**
 * Fetch dynamic Hero image from Neon PostgreSQL.
 * Falls back to Cloudinary default or local fallback if table is unreachable.
 */
export async function getHeroImageUrl(): Promise<HeroImageData> {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{
            id: string;
            imageUrl: string;
            publicId: string | null;
            altText: string | null;
            updatedAt: Date | null;
        }>>(
            'SELECT id, "imageUrl", "publicId", "altText", "updatedAt" FROM "HeroSetting" WHERE id = \'current\' LIMIT 1'
        );

        if (rows.length > 0 && rows[0].imageUrl) {
            return {
                imageUrl: rows[0].imageUrl,
                publicId: rows[0].publicId,
                altText: rows[0].altText || "Student studying biology and chemistry",
                updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : null,
            };
        }
    } catch (e) {
        console.error("Failed to fetch dynamic hero image from database:", e);
    }

    return {
        imageUrl: DEFAULT_HERO_IMAGE,
        publicId: "itestpapers/hero/wwzry0u4tkzqzaglybjy",
        altText: "Student studying biology and chemistry",
        updatedAt: null,
    };
}

