const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, status: true }
  });
  console.log("Current Products in DB:");
  console.log(JSON.stringify(products, null, 2));
}

checkProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
