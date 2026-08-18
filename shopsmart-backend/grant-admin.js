const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

/**
 * Grant Admin Access to a Friend (Keeps existing admins intact)
 * Usage:
 *   node grant-admin.js friend@email.com [optional_password]
 */
async function main() {
  const targetEmail = process.argv[2];
  const newPassword = process.argv[3];

  if (!targetEmail) {
    console.log('❌ Error: Please provide the email of the person you want to give admin access to.');
    console.log('Usage: node grant-admin.js <email> [optional_password]');
    process.exit(1);
  }

  const emailClean = targetEmail.toLowerCase().trim();

  console.log('====================================================');
  console.log('🤝 Granting Admin Access');
  console.log('====================================================');
  console.log(`Target Email: ${emailClean}`);

  const existingUser = await prisma.user.findUnique({
    where: { email: emailClean },
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
      where: { email: emailClean },
      data: updateData,
    });
    console.log(`✓ Upgraded ${updated.email} to Role: admin!`);
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
        email: emailClean,
        role: 'admin',
        passwordHash,
        emailVerified: true,
        phoneVerified: false,
      },
    });
    console.log(`✓ Created new admin account for ${created.email} with password: ${passwordToUse}`);
  }

  console.log('====================================================');
  console.log(`🎉 SUCCESS: "${emailClean}" now has Admin Panel Access!`);
  console.log('====================================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
