const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "saic9524@gmail.com";
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(`Successfully promoted ${email} to ADMIN.`);
  } catch (error) {
    console.error(`Error promoting user: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
