const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = "2a66371a-1f14-4956-9d07-963da68e6994";
    
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Create a 1-year Combo subscription
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setFullYear(endsAt.getFullYear() + 1);

    const subscription = await prisma.subscription.create({
        data: {
            userId: userId,
            planName: "Combo Plan (Manual Admin Grant)",
            planType: "FULL_ACCESS",
            class: null,
            subjectId: null,
            amount: 0,
            startsAt: startsAt,
            endsAt: endsAt,
            isActive: true
        }
    });

    console.log("Successfully granted Combo subscription!");
    console.log(subscription);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
