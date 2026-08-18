const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

/**
 * Configure Sole Admin Ownership
 * Usage:
 *   node set-admin.js <email> [optional_password]
 */
async function main() {
  const targetEmail = (process.argv[2] || 'msohailg211@gmail.com').toLowerCase().trim();
  const newPassword = process.argv[3]; // optional

  console.log('====================================================');
  console.log('🔒 ShopSmart Admin Access & Ownership Management');
  console.log('====================================================');
  console.log(`Setting Sole Admin: ${targetEmail}`);

  // 1. Demote ALL other users to 'customer'
  const demoted = await prisma.user.updateMany({
    where: {
      email: { not: targetEmail },
      role: 'admin',
    },
    data: { role: 'customer' },
  });
  console.log(`✓ Demoted ${demoted.count} other accounts to 'customer' (Admin access completely revoked).`);

  // 2. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (existingUser) {
    const updateData = { role: 'admin', emailVerified: true };
    if (newPassword) {
      updateData.passwordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    }
    const updated = await prisma.user.update({
      where: { email: targetEmail },
      data: updateData,
    });
    console.log(`✓ Updated existing account: ${updated.email} to Role: ${updated.role}`);
  } else {
    const passwordToUse = newPassword || 'Admin@123456';
    const passwordHash = await argon2.hash(passwordToUse, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    const created = await prisma.user.create({
      data: {
        email: targetEmail,
        role: 'admin',
        passwordHash,
        emailVerified: true,
        phoneVerified: false,
      },
    });
    console.log(`✓ Created new admin account: ${created.email} (Role: ${created.role})`);
  }

  console.log('====================================================');
  console.log(`🎉 SUCCESS: ONLY "${targetEmail}" now has Admin Panel Access!`);
  console.log('====================================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
