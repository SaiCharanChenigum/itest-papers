const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
    console.log("Starting PDF migration to Cloudinary...");

    // Find all content where fileUrl does NOT start with http
    const contents = await prisma.content.findMany({
        where: {
            NOT: {
                fileUrl: {
                    startsWith: 'http'
                }
            }
        }
    });

    console.log(`Found ${contents.length} local PDFs to migrate.`);

    for (const content of contents) {
        // e.g., /content/ICSE/Class10/Chemistry/Notes/01-Periodic_Table_Notes.pdf
        const localPath = path.join(process.cwd(), 'public', content.fileUrl);

        if (!fs.existsSync(localPath)) {
            console.log(`[SKIP] File not found on disk: ${localPath}`);
            continue;
        }

        try {
            console.log(`Uploading: ${content.fileUrl}...`);
            
            // Extract the directory to use as Cloudinary folder
            // e.g. /content/ICSE/Class10/Chemistry/Notes
            let folderPath = path.dirname(content.fileUrl);
            
            // Remove leading slash if exists for cleaner Cloudinary folder structure
            if (folderPath.startsWith('/') || folderPath.startsWith('\\')) {
                folderPath = folderPath.substring(1);
            }
            // Replace windows backslashes with forward slashes for Cloudinary
            folderPath = folderPath.replace(/\\/g, '/');

            // Prepend a base folder so it doesn't clutter root
            const cloudinaryFolder = `itestpapers/${folderPath}`;

            const uploadResult = await cloudinary.uploader.upload(localPath, {
                folder: cloudinaryFolder,
                resource_type: "raw", // Needed for PDFs/non-images
                use_filename: true,
                unique_filename: false // Keep original filename
            });

            // Update database
            await prisma.content.update({
                where: { id: content.id },
                data: { fileUrl: uploadResult.secure_url }
            });

            console.log(`[SUCCESS] Migrated to: ${uploadResult.secure_url}`);
        } catch (error) {
            console.error(`[ERROR] Failed to migrate ${content.fileUrl}:`, error);
        }
    }

    console.log("Migration complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
