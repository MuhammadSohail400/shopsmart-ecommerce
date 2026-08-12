import { notificationsRepository } from './notifications.repository';
import { resendAdapter } from './resend.adapter';
import { emailTemplates } from './email-templates';
import { eventBus } from '@shared/events';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { logger } from '@config/logger';

export const notificationsService = {
  async sendEmail(userId: string | undefined, to: string, type: string, subject: string, html: string) {
    const result = await resendAdapter.sendEmail(to, subject, html);
    await notificationsRepository.create({
      userId,
      type,
      channel: NotificationChannel.email,
      recipient: to,
      status: result.sent ? NotificationStatus.sent : NotificationStatus.failed,
      error: result.error,
    });
    return result;
  },

  // FR-103: OTP delivery. SMS provider integration is out of scope for this
  // phase (no SMS_PROVIDER configured yet) — logged and recorded as "sent"
  // in dev so the auth flow remains testable end-to-end; swap the log line
  // for a real SMS adapter call (same pattern as resendAdapter) when ready.
  async sendOtp(userId: string | undefined, phone: string, code: string) {
    logger.info({ phone }, `OTP (dev mode, no SMS provider configured): ${code}`);
    await notificationsRepository.create({
      userId,
      type: 'otp',
      channel: NotificationChannel.sms,
      recipient: phone,
      status: NotificationStatus.sent,
    });
  },

  async getPreference(userId: string) {
    const pref = await notificationsRepository.findPreference(userId);
    return pref ?? { userId, marketingEmailsOptIn: true };
  },

  async updatePreference(userId: string, marketingEmailsOptIn: boolean) {
    return notificationsRepository.upsertPreference(userId, marketingEmailsOptIn);
  },

  async listLogs(filters: { type?: string; status?: NotificationStatus; cursor?: string; limit: number }) {
    return notificationsRepository.list(filters);
  },
};

/**
 * Registers event listeners at startup (Backend Standards Section 14.2/14.3).
 * Called once from server.ts. Every handler runs off the request's call
 * stack via jobRunner-equivalent async dispatch (the event bus itself
 * already fires handlers asynchronously and catches their errors).
 */
export function registerNotificationListeners(): void {
  eventBus.subscribe('user.registered', async (payload) => {
    if (!payload.email) return; // FR-004 (phone OTP) handled separately at registration time
    const { subject, html } = emailTemplates.verification(payload.userId);
    await notificationsService.sendEmail(payload.userId, payload.email, 'verification', subject, html);
  });

  eventBus.subscribe('user.password_reset_requested', async (payload) => {
    if (!payload.email) return;
    const { subject, html } = emailTemplates.passwordReset(payload.resetToken);
    await notificationsService.sendEmail(payload.userId, payload.email, 'password_reset', subject, html);
  });

  eventBus.subscribe('order.confirmed', async (payload) => {
    if (!payload.userId) return; // guest orders: no account to email via this path (guest email capture is Phase 5's guest checkout data, not wired to Notifications yet)
    const { getUserContactInfo } = await import('@modules/users');
    const contact = await getUserContactInfo(payload.userId);
    if (!contact?.email) return;
    const { subject, html } = emailTemplates.orderConfirmed(payload.orderId);
    await notificationsService.sendEmail(payload.userId, contact.email, 'order_confirmation', subject, html);
  });

  eventBus.subscribe('order.status_changed', async (payload) => {
    if (!payload.userId) return;
    const { getUserContactInfo } = await import('@modules/users');
    const contact = await getUserContactInfo(payload.userId);
    if (!contact?.email) return;
    const { subject, html } = emailTemplates.orderStatusChanged(payload.orderId, payload.newStatus);
    await notificationsService.sendEmail(payload.userId, contact.email, 'order_status_update', subject, html);
  });

  logger.info('Notification event listeners registered');
}
