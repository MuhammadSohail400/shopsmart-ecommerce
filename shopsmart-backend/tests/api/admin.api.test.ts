import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../src/modules/admin/admin.repository', () => ({
  adminRepository: {
    listStaff: vi.fn(),
    countAdmins: vi.fn(),
    findStaffById: vi.fn(),
    createStaff: vi.fn(),
    updateRole: vi.fn(),
    orderCountsByStatus: vi.fn().mockResolvedValue({}),
    totalRevenue: vi.fn().mockResolvedValue(0),
    countLowStockItems: vi.fn().mockResolvedValue([{ count: 0n }]),
  },
}));

vi.mock('@config/redis', () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
    ttl: vi.fn().mockResolvedValue(60),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
    on: vi.fn(),
  },
}));

vi.mock('@config/database', () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    auditLog: { create: vi.fn() },
  },
}));

import { adminRepository } from '../../src/modules/admin/admin.repository';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

const app = createApp();

function tokenFor(role: string, sub = 'admin-1') {
  return jwt.sign({ sub, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

describe('PATCH /api/v1/admin/staff/:staffId/role (BR-015/FR-127)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 409 LAST_ADMIN_PROTECTED when demoting the only remaining admin', async () => {
    (adminRepository.findStaffById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    });
    (adminRepository.countAdmins as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const res = await request(app)
      .patch('/api/v1/admin/staff/admin-1/role')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ role: 'support_agent' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('LAST_ADMIN_PROTECTED');
    expect(adminRepository.updateRole).not.toHaveBeenCalled();
  });

  it('succeeds when demoting an admin while other admins still exist', async () => {
    (adminRepository.findStaffById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'admin-2',
      role: 'admin',
    });
    (adminRepository.countAdmins as ReturnType<typeof vi.fn>).mockResolvedValue(2);
    (adminRepository.updateRole as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'admin-2',
      role: 'support_agent',
    });

    const res = await request(app)
      .patch('/api/v1/admin/staff/admin-2/role')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ role: 'support_agent' });

    expect(res.status).toBe(200);
    expect(adminRepository.updateRole).toHaveBeenCalledWith('admin-2', 'support_agent');
  });

  it('returns 403 when a non-admin staff member attempts a role change', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/staff/admin-2/role')
      .set('Authorization', `Bearer ${tokenFor('support_agent')}`)
      .send({ role: 'inventory_manager' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for a nonexistent staff account', async () => {
    (adminRepository.findStaffById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/admin/staff/does-not-exist/role')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ role: 'support_agent' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/admin/dashboard/summary', () => {
  it('allows any staff role (not just admin)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard/summary')
      .set('Authorization', `Bearer ${tokenFor('inventory_manager')}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalRevenue');
    expect(res.body.data).toHaveProperty('lowStockItemCount');
  });

  it('rejects a plain customer', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard/summary')
      .set('Authorization', `Bearer ${tokenFor('customer')}`);

    expect(res.status).toBe(403);
  });
});
