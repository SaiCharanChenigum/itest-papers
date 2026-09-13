const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
    try {
        const res = await cloudinary.uploader.upload("public/content/ICSE/Class9/Biology/Notes/03-Tissues.pdf", {
            folder: "itestpapers/test",
            resource_type: "image", // Testing image instead of raw
            use_filename: true,
            unique_filename: false
        });
        console.log("UPLOADED URL:", res.secure_url);
    } catch(e) {
        console.error(e);
    }
}
run();
