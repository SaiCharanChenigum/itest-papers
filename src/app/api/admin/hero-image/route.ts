import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
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

        if (rows.length > 0) {
            return NextResponse.json(rows[0]);
        }

        return NextResponse.json({
            id: "current",
            imageUrl: "/hero-student.png",
            publicId: null,
            altText: "Student studying biology and chemistry",
            updatedAt: null,
        });
    } catch (error) {
        console.error("[HERO_IMAGE_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const altText = (formData.get("altText") as string) || "Student studying biology and chemistry";

        if (!file || file.size === 0) {
            return new NextResponse("Image file is required", { status: 400 });
        }

        // Validate image file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/avif"];
        if (!validTypes.includes(file.type)) {
            return new NextResponse("Invalid file type. Please upload a PNG, JPG, or WebP image.", { status: 400 });
        }

        // 1. Fetch current existing hero image to delete later
        let oldPublicId: string | null = null;
        try {
            const existing = await prisma.$queryRawUnsafe<Array<{
                imageUrl: string;
                publicId: string | null;
            }>>(
                'SELECT "imageUrl", "publicId" FROM "HeroSetting" WHERE id = \'current\''
            );

            if (existing.length > 0) {
                if (existing[0].publicId) {
                    oldPublicId = existing[0].publicId;
                } else if (existing[0].imageUrl && existing[0].imageUrl.includes("cloudinary.com")) {
                    const match = existing[0].imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
                    if (match && match[1]) {
                        oldPublicId = match[1];
                    }
                }
            }
        } catch (e) {
            console.error("Failed to query existing hero image before upload:", e);
        }

        // 2. Upload new image to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "itestpapers/hero",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        }) as any;

        const newImageUrl = uploadResult.secure_url;
        const newPublicId = uploadResult.public_id;

        // 3. Upsert new image in PostgreSQL
        await prisma.$executeRawUnsafe(
            `INSERT INTO "HeroSetting" (id, "imageUrl", "publicId", "altText", "updatedAt")
             VALUES ('current', $1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET
               "imageUrl" = EXCLUDED."imageUrl",
               "publicId" = EXCLUDED."publicId",
               "altText" = EXCLUDED."altText",
               "updatedAt" = CURRENT_TIMESTAMP`,
            newImageUrl,
            newPublicId,
            altText
        );

        // 4. Delete the previous image from Cloudinary account (prevent orphaned files)
        if (oldPublicId && oldPublicId !== newPublicId) {
            try {
                const destroyRes = await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
                console.log(`Deleted previous hero image [${oldPublicId}] from Cloudinary:`, destroyRes);
            } catch (err) {
                console.error(`Failed to delete old hero image [${oldPublicId}] from Cloudinary:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            heroImage: {
                id: "current",
                imageUrl: newImageUrl,
                publicId: newPublicId,
                altText,
                updatedAt: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("[HERO_IMAGE_POST]", error);
        return new NextResponse(error.message || "Failed to upload hero image", { status: 500 });
    }
}

