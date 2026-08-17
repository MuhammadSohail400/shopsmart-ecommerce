import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ShopSmart Men\'s Fashion DB Seeding...');

  // --- 1. Clean up old/unrelated demo data safely ---
  // Delete existing inventory, variants, images, products, brands, categories to reset demo catalog cleanly
  console.log('Clearing old product catalog records...');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.banner.deleteMany({});

  // --- 2. Categories (Men's Fashion Hierarchy) ---
  const menRoot = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      depth: 0,
    },
  });

  const shirtsCategory = await prisma.category.create({
    data: {
      name: 'Shirts',
      slug: 'shirts',
      depth: 1,
      parentId: menRoot.id,
    },
  });

  const subcategoriesData = [
    { name: 'Formal Shirts', slug: 'formal-shirts', depth: 2, parentId: shirtsCategory.id },
    { name: 'Casual Shirts', slug: 'casual-shirts', depth: 2, parentId: shirtsCategory.id },
    { name: 'Linen Shirts', slug: 'linen-shirts', depth: 2, parentId: shirtsCategory.id },
    { name: 'Oxford Shirts', slug: 'oxford-shirts', depth: 2, parentId: shirtsCategory.id },
    { name: 'Polo Shirts', slug: 'polo-shirts', depth: 2, parentId: shirtsCategory.id },
  ];

  const mainCategoriesData = [
    { name: 'T-Shirts', slug: 't-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Trousers & Chinos', slug: 'trousers-chinos', depth: 1, parentId: menRoot.id },
    { name: 'Jeans', slug: 'jeans', depth: 1, parentId: menRoot.id },
    { name: 'Jackets & Outerwear', slug: 'jackets-outerwear', depth: 1, parentId: menRoot.id },
    { name: 'Traditional Wear', slug: 'traditional-wear', depth: 1, parentId: menRoot.id },
    { name: 'Accessories', slug: 'accessories', depth: 1, parentId: menRoot.id },
  ];

  const categories: Record<string, any> = {
    men: menRoot,
    shirts: shirtsCategory,
  };

  for (const sub of subcategoriesData) {
    categories[sub.slug] = await prisma.category.create({ data: sub });
  }

  for (const cat of mainCategoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  console.log(`Created categories hierarchy for Men's Fashion.`);

  // --- 3. Brands ---
  const brandsData = [
    { name: 'Urban Thread', slug: 'urban-thread' },
    { name: 'The Gentlemen', slug: 'the-gentlemen' },
    { name: 'Modern Man', slug: 'modern-man' },
    { name: 'Northline', slug: 'northline' },
    { name: 'Thread & Co.', slug: 'thread-co' },
    { name: 'Essential Wear', slug: 'essential-wear' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.create({ data: b });
  }
  console.log(`Created ${brandsData.length} fashion brands.`);

  // --- 4. Curated Men's Fashion Products ---
  const productsData = [
    {
      title: 'Classic White Oxford Shirt',
      slug: 'classic-white-oxford-shirt',
      description: 'Tailored from 100% pure pinpoint Oxford cotton. Features a structured button-down collar, convertible cuffs, and a timeless silhouette suitable for professional and smart-casual settings.',
      basePrice: 59.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-OXF-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 45 },
        { sku: 'UT-OXF-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 75 },
        { sku: 'UT-OXF-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 60 },
        { sku: 'UT-OXF-WHT-XL', attributes: { Size: 'XL', Color: 'White' }, priceModifier: 0, stock: 30 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Premium Navy Slim Fit Formal Shirt',
      slug: 'premium-navy-slim-fit-formal-shirt',
      description: 'Sharp, breathable formal shirt crafted with premium easy-iron cotton twill. Designed with a structured spread collar for modern elegance.',
      basePrice: 65.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['the-gentlemen'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TG-FRM-NVY-S', attributes: { Size: 'S', Color: 'Navy' }, priceModifier: 0, stock: 30 },
        { sku: 'TG-FRM-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 55 },
        { sku: 'TG-FRM-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 40 },
        { sku: 'TG-FRM-NVY-XL', attributes: { Size: 'XL', Color: 'Navy' }, priceModifier: 0, stock: 25 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Relaxed Fit Pure Linen Shirt',
      slug: 'relaxed-fit-pure-linen-shirt',
      description: 'Airy, garment-washed French linen for effortless warm-weather style. Features a relaxed camp collar, breathable open weave, and lightweight drape.',
      basePrice: 69.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['thread-co'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TC-LIN-BGE-S', attributes: { Size: 'S', Color: 'Beige' }, priceModifier: 0, stock: 25 },
        { sku: 'TC-LIN-BGE-M', attributes: { Size: 'M', Color: 'Beige' }, priceModifier: 0, stock: 50 },
        { sku: 'TC-LIN-BGE-L', attributes: { Size: 'L', Color: 'Beige' }, priceModifier: 0, stock: 35 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Sky Blue Casual Oxford Shirt',
      slug: 'sky-blue-casual-oxford-shirt',
      description: 'Soft-washed casual shirt featuring subtle tonal buttons and a curved hem. Perfectly versatile tucked in or worn loose over an essential tee.',
      basePrice: 54.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['modern-man'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MM-CSL-BLU-S', attributes: { Size: 'S', Color: 'Sky Blue' }, priceModifier: 0, stock: 35 },
        { sku: 'MM-CSL-BLU-M', attributes: { Size: 'M', Color: 'Sky Blue' }, priceModifier: 0, stock: 65 },
        { sku: 'MM-CSL-BLU-L', attributes: { Size: 'L', Color: 'Sky Blue' }, priceModifier: 0, stock: 45 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Black Cotton Pique Polo',
      slug: 'classic-black-cotton-pique-polo',
      description: 'Heavyweight organic cotton pique polo with ribbed collar and double-stitched hem for enduring shape and comfort.',
      basePrice: 45.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['northline'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'NL-POL-BLK-S', attributes: { Size: 'S', Color: 'Black' }, priceModifier: 0, stock: 40 },
        { sku: 'NL-POL-BLK-M', attributes: { Size: 'M', Color: 'Black' }, priceModifier: 0, stock: 80 },
        { sku: 'NL-POL-BLK-L', attributes: { Size: 'L', Color: 'Black' }, priceModifier: 0, stock: 70 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1625910513413-56236b283df8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Navy Pique Polo',
      slug: 'classic-navy-pique-polo',
      description: 'Refined navy polo shirt featuring a two-button placket, tailored athletic fit, and breathable honeycomb knit texture.',
      basePrice: 45.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['essential-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'EW-POL-NVY-S', attributes: { Size: 'S', Color: 'Navy' }, priceModifier: 0, stock: 35 },
        { sku: 'EW-POL-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 60 },
        { sku: 'EW-POL-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Essential Heavyweight White T-Shirt',
      slug: 'essential-heavyweight-white-t-shirt',
      description: '240 GSM combed cotton heavyweight crewneck tee with reinforced ribbed neckband and boxy tailored drape.',
      basePrice: 28.0,
      categoryId: categories['t-shirts'].id,
      brandId: brands['essential-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'EW-TEE-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 120 },
        { sku: 'EW-TEE-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 150 },
        { sku: 'EW-TEE-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 110 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Essential Washed Black T-Shirt',
      slug: 'essential-washed-black-t-shirt',
      description: 'Vintage mineral-washed cotton tee with a super-soft hand feel, relaxed shoulders, and durable blind-stitched hem.',
      basePrice: 28.0,
      categoryId: categories['t-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-TEE-BLK-S', attributes: { Size: 'S', Color: 'Washed Black' }, priceModifier: 0, stock: 90 },
        { sku: 'UT-TEE-BLK-M', attributes: { Size: 'M', Color: 'Washed Black' }, priceModifier: 0, stock: 130 },
        { sku: 'UT-TEE-BLK-L', attributes: { Size: 'L', Color: 'Washed Black' }, priceModifier: 0, stock: 95 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Olive Green Corduroy Overshirt',
      slug: 'olive-green-corduroy-overshirt',
      description: 'Plush fine-wale corduroy overshirt with twin chest flap pockets. Functions effortlessly as a light jacket or layered shirt.',
      basePrice: 79.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['northline'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'NL-CORD-OLV-M', attributes: { Size: 'M', Color: 'Olive' }, priceModifier: 0, stock: 35 },
        { sku: 'NL-CORD-OLV-L', attributes: { Size: 'L', Color: 'Olive' }, priceModifier: 0, stock: 40 },
        { sku: 'NL-CORD-OLV-XL', attributes: { Size: 'XL', Color: 'Olive' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Tailored Slim Fit Black Trousers',
      slug: 'tailored-slim-fit-black-trousers',
      description: 'Four-way stretch wool blend dress trousers with a sharp tapered crease and comfortable flex waistband.',
      basePrice: 74.0,
      categoryId: categories['trousers-chinos'].id,
      brandId: brands['the-gentlemen'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TG-TRS-BLK-30', attributes: { Waist: '30', Color: 'Black' }, priceModifier: 0, stock: 30 },
        { sku: 'TG-TRS-BLK-32', attributes: { Waist: '32', Color: 'Black' }, priceModifier: 0, stock: 50 },
        { sku: 'TG-TRS-BLK-34', attributes: { Waist: '34', Color: 'Black' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Beige Straight Chinos',
      slug: 'classic-beige-straight-chinos',
      description: 'Mid-weight cotton twill chinos with a straight-leg cut, pre-washed for vintage softness and all-day versatility.',
      basePrice: 59.0,
      categoryId: categories['trousers-chinos'].id,
      brandId: brands['modern-man'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MM-CHN-BGE-30', attributes: { Waist: '30', Color: 'Beige' }, priceModifier: 0, stock: 40 },
        { sku: 'MM-CHN-BGE-32', attributes: { Waist: '32', Color: 'Beige' }, priceModifier: 0, stock: 60 },
        { sku: 'MM-CHN-BGE-34', attributes: { Waist: '34', Color: 'Beige' }, priceModifier: 0, stock: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Selvedge Raw Denim Jeans',
      slug: 'selvedge-raw-denim-jeans',
      description: 'Authentic 13.5 oz Japanese selvedge denim in deep indigo. Stiff raw finish that molds uniquely to your body over time.',
      basePrice: 89.0,
      categoryId: categories['jeans'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-JNS-RAW-30', attributes: { Waist: '30', Color: 'Raw Indigo' }, priceModifier: 0, stock: 25 },
        { sku: 'UT-JNS-RAW-32', attributes: { Waist: '32', Color: 'Raw Indigo' }, priceModifier: 0, stock: 45 },
        { sku: 'UT-JNS-RAW-34', attributes: { Waist: '34', Color: 'Raw Indigo' }, priceModifier: 0, stock: 35 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Tailored Wool Blend Blazer Jacket',
      slug: 'tailored-wool-blend-blazer-jacket',
      description: 'Deconstructed two-button blazer with notch lapels, patch pockets, and unlined interior for natural shoulder drape.',
      basePrice: 149.0,
      categoryId: categories['jackets-outerwear'].id,
      brandId: brands['the-gentlemen'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TG-BLZ-CHR-38', attributes: { Size: '38R', Color: 'Charcoal' }, priceModifier: 0, stock: 15 },
        { sku: 'TG-BLZ-CHR-40', attributes: { Size: '40R', Color: 'Charcoal' }, priceModifier: 0, stock: 25 },
        { sku: 'TG-BLZ-CHR-42', attributes: { Size: '42R', Color: 'Charcoal' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Casual Suede Bomber Jacket',
      slug: 'casual-suede-bomber-jacket',
      description: 'Ultra-soft faux suede jacket with tonal ribbed trims, antique brass zip closure, and interior chest pocket.',
      basePrice: 129.0,
      categoryId: categories['jackets-outerwear'].id,
      brandId: brands['northline'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'NL-BMB-BRN-M', attributes: { Size: 'M', Color: 'Cognac Brown' }, priceModifier: 0, stock: 20 },
        { sku: 'NL-BMB-BRN-L', attributes: { Size: 'L', Color: 'Cognac Brown' }, priceModifier: 0, stock: 25 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Premium White Embroidered Kurta',
      slug: 'premium-white-embroidered-kurta',
      description: 'Fine breathable lawn cotton kurta with minimalist thread embroidery along the mandarin band collar and placket.',
      basePrice: 65.0,
      categoryId: categories['traditional-wear'].id,
      brandId: brands['thread-co'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TC-KRT-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 35 },
        { sku: 'TC-KRT-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 40 },
        { sku: 'TC-KRT-WHT-XL', attributes: { Size: 'XL', Color: 'White' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Full Grain Leather Belt & Cardholder Set',
      slug: 'full-grain-leather-belt-cardholder-set',
      description: 'Hand-burnished Italian vegetable-tanned leather belt with solid brass buckle, paired with a matching 6-slot slim cardholder.',
      basePrice: 49.0,
      categoryId: categories['accessories'].id,
      brandId: brands['the-gentlemen'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TG-ACC-SET-BRN', attributes: { Color: 'Vintage Brown', Size: 'One Size' }, priceModifier: 0, stock: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000', sortOrder: 0 }
      ]
    }
  ];

  let productsUpserted = 0;
  let variantsCreated = 0;

  for (const p of productsData) {
    const created = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        brandId: p.brandId,
        status: p.status,
      }
    });
    const productId = created.id;
    productsUpserted++;

    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId,
          sku: v.sku,
          attributes: v.attributes,
          priceModifier: v.priceModifier,
        }
      });
      
      await prisma.inventory.create({
        data: {
          productVariantId: variant.id,
          quantity: v.stock,
          lowStockThreshold: 10,
        }
      });
      variantsCreated++;
    }

    for (const img of p.images) {
      await prisma.productImage.create({
        data: {
          productId,
          url: img.url,
          sortOrder: img.sortOrder,
        }
      });
    }
  }

  console.log(`Created ${productsUpserted} Men's Fashion products and ${variantsCreated} variants/inventory records.`);

  // --- 5. Fashion Hero CMS Banners ---
  const bannersData = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2000',
      linkUrl: '/products?category=shirts',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2030-12-31'),
      sortOrder: 1,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000',
      linkUrl: '/products?category=formal-shirts',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2030-12-31'),
      sortOrder: 2,
    }
  ];

  for (const b of bannersData) {
    await prisma.banner.create({ data: b });
  }
  console.log(`Created ${bannersData.length} Men's Fashion CMS banners.`);

  // --- 6. Global Shipping Zone ---
  const existingZones = await prisma.shippingZone.count();
  if (existingZones === 0) {
    await prisma.shippingZone.create({
      data: {
        name: 'Global',
        countries: ['US', 'CA', 'UK', 'PK', 'AU', 'IN', 'DE', 'FR'],
        rates: {
          create: [
            { method: 'standard', cost: 10.00, etaDays: 5 },
            { method: 'express', cost: 25.00, etaDays: 2 }
          ]
        }
      }
    });
    console.log(`Created 1 Global Shipping Zone with rates.`);
  }

  console.log('Men\'s Fashion DB Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
