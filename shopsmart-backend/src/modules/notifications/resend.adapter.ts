import { Resend } from 'resend';
import { env } from '@config/env';
import { logger } from '@config/logger';

/**
 * Single file that imports the Resend SDK directly (Backend Standards
 * Section 13.4 pattern, same as the Stripe adapter). Every other file
 * talks to this adapter, never to `resend` directly.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export const resendAdapter = {
  async sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
    const resend = getClient();

    if (!resend) {
      // Dev-friendly fallback: no API key configured, log instead of failing
      // the whole request chain (SDD Section 18: graceful degradation).
      logger.info({ to, subject }, 'RESEND_API_KEY not set on backend — email logged to console instead of sent');
      logger.info(`\n=== EMAIL DISPATCH LOG ===\nTO: ${to}\nSUBJECT: ${subject}\nHTML CONTENT:\n${html}\n==========================\n`);
      return { sent: true };
    }

    try {
      const response = await resend.emails.send({
        from: env.EMAIL_FROM_ADDRESS,
        to,
        subject,
        html,
      });

      if (response.error) {
        logger.error({ error: response.error, to, subject }, 'Resend email API returned error response');
        return { sent: false, error: response.error.message };
      }

      logger.info({ id: response.data?.id, to, subject }, 'Resend email sent successfully');
      return { sent: true };
    } catch (err) {
      const message = (err as Error).message;
      logger.error({ err, to, subject }, 'Resend email dispatch threw exception');
      return { sent: false, error: message };
    }
  },
};
