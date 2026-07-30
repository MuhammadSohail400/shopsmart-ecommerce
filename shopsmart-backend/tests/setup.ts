import { vi } from 'vitest';

// Test environment variables — must be set before any module imports
// src/config/env.ts, since it fails fast (by design) if these are missing.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-vitest-only-not-for-production-use';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.COOKIE_DOMAIN = 'localhost';

/**
 * The Prisma query engine binary cannot be downloaded in this sandbox
 * (binaries.prisma.sh is not reachable). Per Backend Standards Section
 * 17.1, service-layer tests mock the repository layer anyway, so we
 * globally stub @prisma/client's enums/types here — individual test files
 * still mock '@config/database' (or specific repositories) to control
 * actual query behavior.
 */
vi.mock('@prisma/client', () => ({
  Role: { customer: 'customer', admin: 'admin', inventory_manager: 'inventory_manager', support_agent: 'support_agent' },
  ProductStatus: { draft: 'draft', pending_review: 'pending_review', approved: 'approved', rejected: 'rejected' },
  DiscountType: { percentage: 'percentage', flat: 'flat' },
  Prisma: {},
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  })),
}));
