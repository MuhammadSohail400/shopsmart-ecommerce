const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

/**
 * Configure / Reset Admin Ownership
 * Usage:
 *   node set-admin.js <email> <password>
 * Example:
 *   node set-admin.js msohailg212@gmail.com MySecurePass@123
 */
async function main() {
  const targetEmail = process.argv[2] || 'msohailg212@gmail.com';
  const newPassword = process.argv[3] || 'Admin@123456';

  console.log('====================================================');
  console.log('🔒 ShopSmart Admin Access & Ownership Management');
  console.log('====================================================');
  console.log(`Target Admin Email: ${targetEmail}`);

  // 1. Demote all existing users to 'customer'
  const demoted = await prisma.user.updateMany({
    where: {
      email: { not: targetEmail.toLowerCase() },
      role: 'admin',
    },
    data: { role: 'customer' },
  });
  console.log(`✓ Demoted ${demoted.count} other accounts to 'customer' role (Admin access revoked).`);

  // 2. Hash password
  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 3. Promote or Create the primary owner Admin
  const adminUser = await prisma.user.upsert({
    where: { email: targetEmail.toLowerCase() },
    update: {
      role: 'admin',
      passwordHash,
      emailVerified: true,
    },
    create: {
      email: targetEmail.toLowerCase(),
      role: 'admin',
      passwordHash,
      emailVerified: true,
      phoneVerified: false,
    },
  });

  console.log(`✓ Admin account configured: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log('====================================================');
  console.log(`🎉 SUCCESS: Only "${adminUser.email}" now has Admin Panel Access!`);
  console.log('====================================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
