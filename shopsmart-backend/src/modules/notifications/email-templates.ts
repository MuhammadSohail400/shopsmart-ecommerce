/**
 * Minimal inline HTML templates. Kept simple and dependency-free; a
 * templating engine (MJML, react-email, etc.) can replace this file later
 * without touching any caller, since callers only see rendered HTML strings.
 */
import { env } from '@config/env';

export const emailTemplates = {
  verification(userId: string): { subject: string; html: string } {
    return {
      subject: 'Verify your ShopSmart AI account',
      html: `<p>Welcome to ShopSmart AI! Please verify your account to start shopping.</p>
             <p>(Verification link/OTP delivery wiring goes here — userId: ${userId})</p>`,
    };
  },

  passwordReset(resetToken: string): { subject: string; html: string } {
    const frontendUrl = env.CORS_ORIGIN || 'https://shopsmart.ai';
    return {
      subject: 'Reset your ShopSmart AI password',
      html: `<p>We received a request to reset your password.</p>
             <p>Use this link to continue: ${frontendUrl}/reset-password?token=${resetToken}</p>
             <p>If you didn't request this, you can safely ignore this email.</p>`,
    };
  },

  orderConfirmed(orderId: string): { subject: string; html: string } {
    return {
      subject: 'Your ShopSmart AI order is confirmed',
      html: `<p>Thanks for your order! Order reference: ${orderId}</p>
             <p>We'll email you again once it ships.</p>`,
    };
  },

  orderStatusChanged(orderId: string, newStatus: string): { subject: string; html: string } {
    return {
      subject: `Order update: ${newStatus}`,
      html: `<p>Your order ${orderId} status has changed to: <strong>${newStatus}</strong>.</p>`,
    };
  },
};
