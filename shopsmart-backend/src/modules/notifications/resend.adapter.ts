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
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return smtpTransporter;
}

async function sendViaBrevo(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
  if (!env.BREVO_API_KEY) return { sent: false, error: 'BREVO_API_KEY not configured' };

  try {
    const senderEmail = env.EMAIL_FROM_ADDRESS && env.EMAIL_FROM_ADDRESS.includes('@')
      ? env.EMAIL_FROM_ADDRESS
      : 'msohailg211@gmail.com';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'ShopSmart',
          email: senderEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = (await response.json()) as { messageId?: string; message?: string; code?: string };

    if (!response.ok) {
      logger.error({ data, to, subject }, 'Brevo email API returned error response');
      return { sent: false, error: data.message || `Brevo error: ${response.statusText}` };
    }

    logger.info({ messageId: data.messageId, to, subject }, 'Email sent successfully via Brevo HTTPS API');
    return { sent: true };
  } catch (err) {
    const message = (err as Error).message;
    logger.error({ err, to, subject }, 'Brevo email dispatch threw exception');
    return { sent: false, error: message };
  }
}

export const resendAdapter = {
  async sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
    // 1. Prefer Brevo HTTPS API (Zero port blocking on Railway, 300 free emails/day to ANY email, no domain required)
    if (env.BREVO_API_KEY) {
      return sendViaBrevo(to, subject, html);
    }

    // 2. Fallback to standard SMTP if SMTP_USER & SMTP_PASS provided
    const smtp = getSmtpTransporter();
    if (smtp) {
      try {
        const fromAddress = env.EMAIL_FROM_ADDRESS && env.EMAIL_FROM_ADDRESS.includes('@')
          ? env.EMAIL_FROM_ADDRESS
          : `"ShopSmart" <${env.SMTP_USER}>`;

        const info = await smtp.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });

        logger.info({ messageId: info.messageId, to, subject }, 'Email sent successfully via SMTP');
        return { sent: true };
      } catch (err) {
        const message = (err as Error).message;
        logger.error({ err, to, subject }, 'SMTP dispatch threw exception');
        return { sent: false, error: message };
      }
    }

    // 3. Fallback to Resend API if configured
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

    // 4. Fallback: log to console in local development
    logger.info({ to, subject }, 'No Email API credentials set — email logged to console');
    logger.info(`\n=== EMAIL DISPATCH LOG ===\nTO: ${to}\nSUBJECT: ${subject}\nHTML CONTENT:\n${html}\n==========================\n`);
    return { sent: true };
  },
};
