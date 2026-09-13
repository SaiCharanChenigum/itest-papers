import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, title, isFree, type } = body;

        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        const content = await prisma.content.update({
            where: { id },
            data: { 
                ...(title && { title }),
                ...(type && { type }),
                ...(isFree !== undefined && { isFree })
            }
        });

        return NextResponse.json(content);
    } catch (error) {
        console.error("[CONTENT_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("Missing content id", { status: 400 });
        }

        const content = await prisma.content.findUnique({ where: { id } });
        if (content?.fileUrl.includes("cloudinary.com")) {
            const publicIdMatch = content.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = publicIdMatch[1];
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
                } catch(e) {
                    console.error("Failed to delete file from Cloudinary:", e);
                }
            }
        }

        const deletedContent = await prisma.content.delete({
            where: { id }
        });

        return NextResponse.json(deletedContent);
    } catch (error) {
        console.error("[CONTENT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
