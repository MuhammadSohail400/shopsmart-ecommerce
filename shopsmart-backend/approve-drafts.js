const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: { status: 'draft' },
    data: { status: 'approved' },
  });
  console.log(`Approved ${result.count} draft products.`);

  const all = await prisma.product.findMany({
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('Latest products in database:', all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
