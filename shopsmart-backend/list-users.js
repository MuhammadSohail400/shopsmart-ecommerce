const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('Current Registered Users:');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
