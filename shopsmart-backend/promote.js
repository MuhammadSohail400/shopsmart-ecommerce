const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found in database.");
    return;
  }
  
  // Find the user they logged in with. Let's just promote all existing users to admin for dev purposes,
  // or specifically the first one.
  const updated = await prisma.user.updateMany({
    data: { role: 'admin' }
  });
  
  console.log(`Promoted ${updated.count} users to Admin.`);
}

promoteToAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
