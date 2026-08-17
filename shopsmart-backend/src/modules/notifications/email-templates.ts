/**
 * Minimal inline HTML templates. Kept simple and dependency-free; a
 * templating engine (MJML, react-email, etc.) can replace this file later
 * without touching any caller, since callers only see rendered HTML strings.
 */
import { env } from '@config/env';

function getFrontendUrl(): string {
  if (env.FRONTEND_URL) {
    return env.FRONTEND_URL.replace(/\/$/, '');
  }
  if (env.NODE_ENV === 'production') {
    return 'https://shopsmart-ecommerce-store.netlify.app';
  }
  // In development, pick the first valid origin
  const firstOrigin = (env.CORS_ORIGIN || '').split(',')[0].trim();
  return firstOrigin || 'http://localhost:3000';
}

export const emailTemplates = {
  verification(userId: string): { subject: string; html: string } {
    const frontendUrl = getFrontendUrl();
    return {
      subject: 'Verify your ShopSmart AI account',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <h2 style="color: #4f46e5;">Welcome to ShopSmart AI!</h2>
               <p>Please verify your account to start shopping our curated catalog.</p>
               <p style="margin: 24px 0;">
                 <a href="${frontendUrl}/verify-email?userId=${userId}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
                   Verify Email Address
                 </a>
               </p>
               <p style="font-size: 12px; color: #6b7280;">If you did not create this account, please ignore this message.</p>
             </div>`,
    };
  },

  passwordReset(resetToken: string): { subject: string; html: string } {
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    return {
      subject: 'Reset your ShopSmart AI password',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <h2 style="color: #4f46e5;">Reset Your Password</h2>
               <p>We received a request to reset your password for your ShopSmart account.</p>
               <p style="margin: 24px 0;">
                 <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
                   Reset Password
                 </a>
               </p>
               <p style="font-size: 13px; color: #4b5563;">Or copy and paste this URL into your browser:</p>
               <p style="font-size: 12px; color: #6b7280; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
               <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
             </div>`,
    };
  },

  orderConfirmed(orderId: string): { subject: string; html: string } {
    const frontendUrl = getFrontendUrl();
    return {
      subject: 'Your ShopSmart AI order is confirmed',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <h2 style="color: #4f46e5;">Order Confirmed!</h2>
               <p>Thanks for your order! Your reference ID is: <strong>${orderId}</strong></p>
               <p style="margin: 20px 0;">
                 <a href="${frontendUrl}/orders/${orderId}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
                   View Order Details
                 </a>
               </p>
             </div>`,
    };
  },

  orderStatusChanged(orderId: string, newStatus: string): { subject: string; html: string } {
    return {
      subject: `Order update: ${newStatus}`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <h2 style="color: #4f46e5;">Order Status Update</h2>
               <p>Your order <strong>${orderId}</strong> status has changed to: <strong>${newStatus}</strong>.</p>
             </div>`,
    };
  },
};
