import { PrismaClient } from '../generated/client';
import { env } from './env';

/**
 * Single Prisma client instance for the whole process (Backend Standards
 * Section 11.2). No module should ever instantiate its own PrismaClient.
 *
 * `readClient` is aliased to the same instance today (single database), but
 * repositories import from here so that routing reads to a replica later
 * (SDD Section 17 / Backend Standards Section 20) is a config change only.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const readClient = prisma;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
