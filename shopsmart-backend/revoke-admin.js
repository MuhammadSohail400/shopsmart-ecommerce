const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Revoke Admin Access from a User
 * Usage:
 *   node revoke-admin.js friend@email.com
 */
async function main() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.log('❌ Error: Please provide the email of the person to revoke admin access from.');
    console.log('Usage: node revoke-admin.js <email>');
    process.exit(1);
  }

  const emailClean = targetEmail.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: emailClean },
  });

  if (!user) {
    console.log(`❌ Account not found for "${emailClean}".`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: emailClean },
    data: { role: 'customer' },
  });

  console.log('====================================================');
  console.log(`🔒 Revoked admin access from "${emailClean}" (Role set to 'customer').`);
  console.log('====================================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
