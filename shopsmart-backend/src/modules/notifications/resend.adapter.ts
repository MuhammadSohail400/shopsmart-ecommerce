import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '@config/env';
import { logger } from '@config/logger';

let resendClient: Resend | null = null;
let smtpTransporter: nodemailer.Transporter | null = null;

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function getSmtpTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: env.SMTP_PORT || 465,
      secure: env.SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return smtpTransporter;
}

export const resendAdapter = {
  async sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
    const smtp = getSmtpTransporter();

    // 1. Prefer SMTP (Gmail SMTP) if configured — sends to ANY email with 0 cost & NO domain required
    if (smtp) {
      try {
        const fromAddress = env.EMAIL_FROM_ADDRESS && env.EMAIL_FROM_ADDRESS !== 'no-reply@shopsmart.ai'
          ? env.EMAIL_FROM_ADDRESS
          : `"ShopSmart" <${env.SMTP_USER}>`;

        const info = await smtp.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });

        logger.info({ messageId: info.messageId, to, subject }, 'Email sent successfully via Gmail SMTP');
        return { sent: true };
      } catch (err) {
        const message = (err as Error).message;
        logger.error({ err, to, subject }, 'Gmail SMTP dispatch threw exception');
        return { sent: false, error: message };
      }
    }

    // 2. Fallback to Resend if RESEND_API_KEY is configured
    const resend = getResendClient();
    if (resend) {
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
    }

    // 3. Fallback: log to console in local development
    logger.info({ to, subject }, 'No SMTP or Resend credentials set — email logged to console');
    logger.info(`\n=== EMAIL DISPATCH LOG ===\nTO: ${to}\nSUBJECT: ${subject}\nHTML CONTENT:\n${html}\n==========================\n`);
    return { sent: true };
  },
};
