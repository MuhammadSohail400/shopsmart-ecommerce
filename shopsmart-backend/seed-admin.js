const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@shopsmart.com';
  const password = 'Admin@123456';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const existing = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: 'admin',
        passwordHash,
        emailVerified: true,
      },
    });
    console.log(`Updated existing user ${email} to admin with password: ${password}`);
  } else {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
        emailVerified: true,
      },
    });
    console.log(`Created new admin user ${email} with password: ${password}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
