const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const zones = await prisma.shippingZone.findMany({ include: { rates: true } });
  console.log(JSON.stringify(zones, null, 2));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
