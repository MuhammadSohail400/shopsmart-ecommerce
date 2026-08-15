const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.category.findMany()
  .then(categories => {
    console.log(categories);
  })
  .catch(err => {
    console.error("PRISMA ERROR:", err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
