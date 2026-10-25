import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{
            id: string;
            title: string;
            imageUrl: string;
            width: number | null;
            height: number | null;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        }>>('SELECT id, title, "imageUrl", width, height, "order", "createdAt", "updatedAt" FROM "MaterialPreview" ORDER BY "order" ASC, "createdAt" ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error("[PREVIEWS_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Enforce max limit of 2 previews
        const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
            'SELECT COUNT(*) as count FROM "MaterialPreview"'
        );
        const currentCount = Number(countResult[0]?.count || 0);
        if (currentCount >= 2) {
            return new NextResponse(
                "Maximum limit of 2 preview images reached. You must delete an existing image before adding a new one, or use Edit to change an existing one.",
                { status: 400 }
            );
        }

        const contentType = req.headers.get("content-type") || "";

        let title = "";
        let imageUrl = "";
        let width = 640;
        let height = 800;
        let order = currentCount + 1;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            title = (formData.get("title") as string) || "Sample Material";
            const orderVal = formData.get("order") as string;
            if (orderVal) order = parseInt(orderVal, 10) || (currentCount + 1);

            const file = formData.get("file") as File | null;
            if (!file || file.size === 0) {
                return new NextResponse("An image file is required", { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "itestpapers/previews", resource_type: "image" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            }) as any;

            const uploadedWidth = uploadResult.width;
            const uploadedHeight = uploadResult.height;

            // Enforce dimension consistency with existing preview image(s)
            const otherPreviews = await prisma.$queryRawUnsafe<Array<{ id: string, width: number | null, height: number | null }>>(
                'SELECT id, width, height FROM "MaterialPreview" LIMIT 1'
            );

            if (otherPreviews.length > 0) {
                const requiredWidth = otherPreviews[0].width || 640;
                const requiredHeight = otherPreviews[0].height || 800;
                if (uploadedWidth !== requiredWidth || uploadedHeight !== requiredHeight) {
                    // Destroy the newly uploaded image from Cloudinary since validation failed
                    if (uploadResult.public_id) {
                        try {
                            await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "image" });
                        } catch (e) {
                            console.error("Cleanup destroy failed:", e);
                        }
                    }
                    return new NextResponse(
                        `Image dimensions mismatch: The uploaded image is ${uploadedWidth}x${uploadedHeight}px, but both preview images must have the exact same dimensions. The other image is ${requiredWidth}x${requiredHeight}px. Please upload an image with ${requiredWidth}x${requiredHeight}px.`,
                        { status: 400 }
                    );
                }
            }

            imageUrl = uploadResult.secure_url;
            width = uploadedWidth;
            height = uploadedHeight;
        } else {
            const body = await req.json();
            title = body.title || "Sample Material";
            imageUrl = body.imageUrl;
            order = body.order || (currentCount + 1);
            width = body.width || 640;
            height = body.height || 800;
            if (!imageUrl) {
                return new NextResponse("Missing imageUrl", { status: 400 });
            }
        }

        const id = randomUUID();
        await prisma.$executeRawUnsafe(
            'INSERT INTO "MaterialPreview" (id, title, "imageUrl", width, height, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            id,
            title,
            imageUrl,
            width,
            height,
            order
        );

        return NextResponse.json({ id, title, imageUrl, width, height, order });
    } catch (error) {
        console.error("[PREVIEWS_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";

        let id = "";
        let title: string | null = null;
        let newImageUrl: string | null = null;
        let newWidth: number | null = null;
        let newHeight: number | null = null;
        let order: number | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            id = formData.get("id") as string;
            title = formData.get("title") as string | null;
            const orderVal = formData.get("order") as string | null;
            if (orderVal) order = parseInt(orderVal, 10);

            const file = formData.get("file") as File | null;
            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "itestpapers/previews", resource_type: "image" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                }) as any;

                const uploadedWidth = uploadResult.width;
                const uploadedHeight = uploadResult.height;

                // Enforce dimension consistency with the OTHER preview image
                const otherPreviews = await prisma.$queryRawUnsafe<Array<{ id: string, width: number | null, height: number | null }>>(
                    'SELECT id, width, height FROM "MaterialPreview" WHERE id != $1 LIMIT 1',
                    id
                );

                if (otherPreviews.length > 0) {
                    const requiredWidth = otherPreviews[0].width || 640;
                    const requiredHeight = otherPreviews[0].height || 800;
                    if (uploadedWidth !== requiredWidth || uploadedHeight !== requiredHeight) {
                        if (uploadResult.public_id) {
                            try {
                                await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "image" });
                            } catch (e) {
                                console.error("Cleanup destroy failed:", e);
                            }
                        }
                        return new NextResponse(
                            `Image dimensions mismatch: The replacement image is ${uploadedWidth}x${uploadedHeight}px, but both preview images must have the exact same dimensions. The other image is ${requiredWidth}x${requiredHeight}px. Please upload an image with ${requiredWidth}x${requiredHeight}px.`,
                            { status: 400 }
                        );
                    }
                }

                // Delete old image from Cloudinary if applicable
                const existing = await prisma.$queryRawUnsafe<Array<{ imageUrl: string }>>(
                    'SELECT "imageUrl" FROM "MaterialPreview" WHERE id = $1',
                    id
                );
                if (existing && existing.length > 0 && existing[0].imageUrl.includes("cloudinary.com")) {
                    const publicIdMatch = existing[0].imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
                    if (publicIdMatch && publicIdMatch[1]) {
                        try {
                            await cloudinary.uploader.destroy(publicIdMatch[1], { resource_type: "image" });
                        } catch (e) {
                            console.error("Failed to delete previous image from Cloudinary:", e);
                        }
                    }
                }

                newImageUrl = uploadResult.secure_url;
                newWidth = uploadedWidth;
                newHeight = uploadedHeight;
            }
        } else {
            const body = await req.json();
            id = body.id;
            title = body.title ?? null;
            order = body.order ?? null;
            newImageUrl = body.imageUrl ?? null;
            newWidth = body.width ?? null;
            newHeight = body.height ?? null;
        }

        if (!id) {
            return new NextResponse("Missing preview id", { status: 400 });
        }

        await prisma.$executeRawUnsafe(
            'UPDATE "MaterialPreview" SET title = COALESCE($1, title), "imageUrl" = COALESCE($2, "imageUrl"), width = COALESCE($3, width), height = COALESCE($4, height), "order" = COALESCE($5, "order"), "updatedAt" = CURRENT_TIMESTAMP WHERE id = $6',
            title,
            newImageUrl,
            newWidth,
            newHeight,
            order,
            id
        );

        const updated = await prisma.$queryRawUnsafe<Array<{
            id: string;
            title: string;
            imageUrl: string;
            width: number | null;
            height: number | null;
            order: number;
        }>>('SELECT id, title, "imageUrl", width, height, "order" FROM "MaterialPreview" WHERE id = $1', id);

        return NextResponse.json(updated[0] || { success: true });
    } catch (error) {
        console.error("[PREVIEWS_PUT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return new NextResponse("Missing preview id", { status: 400 });
        }

        const existing = await prisma.$queryRawUnsafe<Array<{ imageUrl: string }>>(
            'SELECT "imageUrl" FROM "MaterialPreview" WHERE id = $1',
            id
        );

        if (existing && existing.length > 0) {
            const imageUrl = existing[0].imageUrl;
            if (imageUrl.includes("cloudinary.com")) {
                const publicIdMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
                if (publicIdMatch && publicIdMatch[1]) {
                    try {
                        await cloudinary.uploader.destroy(publicIdMatch[1], { resource_type: "image" });
                    } catch (e) {
                        console.error("Failed to delete image from Cloudinary:", e);
                    }
                }
            }
        }

        await prisma.$executeRawUnsafe('DELETE FROM "MaterialPreview" WHERE id = $1', id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PREVIEWS_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
