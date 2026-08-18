import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/orders',
          '/account',
          '/sessions',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/verify-phone',
          '/admin',
        ],
      },
    ],
    sitemap: 'https://shopsmart-ecommerce-store.netlify.app/sitemap.xml',
  };
}
