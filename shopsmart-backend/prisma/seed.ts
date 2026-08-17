import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ShopSmart Fashion DB Seeding (PKR Pricing & Men/Women/Kids Catalog)...');

  // --- 1. Clean up old records safely ---
  console.log('Clearing old catalog records...');
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

  // --- 2. Categories Hierarchy ---
  const menRoot = await prisma.category.create({
    data: { name: 'Men', slug: 'men', depth: 0 },
  });

  const womenRoot = await prisma.category.create({
    data: { name: 'Women', slug: 'women', depth: 0 },
  });

  const kidsRoot = await prisma.category.create({
    data: { name: 'Kids', slug: 'kids', depth: 0 },
  });

  const collectionsRoot = await prisma.category.create({
    data: { name: 'Collections', slug: 'collections', depth: 0 },
  });

  // Subcategories
  const subcategoriesData = [
    // Men Subcategories
    { name: 'Formal Shirts', slug: 'formal-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Casual Shirts', slug: 'casual-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Linen Shirts', slug: 'linen-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Oxford Shirts', slug: 'oxford-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Polo Shirts', slug: 'polo-shirts', depth: 1, parentId: menRoot.id },
    { name: 'T-Shirts', slug: 't-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Trousers & Chinos', slug: 'trousers-chinos', depth: 1, parentId: menRoot.id },
    { name: 'Jeans', slug: 'jeans', depth: 1, parentId: menRoot.id },
    { name: 'Jackets & Outerwear', slug: 'jackets-outerwear', depth: 1, parentId: menRoot.id },
    { name: 'Traditional Wear', slug: 'traditional-wear', depth: 1, parentId: menRoot.id },
    
    // Women Subcategories
    { name: 'Dresses', slug: 'dresses', depth: 1, parentId: womenRoot.id },
    { name: 'Tops & Blouses', slug: 'tops-blouses', depth: 1, parentId: womenRoot.id },
    { name: 'Women Trousers', slug: 'women-trousers', depth: 1, parentId: womenRoot.id },

    // Kids Subcategories
    { name: 'Boys Collection', slug: 'boys', depth: 1, parentId: kidsRoot.id },
    { name: 'Girls Collection', slug: 'girls', depth: 1, parentId: kidsRoot.id },

    // Collections
    { name: 'New Arrivals', slug: 'new-arrivals', depth: 1, parentId: collectionsRoot.id },
    { name: 'Best Sellers', slug: 'best-sellers', depth: 1, parentId: collectionsRoot.id },
    { name: 'Sale - Up to 50% Off', slug: 'sale', depth: 1, parentId: collectionsRoot.id },
  ];

  const categories: Record<string, any> = {
    men: menRoot,
    women: womenRoot,
    kids: kidsRoot,
    collections: collectionsRoot,
  };

  for (const sub of subcategoriesData) {
    categories[sub.slug] = await prisma.category.create({ data: sub });
  }

  console.log(`Created categories hierarchy.`);

  // --- 3. Fashion Brands ---
  const brandsData = [
    { name: 'Urban Thread', slug: 'urban-thread' },
    { name: 'Classic Fit', slug: 'classic-fit' },
    { name: 'StyleCraft', slug: 'stylecraft' },
    { name: 'Modern Wear', slug: 'modern-wear' },
    { name: 'Prime Apparel', slug: 'prime-apparel' },
    { name: 'Urban Vogue', slug: 'urban-vogue' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.create({ data: b });
  }
  console.log(`Created ${brandsData.length} fashion brands.`);

  // --- 4. Curated Fashion Products with Pakistani Pricing ---
  const productsData = [
    // --- MEN'S SHIRTS ---
    {
      title: 'Classic White Oxford Shirt',
      slug: 'classic-white-oxford-shirt',
      description: 'Crafted from 100% fine pinpoint Oxford cotton. Features a structured button-down collar, convertible cuffs, and a tailored fit for business and smart-casual wear.',
      basePrice: 2499.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-OXF-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 50 },
        { sku: 'UT-OXF-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 80 },
        { sku: 'UT-OXF-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 65 },
        { sku: 'UT-OXF-WHT-XL', attributes: { Size: 'XL', Color: 'White' }, priceModifier: 0, stock: 35 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Relaxed Fit Pure Linen Shirt',
      slug: 'relaxed-fit-pure-linen-shirt',
      description: 'Airy, garment-washed French linen designed for effortless warm-weather elegance. Features a relaxed camp collar and breathable open weave.',
      basePrice: 3650.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-LIN-BGE-S', attributes: { Size: 'S', Color: 'Beige' }, priceModifier: 0, stock: 30 },
        { sku: 'SC-LIN-BGE-M', attributes: { Size: 'M', Color: 'Beige' }, priceModifier: 0, stock: 55 },
        { sku: 'SC-LIN-BGE-L', attributes: { Size: 'L', Color: 'Beige' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Sky Blue Casual Cotton Shirt',
      slug: 'sky-blue-casual-cotton-shirt',
      description: 'Soft pre-washed cotton casual shirt with tonal buttons and curved hem. Suitable for effortless layering or smart office attire.',
      basePrice: 1825.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-CSL-BLU-S', attributes: { Size: 'S', Color: 'Sky Blue' }, priceModifier: 0, stock: 40 },
        { sku: 'CF-CSL-BLU-M', attributes: { Size: 'M', Color: 'Sky Blue' }, priceModifier: 0, stock: 70 },
        { sku: 'CF-CSL-BLU-L', attributes: { Size: 'L', Color: 'Sky Blue' }, priceModifier: 0, stock: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Executive Navy Formal Spread Shirt',
      slug: 'executive-navy-formal-spread-shirt',
      description: 'Premium wrinkle-resistant cotton twill shirt with a spread cutaway collar. Tailored specifically for formal suit wear.',
      basePrice: 2999.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-FRM-NVY-S', attributes: { Size: 'S', Color: 'Navy' }, priceModifier: 0, stock: 35 },
        { sku: 'PA-FRM-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 60 },
        { sku: 'PA-FRM-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 45 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Black Pique Polo',
      slug: 'classic-black-pique-polo',
      description: 'Heavyweight organic cotton pique knit polo with ribbed collar and double-stitched hem for enduring shape and comfort.',
      basePrice: 1999.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['modern-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MW-POL-BLK-S', attributes: { Size: 'S', Color: 'Black' }, priceModifier: 0, stock: 45 },
        { sku: 'MW-POL-BLK-M', attributes: { Size: 'M', Color: 'Black' }, priceModifier: 0, stock: 85 },
        { sku: 'MW-POL-BLK-L', attributes: { Size: 'L', Color: 'Black' }, priceModifier: 0, stock: 70 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1625910513413-56236b283df8?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Essential Heavyweight White Tee',
      slug: 'essential-heavyweight-white-tee',
      description: '240 GSM combed cotton heavyweight crewneck tee with reinforced ribbed neckband and boxy tailored drape.',
      basePrice: 1299.0,
      categoryId: categories['t-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-TEE-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 120 },
        { sku: 'UT-TEE-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 160 },
        { sku: 'UT-TEE-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 110 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Olive Fine Corduroy Overshirt',
      slug: 'olive-fine-corduroy-overshirt',
      description: 'Plush fine-wale corduroy overshirt with twin chest flap pockets. Functions effortlessly as a light jacket or layered shirt.',
      basePrice: 3850.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-CORD-OLV-M', attributes: { Size: 'M', Color: 'Olive' }, priceModifier: 0, stock: 35 },
        { sku: 'PA-CORD-OLV-L', attributes: { Size: 'L', Color: 'Olive' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Tailored Slim Fit Black Trousers',
      slug: 'tailored-slim-fit-black-trousers',
      description: 'Four-way stretch wool-cotton blend dress trousers with a sharp tapered crease and comfortable flex waistband.',
      basePrice: 3250.0,
      categoryId: categories['trousers-chinos'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-TRS-BLK-30', attributes: { Waist: '30', Color: 'Black' }, priceModifier: 0, stock: 30 },
        { sku: 'CF-TRS-BLK-32', attributes: { Waist: '32', Color: 'Black' }, priceModifier: 0, stock: 50 },
        { sku: 'CF-TRS-BLK-34', attributes: { Waist: '34', Color: 'Black' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Classic Beige Cotton Chinos',
      slug: 'classic-beige-cotton-chinos',
      description: 'Mid-weight cotton twill chinos with a straight-leg cut, pre-washed for vintage softness and all-day versatility.',
      basePrice: 2850.0,
      categoryId: categories['trousers-chinos'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-CHN-BGE-30', attributes: { Waist: '30', Color: 'Beige' }, priceModifier: 0, stock: 40 },
        { sku: 'SC-CHN-BGE-32', attributes: { Waist: '32', Color: 'Beige' }, priceModifier: 0, stock: 65 },
        { sku: 'SC-CHN-BGE-34', attributes: { Waist: '34', Color: 'Beige' }, priceModifier: 0, stock: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Selvedge Raw Denim Jeans',
      slug: 'selvedge-raw-denim-jeans',
      description: 'Authentic 13.5 oz Japanese selvedge denim in deep indigo. Stiff raw finish that molds uniquely to your body over time.',
      basePrice: 4250.0,
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
      title: 'Tailored Wool Blend Blazer',
      slug: 'tailored-wool-blend-blazer',
      description: 'Deconstructed two-button blazer with notch lapels, patch pockets, and unlined interior for natural shoulder drape.',
      basePrice: 6999.0,
      categoryId: categories['jackets-outerwear'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-BLZ-CHR-38', attributes: { Size: '38R', Color: 'Charcoal' }, priceModifier: 0, stock: 15 },
        { sku: 'CF-BLZ-CHR-40', attributes: { Size: '40R', Color: 'Charcoal' }, priceModifier: 0, stock: 25 },
        { sku: 'CF-BLZ-CHR-42', attributes: { Size: '42R', Color: 'Charcoal' }, priceModifier: 0, stock: 20 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Premium White Embroidered Kurta',
      slug: 'premium-white-embroidered-kurta',
      description: 'Fine breathable lawn cotton kurta with minimalist thread embroidery along the mandarin band collar and placket.',
      basePrice: 3450.0,
      categoryId: categories['traditional-wear'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-KRT-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 35 },
        { sku: 'SC-KRT-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 45 },
        { sku: 'SC-KRT-WHT-XL', attributes: { Size: 'XL', Color: 'White' }, priceModifier: 0, stock: 25 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000', sortOrder: 0 }
      ]
    },
    
    // --- WOMEN'S FASHION ---
    {
      title: 'Floral Print Midi Wrap Dress',
      slug: 'floral-print-midi-wrap-dress',
      description: 'Flowing lightweight chiffon midi dress featuring a flattering wrap front, v-neckline, and tie waist belt.',
      basePrice: 3999.0,
      categoryId: categories['dresses'].id,
      brandId: brands['urban-vogue'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UV-DRS-FLR-S', attributes: { Size: 'S', Color: 'Floral' }, priceModifier: 0, stock: 25 },
        { sku: 'UV-DRS-FLR-M', attributes: { Size: 'M', Color: 'Floral' }, priceModifier: 0, stock: 40 },
        { sku: 'UV-DRS-FLR-L', attributes: { Size: 'L', Color: 'Floral' }, priceModifier: 0, stock: 30 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Satin Silk Relaxed Blouse',
      slug: 'satin-silk-relaxed-blouse',
      description: 'Lustrous satin finish button-up blouse with draped shoulders and subtle shell buttons. Perfect for evening or office wear.',
      basePrice: 2850.0,
      categoryId: categories['tops-blouses'].id,
      brandId: brands['urban-vogue'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UV-TOP-SAT-S', attributes: { Size: 'S', Color: 'Champagne' }, priceModifier: 0, stock: 30 },
        { sku: 'UV-TOP-SAT-M', attributes: { Size: 'M', Color: 'Champagne' }, priceModifier: 0, stock: 45 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'High-Waisted Linen Blend Trousers',
      slug: 'high-waisted-linen-blend-trousers',
      description: 'Breathable linen-cotton wide-leg trousers featuring a tailored high-rise waist and front pleat detailing.',
      basePrice: 3250.0,
      categoryId: categories['women-trousers'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-WTR-BGE-S', attributes: { Size: 'S', Color: 'Cream' }, priceModifier: 0, stock: 25 },
        { sku: 'SC-WTR-BGE-M', attributes: { Size: 'M', Color: 'Cream' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000', sortOrder: 0 }
      ]
    },

    // --- KIDS FASHION ---
    {
      title: 'Boys Cotton Striped Polo',
      slug: 'boys-cotton-striped-polo',
      description: '100% soft breathable cotton pique polo with sporty engineered stripes and durable rib collar.',
      basePrice: 1450.0,
      categoryId: categories['boys'].id,
      brandId: brands['modern-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MW-KID-POL-4Y', attributes: { Age: '4-5Y', Color: 'Blue/White' }, priceModifier: 0, stock: 30 },
        { sku: 'MW-KID-POL-6Y', attributes: { Age: '6-7Y', Color: 'Blue/White' }, priceModifier: 0, stock: 35 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000', sortOrder: 0 }
      ]
    },
    {
      title: 'Girls Floral Cotton Summer Dress',
      slug: 'girls-floral-cotton-summer-dress',
      description: 'Charming sleeveless cotton sundress with gathered ruffle hem and breathable lining for everyday play.',
      basePrice: 1650.0,
      categoryId: categories['girls'].id,
      brandId: brands['urban-vogue'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UV-KID-DRS-4Y', attributes: { Age: '4-5Y', Color: 'Pastel Floral' }, priceModifier: 0, stock: 30 },
        { sku: 'UV-KID-DRS-6Y', attributes: { Age: '6-7Y', Color: 'Pastel Floral' }, priceModifier: 0, stock: 40 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1000', sortOrder: 0 }
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

  console.log(`Created ${productsUpserted} fashion products and ${variantsCreated} variants/inventory records.`);

  // --- 5. Fashion Hero CMS Banners ---
  const bannersData = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2000',
      linkUrl: '/products?category=oxford-shirts',
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
  console.log(`Created ${bannersData.length} fashion CMS banners.`);

  // --- 6. Global Shipping Zone ---
  const existingZones = await prisma.shippingZone.count();
  if (existingZones === 0) {
    await prisma.shippingZone.create({
      data: {
        name: 'Pakistan & Global',
        countries: ['PK', 'US', 'CA', 'UK', 'AU', 'IN', 'DE', 'FR'],
        rates: {
          create: [
            { method: 'standard', cost: 200.00, etaDays: 3 },
            { method: 'express', cost: 450.00, etaDays: 1 }
          ]
        }
      }
    });
    console.log(`Created Shipping Zone with local rates.`);
  }

  console.log('Fashion DB Seeding successfully completed!');
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
