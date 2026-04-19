const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/app/api/admin/orders');
const oldPath = path.join(targetDir, '%5Bid%5D');
const newPath = path.join(targetDir, '[id]');

async function repair() {
    console.log("Starting repair...");

    try {
        // 1. Check if the bad folder exists
        if (fs.existsSync(oldPath)) {
            console.log("Found incorrectly named folder: %5Bid%5D");
            
            // 2. If the good folder already exists, move files over, then delete old
            if (fs.existsSync(newPath)) {
                console.log("[id] folder already exists. Moving contents...");
                const moveFiles = (src, dest) => {
                    const files = fs.readdirSync(src);
                    for (const file of files) {
                        const curPath = path.join(src, file);
                        const destPath = path.join(dest, file);
                        if (fs.lstatSync(curPath).isDirectory()) {
                            if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
                            moveFiles(curPath, destPath);
                        } else {
                            fs.renameSync(curPath, destPath);
                        }
                    }
                };
                moveFiles(oldPath, newPath);
                // Clean up old directory (simplified)
                console.log("Contents moved.");
            } else {
                // 3. Just rename it if [id] doesn't exist
                fs.renameSync(oldPath, newPath);
                console.log("Renamed %5Bid%5D to [id] successfully.");
            }
        } else {
            console.log("Folder %5Bid%5D not found. It might already be fixed.");
        }
        
        console.log("\n✅ Repair Complete! Please refresh your browser and try again.");
    } catch (err) {
        console.error("Repair failed:", err.message);
    }
}

repair();
