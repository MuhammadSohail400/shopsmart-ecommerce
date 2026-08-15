import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB Seeding...');

  // --- 1. Categories ---
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Footwear', slug: 'footwear' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`Upserted ${categoriesData.length} categories.`);

  // --- 2. Brands ---
  const brandsData = [
    { name: 'Apple', slug: 'apple' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'Sony', slug: 'sony' },
  ];

  const brands = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log(`Upserted ${brandsData.length} brands.`);

  // --- 3. Products, Variants, Inventory & Images ---
  const productsData = [
    {
      title: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The ultimate iPhone. Titanium design, A17 Pro chip.',
      basePrice: 999.0,
      categoryId: categories['electronics'].id,
      brandId: brands['apple'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'IP15P-256-NAT', attributes: { Color: 'Natural Titanium', Storage: '256GB' }, priceModifier: 0, stock: 50 },
        { sku: 'IP15P-512-NAT', attributes: { Color: 'Natural Titanium', Storage: '512GB' }, priceModifier: 200, stock: 10 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'MacBook Pro 14-inch (M3)',
      slug: 'macbook-pro-14-m3',
      description: 'Supercharged by M3 Pro or M3 Max.',
      basePrice: 1599.0,
      categoryId: categories['electronics'].id,
      brandId: brands['apple'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MBP14-M3-8-512-SLV', attributes: { Color: 'Silver', Memory: '8GB', Storage: '512GB' }, priceModifier: 0, stock: 25 },
        { sku: 'MBP14-M3-16-1TB-SLV', attributes: { Color: 'Silver', Memory: '16GB', Storage: '1TB' }, priceModifier: 400, stock: 0 }
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Air Force 1 \'07',
      slug: 'nike-air-force-1-07',
      description: 'The radiance lives on in the Nike Air Force 1 \'07.',
      basePrice: 115.0,
      categoryId: categories['footwear'].id,
      brandId: brands['nike'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'NK-AF1-WHT-9', attributes: { Size: '9', Color: 'White' }, priceModifier: 0, stock: 100 },
        { sku: 'NK-AF1-WHT-10', attributes: { Size: '10', Color: 'White' }, priceModifier: 0, stock: 120 },
        { sku: 'NK-AF1-WHT-11', attributes: { Size: '11', Color: 'White' }, priceModifier: 0, stock: 3 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Ultraboost 1.0',
      slug: 'adidas-ultraboost-1-0',
      description: 'High-performance running shoes with incredible energy return.',
      basePrice: 190.0,
      categoryId: categories['footwear'].id,
      brandId: brands['adidas'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'AD-UB1-BLK-9', attributes: { Size: '9', Color: 'Core Black' }, priceModifier: 0, stock: 45 },
        { sku: 'AD-UB1-BLK-10', attributes: { Size: '10', Color: 'Core Black' }, priceModifier: 0, stock: 0 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry leading noise canceling headphones.',
      basePrice: 398.0,
      categoryId: categories['electronics'].id,
      brandId: brands['sony'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SNY-XM5-BLK', attributes: { Color: 'Black' }, priceModifier: 0, stock: 200 },
        { sku: 'SNY-XM5-SLV', attributes: { Color: 'Silver' }, priceModifier: 0, stock: 15 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Essential Crewneck Tee',
      slug: 'essential-crewneck-tee',
      description: 'Premium cotton basic tee for everyday wear.',
      basePrice: 25.0,
      categoryId: categories['clothing'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'TEE-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 300 },
        { sku: 'TEE-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 350 },
        { sku: 'TEE-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless light wash denim jacket.',
      basePrice: 89.0,
      categoryId: categories['clothing'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'DNM-JKT-M', attributes: { Size: 'M', Color: 'Light Blue' }, priceModifier: 0, stock: 40 },
        { sku: 'DNM-JKT-L', attributes: { Size: 'L', Color: 'Light Blue' }, priceModifier: 0, stock: 12 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-s24-ultra',
      description: 'Galaxy AI is here. The ultimate smartphone experience.',
      basePrice: 1299.0,
      categoryId: categories['electronics'].id,
      brandId: brands['samsung'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SM-S24U-256-TT', attributes: { Color: 'Titanium Gray', Storage: '256GB' }, priceModifier: 0, stock: 80 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1707227155694-ba5e228ec532?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Ceramic Coffee Mug',
      slug: 'ceramic-coffee-mug',
      description: 'Handcrafted ceramic mug, 12oz.',
      basePrice: 18.0,
      categoryId: categories['home-kitchen'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MUG-CRM-12', attributes: { Color: 'Cream', Size: '12oz' }, priceModifier: 0, stock: 65 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Stainless Steel Water Bottle',
      slug: 'stainless-water-bottle',
      description: 'Insulated water bottle keeping drinks cold for 24 hours.',
      basePrice: 35.0,
      categoryId: categories['accessories'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'BOT-SS-32', attributes: { Capacity: '32oz', Color: 'Matte Black' }, priceModifier: 0, stock: 110 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Leather Wallet',
      slug: 'classic-leather-wallet',
      description: 'Minimalist genuine leather wallet.',
      basePrice: 45.0,
      categoryId: categories['accessories'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'WLT-BRN-01', attributes: { Color: 'Brown' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Cast Iron Skillet',
      slug: 'cast-iron-skillet-10',
      description: 'Pre-seasoned 10-inch cast iron skillet.',
      basePrice: 30.0,
      categoryId: categories['home-kitchen'].id,
      brandId: null,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PAN-CI-10', attributes: { Size: '10 inch' }, priceModifier: 0, stock: 55 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1584305593883-2f0ef0c20ab1?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Nike Dri-FIT Shorts',
      slug: 'nike-drifit-shorts',
      description: 'Moisture-wicking athletic shorts.',
      basePrice: 35.0,
      categoryId: categories['clothing'].id,
      brandId: brands['nike'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'NK-DF-BLK-M', attributes: { Size: 'M', Color: 'Black' }, priceModifier: 0, stock: 210 },
        { sku: 'NK-DF-BLK-L', attributes: { Size: 'L', Color: 'Black' }, priceModifier: 0, stock: 190 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Adidas NMD_R1',
      slug: 'adidas-nmd-r1',
      description: 'Progressive running shoes with modern design.',
      basePrice: 150.0,
      categoryId: categories['footwear'].id,
      brandId: brands['adidas'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'AD-NMD-WHT-10', attributes: { Size: '10', Color: 'Cloud White' }, priceModifier: 0, stock: 75 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Sony PlayStation 5',
      slug: 'sony-ps5-console',
      description: 'Next generation gaming console.',
      basePrice: 499.0,
      categoryId: categories['electronics'].id,
      brandId: brands['sony'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SNY-PS5-DISC', attributes: { Edition: 'Disc' }, priceModifier: 0, stock: 0 },
        { sku: 'SNY-PS5-DGTL', attributes: { Edition: 'Digital' }, priceModifier: -100, stock: 12 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1000', sortOrder: 0 }
      ]
    }
  ];

  let productsUpserted = 0;
  let variantsCreated = 0;
  for (const p of productsData) {
    // Check if product exists
    const existing = await prisma.product.findFirst({ where: { slug: p.slug } });
    let productId;
    if (existing) {
      productId = existing.id;
    } else {
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
      productId = created.id;
      productsUpserted++;

      // Create variants & inventory
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

      // Create images
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
  }
  console.log(`Created ${productsUpserted} products and ${variantsCreated} variants/inventory records.`);

  // --- 4. Banners ---
  const bannersData = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000',
      linkUrl: '/categories/electronics',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2030-12-31'),
      sortOrder: 1,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000',
      linkUrl: '/categories/clothing',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2030-12-31'),
      sortOrder: 2,
    }
  ];

  const existingBanners = await prisma.banner.count();
  if (existingBanners === 0) {
    for (const b of bannersData) {
      await prisma.banner.create({ data: b });
    }
    console.log(`Created ${bannersData.length} CMS banners.`);
  } else {
    console.log(`CMS banners already exist, skipping.`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
