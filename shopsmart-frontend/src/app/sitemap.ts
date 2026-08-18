import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shopsmart-ecommerce-store.netlify.app';

  const publicRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/categories', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const categorySlugs = [
    'casual-shirts',
    'formal-shirts',
    'linen-shirts',
    'oxford-shirts',
    'polo-shirts',
    't-shirts',
    'jeans',
    'trousers',
    'men',
    'women',
    'kids',
    'new-arrivals',
    'sale',
  ];

  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${baseUrl}/products?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const staticEntries = publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticEntries, ...categoryRoutes];
}
