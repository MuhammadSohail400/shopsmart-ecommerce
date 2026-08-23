export const siteConfig = {
  name: 'ASORA',
  tagline: 'WEAR YOUR STORY.',
  title: 'ASORA | Premium Anime Streetwear & Custom T-Shirts',
  description: 'Wear your story. Discover exclusive premium anime streetwear, oversized graphic tees, and custom designed apparel engineered for everyday rebellion.',
  url: 'https://asora-streetwear.netlify.app',
  ogImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
  links: {
    twitter: 'https://twitter.com/asora_official',
    instagram: 'https://instagram.com/asora_streetwear',
    facebook: 'https://facebook.com/asoraclothing',
  },
  keywords: [
    'ASORA',
    'anime streetwear',
    'oversized anime t-shirts',
    'custom t-shirts Pakistan',
    'graphic tees',
    'anime clothing',
    'streetwear Pakistan',
    'wear your story',
    'premium graphic tees',
    'cyberpunk clothing'
  ],
  author: 'ASORA Streetwear Studio',
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
