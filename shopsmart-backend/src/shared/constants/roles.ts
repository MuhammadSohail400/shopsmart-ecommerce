import { Role } from '@prisma/client';

/** Kept in sync with the Prisma `Role` enum (DDD Section 11). */
export const ROLES = {
  CUSTOMER: Role.customer,
  ADMIN: Role.admin,
  INVENTORY_MANAGER: Role.inventory_manager,
  SUPPORT_AGENT: Role.support_agent,
} as const;

export const STAFF_ROLES: Role[] = [Role.admin, Role.inventory_manager, Role.support_agent];
export const CATALOG_MANAGER_ROLES: Role[] = [Role.admin, Role.inventory_manager];
