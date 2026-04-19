const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote() {
  const email = 'saic9524@gmail.com';
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ Success: User ${user.email} is now an ADMIN.`);
  } catch (error) {
    console.error("❌ Error: Could not find user. Make sure you have signed up first!");
  } finally {
    await prisma.$disconnect();
  }
}

promote();
