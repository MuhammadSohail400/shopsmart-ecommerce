export const siteConfig = {
  name: 'ShopSmart',
  title: 'ShopSmart | Premium Men\'s Fashion & Shirts in Pakistan',
  description: 'Shop premium men\'s shirts, casual wear and everyday fashion essentials online in Pakistan. Discover new arrivals, best sellers and exclusive deals at ShopSmart.',
  url: 'https://shopsmart-ecommerce-store.netlify.app',
  ogImage: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1200&auto=format&fit=crop',
  links: {
    twitter: 'https://twitter.com/shopsmart',
    instagram: 'https://instagram.com/shopsmart',
    facebook: 'https://facebook.com/shopsmart',
  },
  keywords: [
    'men fashion Pakistan',
    'formal shirts',
    'casual shirts',
    'linen shirts',
    'oxford shirts',
    'polo shirts',
    'trousers',
    'chinos',
    'mens clothing online',
    'ShopSmart Pakistan'
  ],
  author: 'ShopSmart Fashion',
};

export function getStructuredData() {
  return {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
      sameAs: [
        siteConfig.links.instagram,
        siteConfig.links.facebook,
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@shopsmart.com',
        availableLanguage: ['English', 'Urdu'],
      },
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  };
}
