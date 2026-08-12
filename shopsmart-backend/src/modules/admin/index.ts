/**
 * Admin Module — public interface.
 * Responsibility: staff/RBAC management, dashboard aggregation, order
 * management view. Aggregates read-only data from other modules via their
 * public interfaces — never duplicates business logic that belongs to the
 * owning module (Backend Standards Section 4).
 * Dependencies: audit-logs, orders (all via public interfaces).
 */
export { adminRoutes } from './admin.routes';
