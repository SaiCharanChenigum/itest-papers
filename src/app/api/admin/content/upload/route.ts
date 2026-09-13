import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const contentId = formData.get("contentId") as string | null;
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const chapterId = formData.get("chapterId") as string;
        const type = (formData.get("type") as any) || "NOTES";
        const isFree = formData.get("isFree") === "true";

        if (!title || (!chapterId && !contentId)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let fileUrl: string | undefined;

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload new file
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "itestpapers/pdfs", resource_type: "raw" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            }) as any;
            fileUrl = uploadResult.secure_url;
        }

        if (contentId) {
            // Update mode
            const existingContent = await prisma.content.findUnique({ where: { id: contentId } });
            
            // If replacing file, delete old from Cloudinary
            if (fileUrl && existingContent?.fileUrl.includes("cloudinary.com")) {
                const publicIdMatch = existingContent.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1];
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
                    } catch (e) {
                        console.error("Failed to delete old file from Cloudinary:", e);
                    }
                }
            }

            const updatedContent = await prisma.content.update({
                where: { id: contentId },
                data: {
                    title,
                    type,
                    isFree,
                    ...(fileUrl && { fileUrl }) // Only update fileUrl if a new file was uploaded
                }
            });
            return NextResponse.json(updatedContent);

        } else {
            // Create mode
            if (!fileUrl) {
                return new NextResponse("File is required for creation", { status: 400 });
            }
            const content = await prisma.content.create({
                data: {
                    title,
                    type,
                    fileUrl,
                    isFree,
                    chapterId
                }
            });
            return NextResponse.json(content);
        }

    } catch (error) {
        console.error("[CONTENT_UPLOAD_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
