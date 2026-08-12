/**
 * Notifications Module — public interface.
 * Responsibility: transactional email/OTP dispatch, notification logging,
 * marketing-email opt-out preferences. Primarily consumed via domain
 * events (Backend Standards Section 14.2), not direct synchronous calls.
 * Dependencies: users (email lookup for order-related notifications).
 */
export { notificationsRoutes } from './notifications.routes';
export { registerNotificationListeners } from './notifications.service';

export async function sendEmail(userId: string | undefined, to: string, type: string, subject: string, html: string) {
  const { notificationsService } = await import('./notifications.service');
  return notificationsService.sendEmail(userId, to, type, subject, html);
}

export async function sendOtp(userId: string | undefined, phone: string, code: string) {
  const { notificationsService } = await import('./notifications.service');
  return notificationsService.sendOtp(userId, phone, code);
}
