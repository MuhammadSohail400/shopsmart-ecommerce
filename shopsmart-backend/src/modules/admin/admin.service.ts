import { adminRepository } from './admin.repository';
import { hashPassword } from '@shared/utils/password.util';
import { recordAuditLog } from '@modules/audit-logs';
import { listOrders } from '@modules/orders';
import { Role } from '@prisma/client';
import { ConflictError, NotFoundError } from '@shared/errors';
import type { CreateStaffBody } from './admin.validators';

export const adminService = {
  async listStaff() {
    return adminRepository.listStaff();
  },

  async createStaff(data: CreateStaffBody, actorId?: string) {
    const existing = await adminRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError('USER_ALREADY_EXISTS', 'An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const staff = await adminRepository.createStaff(data.email, passwordHash, data.role as Role);
    await recordAuditLog(actorId, 'staff.created', 'User', staff.id, undefined, { email: data.email, role: data.role });
    return staff;
  },

  // BR-015/FR-127: cannot remove the last remaining Admin account
  async updateStaffRole(staffId: string, newRole: Role, actorId?: string) {
    const staff = await adminRepository.findStaffById(staffId);
    if (!staff) throw new NotFoundError('Staff account');

    if (staff.role === Role.admin && newRole !== Role.admin) {
      const adminCount = await adminRepository.countAdmins();
      if (adminCount <= 1) {
        throw new ConflictError(
          'LAST_ADMIN_PROTECTED',
          'Cannot change the role of the last remaining admin account',
        );
      }
    }

    const updated = await adminRepository.updateRole(staffId, newRole);
    await recordAuditLog(actorId, 'staff.role_changed', 'User', staffId, { role: staff.role }, { role: newRole });
    return updated;
  },

  async getDashboardSummary() {
    const [orderCountsByStatus, totalRevenue, lowStockResult] = await Promise.all([
      adminRepository.orderCountsByStatus(),
      adminRepository.totalRevenue(),
      adminRepository.countLowStockItems(),
    ]);
    return {
      orderCountsByStatus,
      totalRevenue,
      lowStockItemCount: Number(lowStockResult[0]?.count ?? 0),
    };
  },

  async listOrders(requestingUser: { id: string; role: string }, filters: { status?: string; cursor?: string; limit: number }) {
    return listOrders(requestingUser, filters as never);
  },
};
