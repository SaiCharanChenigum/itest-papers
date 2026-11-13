import { prisma } from "@/lib/db";

export interface BannerElement {
    id: string;
    type: "text" | "image" | "shape";
    x: number; // Percentage or X coordinate (0 - 1000)
    y: number; // Percentage or Y coordinate (0 - 280)
    width?: number;
    height?: number;
    
    // Text specific properties
    text?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    textAlign?: "left" | "center" | "right";
    linkUrl?: string;

    // Image specific properties
    imageUrl?: string;
    publicId?: string;
    borderRadius?: number;
    objectFit?: "cover" | "contain" | "fill";

    // Shape specific properties
    shapeType?: "rectangle" | "rounded-pill" | "badge" | "circle" | "line";
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
}

export interface BannerData {
    id: string;
    isActive: boolean;
    backgroundColor: string;
    height: number;
    elements: BannerElement[];
    updatedAt?: string | null;
}

export const DEFAULT_BANNER: BannerData = {
    id: "current",
    isActive: true,
    backgroundColor: "#ffffff",
    height: 200,
    elements: [],
    updatedAt: null,
};

/**
 * Fetch dynamic homepage banner configuration from Neon PostgreSQL.
 * Falls back to plain white default banner if not yet created or unreachable.
 */
export async function getHomepageBanner(): Promise<BannerData> {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{
            id: string;
            isActive: boolean;
            backgroundColor: string;
            height: number;
            elements: any;
            updatedAt: Date | null;
        }>>(
            'SELECT id, "isActive", "backgroundColor", height, elements, "updatedAt" FROM "HomepageBanner" WHERE id = \'current\' LIMIT 1'
        );

        if (rows.length > 0) {
            let parsedElements: BannerElement[] = [];
            const raw = rows[0].elements;
            if (Array.isArray(raw)) {
                parsedElements = raw;
            } else if (typeof raw === "string") {
                try {
                    parsedElements = JSON.parse(raw);
                } catch {
                    parsedElements = [];
                }
            }

            return {
                id: rows[0].id,
                isActive: rows[0].isActive ?? true,
                backgroundColor: rows[0].backgroundColor || "#ffffff",
                height: rows[0].height || 260,
                elements: parsedElements,
                updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : null,
            };
        }
    } catch (e) {
        console.error("Failed to fetch HomepageBanner, using plain white default:", e);
    }

    return DEFAULT_BANNER;
}

