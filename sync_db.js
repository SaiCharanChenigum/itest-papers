const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database sync with local folders...');

    // Clean existing content data
    console.log('🗑️  Cleaning existing subjects, chapters, and contents...');
    await prisma.content.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.subject.deleteMany();

    const basePath = path.join(__dirname, 'public', 'content', 'ICSE');

    if (!fs.existsSync(basePath)) {
        console.error("❌ Base path does not exist:", basePath);
        return;
    }

    const classes = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory());

    for (const className of classes) {
        const classNum = parseInt(className.replace('Class', ''));
        const classPath = path.join(basePath, className);
        const subjects = fs.readdirSync(classPath).filter(f => fs.statSync(path.join(classPath, f)).isDirectory());

        for (const subjectName of subjects) {
            console.log(`📚 Creating subject: Class ${classNum} ${subjectName}`);
            const subject = await prisma.subject.create({
                data: {
                    name: subjectName,
                    class: classNum,
                    description: `ICSE Class ${classNum} ${subjectName} complete study material`,
                    imageUrl: `/subjects/${subjectName.toLowerCase()}-${classNum}.jpg`,
                    isActive: true,
                }
            });

            const subjectPath = path.join(classPath, subjectName);

            // Look at Notes to determine the source of truth for chapters
            const notesPath = path.join(subjectPath, 'Notes');
            if (!fs.existsSync(notesPath)) continue;

            const noteFiles = fs.readdirSync(notesPath).filter(f => f.endsWith('.pdf'));

            for (const noteFile of noteFiles) {
                // e.g., "01-Cell_Structure.pdf"
                const match = noteFile.match(/^(\d+)-(.*)\.pdf$/);
                if (!match) continue;

                const order = parseInt(match[1]);
                const rawTitle = match[2];
                const title = rawTitle.replace(/_/g, ' ');

                console.log(`  📖 Chapter ${order}: ${title}`);

                const chapter = await prisma.chapter.create({
                    data: {
                        title: title,
                        description: `${title} study materials`,
                        order: order,
                        subjectId: subject.id,
                    }
                });

                // Now create content for Notes, TestPapers, Solutions, SamplePapers
                const contentTypes = [
                    { folder: 'Notes', type: 'NOTES', titleSuffix: 'Notes' },
                    { folder: 'TestPapers', type: 'TEST_PAPER', titleSuffix: 'Test Paper' },
                    { folder: 'Solutions', type: 'SOLUTION', titleSuffix: 'Solutions' },
                    { folder: 'SamplePapers', type: 'SAMPLE_PAPER', titleSuffix: 'Sample Paper' }
                ];

                for (const ct of contentTypes) {
                    const ctPath = path.join(subjectPath, ct.folder, noteFile);
                    if (fs.existsSync(ctPath)) {
                        const fileUrl = `/content/ICSE/${className}/${subjectName}/${ct.folder}/${noteFile}`;
                        await prisma.content.create({
                            data: {
                                title: `${title} ${ct.titleSuffix}`,
                                type: ct.type,
                                fileUrl: fileUrl,
                                isFree: order === 1 && ct.type === 'NOTES', // First chapter notes are free
                                order: ct.type === 'NOTES' ? 1 : ct.type === 'TEST_PAPER' ? 2 : 3,
                                chapterId: chapter.id
                            }
                        });
                    }
                }
            }
        }
    }

    console.log('🎉 Database perfectly synced with physical folders!');
}

main()
    .catch((e) => {
        console.error('❌ Error updating database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
