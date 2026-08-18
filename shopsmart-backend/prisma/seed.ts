import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ShopSmart Fashion DB Seeding (56 Real Products: 34 Shirts & 22 Pants)...');

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
  const menRoot = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: { name: 'Men', slug: 'men', depth: 0 },
  });

  const womenRoot = await prisma.category.upsert({
    where: { slug: 'women' },
    update: {},
    create: { name: 'Women', slug: 'women', depth: 0 },
  });

  const kidsRoot = await prisma.category.upsert({
    where: { slug: 'kids' },
    update: {},
    create: { name: 'Kids', slug: 'kids', depth: 0 },
  });

  const collectionsRoot = await prisma.category.upsert({
    where: { slug: 'collections' },
    update: {},
    create: { name: 'Collections', slug: 'collections', depth: 0 },
  });

  // Subcategories
  const subcategoriesData = [
    // Men Shirts & Tops
    { name: 'Formal Shirts', slug: 'formal-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Casual Shirts', slug: 'casual-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Linen Shirts', slug: 'linen-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Oxford Shirts', slug: 'oxford-shirts', depth: 1, parentId: menRoot.id },
    { name: 'Polo Shirts', slug: 'polo-shirts', depth: 1, parentId: menRoot.id },
    { name: 'T-Shirts', slug: 't-shirts', depth: 1, parentId: menRoot.id },

    // Men Pants & Bottoms
    { name: 'Pants & Trousers', slug: 'pants', depth: 1, parentId: menRoot.id },
    { name: 'Trousers & Chinos', slug: 'trousers-chinos', depth: 1, parentId: menRoot.id },
    { name: 'Jeans & Denim', slug: 'jeans', depth: 1, parentId: menRoot.id },
    { name: 'Formal Slacks', slug: 'formal-slacks', depth: 1, parentId: menRoot.id },
    
    // Other Categories
    { name: 'Traditional Wear', slug: 'traditional-wear', depth: 1, parentId: menRoot.id },
    { name: 'Dresses', slug: 'dresses', depth: 1, parentId: womenRoot.id },
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
    categories[sub.slug] = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { name: sub.name, parentId: sub.parentId },
      create: sub,
    });
  }

  console.log(`Created categories hierarchy.`);

  // --- 3. Fashion Brands ---
  const brandsData = [
    { name: 'Urban Thread', slug: 'urban-thread' },
    { name: 'Classic Fit', slug: 'classic-fit' },
    { name: 'StyleCraft', slug: 'stylecraft' },
    { name: 'Modern Wear', slug: 'modern-wear' },
    { name: 'Prime Apparel', slug: 'prime-apparel' },
    { name: 'Royal Weave', slug: 'royal-weave' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  console.log(`Created brands.`);

  // --- 4. 34 Custom Shirts Catalog ---
  const shirtTitles = [
    'Classic Crisp White Formal Dress Shirt',
    'Sky Blue Royal Oxford Button-Down Shirt',
    'Textured Navy Houndstooth Formal Shirt',
    'Olive Poplin Slim Fit Casual Shirt',
    'Striped Seersucker Summer Linen Shirt',
    'Textured Cream Waffle Resort Shirt',
    'Burgundy Tailored Herringbone Dress Shirt',
    'Charcoal Melange Modern Business Shirt',
    'Slate Grey Cotton Stretch Oxford Shirt',
    'Indigo Chambray Workwear Casual Shirt',
    'Sage Green Breathable Linen Vacation Shirt',
    'Dusty Pink Smart Casual Poplin Shirt',
    'Micro-Check French Cuff Formal Shirt',
    'Classic Navy Blue Pinpoint Oxford Shirt',
    'Beige Earth-Tone Relaxed Linen Shirt',
    'Emerald Green Fine Twill Party Shirt',
    'Mocha Brown Brushed Flannel Shirt',
    'Pure White Mandarin Collar Casual Shirt',
    'Steel Blue Textured Dobby Dress Shirt',
    'Lavender Spread Collar Executive Shirt',
    'Midnight Black Stretch Poplin Shirt',
    'Caramel Brown Corduroy Overshirt',
    'Teal Green Breathable Camp Collar Shirt',
    'Ice Blue Vertical Stripe Slim Shirt',
    'Graphite Grey Lightweight Linen Shirt',
    'Blush Peach Premium Egyptian Cotton Shirt',
    'Forest Green Yarn-Dyed Casual Shirt',
    'Denim Blue Enzyme Washed Resort Shirt',
    'Stone White Structured Pique Shirt',
    'Crimson Red Checked Weekend Shirt',
    'Mint Green Pastel Linen Casual Shirt',
    'Dark Sapphire Satin Finished Evening Shirt',
    'Sand Dune Safari Pocket Utility Shirt',
    'Royal Navy Blue Luxury Weave Dress Shirt'
  ];

  // --- 5. 22 Custom Pants Catalog ---
  const pantTitles = [
    'Tailored Slim-Fit Charcoal Dress Trousers',
    'Classic Navy Blue Pleated Formal Slacks',
    'Khaki Beige Stretch Cotton Chino Pants',
    'Slate Grey Straight-Leg Business Trousers',
    'Olive Green Utility Cargo Pants',
    'Midnight Black Formal Suit Trousers',
    'Sand Dune Linen-Blend Summer Pants',
    'Dark Indigo Comfort Stretch Denim Jeans',
    'Espresso Brown Tailored Wool-Blend Slacks',
    'Stone Cream Relaxed Fit Casual Chinos',
    'Taupe Textured Formal Office Trousers',
    'Sage Green Ankle-Length Smart Pants',
    'Ash Grey Slim Tailored Chino Trousers',
    'Deep Navy Flat-Front Executive Slacks',
    'Caramel Brown Classic Corduroy Pants',
    'Light Blue Washed Slim Denim Jeans',
    'Muted Camel Straight Cut Chino Pants',
    'Charcoal Textured Woolen Winter Trousers',
    'Forest Green Elastic-Waist Resort Trousers',
    'Pure White Summer Linen Dress Pants',
    'Graphite Black Modern Cargo Chino Pants',
    'Royal Blue Tailored Formal Dress Pants'
  ];

  const brandKeys = ['urban-thread', 'classic-fit', 'stylecraft', 'modern-wear', 'prime-apparel', 'royal-weave'];

  // Seed 34 Shirts
  for (let i = 1; i <= 34; i++) {
    const title = shirtTitles[i - 1];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = Math.floor(Math.random() * (3650 - 2250 + 1)) + 2250;
    const brandSlug = brandKeys[(i - 1) % brandKeys.length];
    
    // Choose appropriate shirt category
    let catSlug = 'formal-shirts';
    if (title.includes('Linen')) catSlug = 'linen-shirts';
    else if (title.includes('Oxford')) catSlug = 'oxford-shirts';
    else if (title.includes('Casual') || title.includes('Resort') || title.includes('Overshirt') || title.includes('Weekend')) catSlug = 'casual-shirts';

    const product = await prisma.product.create({
      data: {
        title,
        slug: `${slug}-${i}`,
        description: `Experience exceptional tailoring with the ${title}. Crafted from premium breathable fabrics with reinforced stitching, precise collar styling, and a modern tailored fit designed for all-day comfort and effortless sophistication.`,
        basePrice: price,
        status: ProductStatus.approved,
        categoryId: categories[catSlug]?.id || categories['formal-shirts'].id,
        brandId: brands[brandSlug]?.id,
        images: {
          create: [
            {
              url: `/products/shirts/shirt-${i}.jpeg`,
              sortOrder: 0,
            }
          ]
        },
        variants: {
          create: [
            {
              sku: `SHIRT-${i}-S`,
              attributes: { size: 'S', fit: 'Tailored Fit' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 25,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `SHIRT-${i}-M`,
              attributes: { size: 'M', fit: 'Tailored Fit' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 40,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `SHIRT-${i}-L`,
              attributes: { size: 'L', fit: 'Tailored Fit' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 35,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `SHIRT-${i}-XL`,
              attributes: { size: 'XL', fit: 'Tailored Fit' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 20,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            }
          ]
        }
      }
    });

    console.log(`Created Shirt #${i}: ${product.title}`);
  }

  // Seed 22 Pants
  for (let j = 1; j <= 22; j++) {
    const title = pantTitles[j - 1];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = Math.floor(Math.random() * (4250 - 2750 + 1)) + 2750;
    const brandSlug = brandKeys[(j + 2) % brandKeys.length];

    // Choose appropriate pants category
    let catSlug = 'pants';
    if (title.includes('Jeans') || title.includes('Denim')) catSlug = 'jeans';
    else if (title.includes('Chino')) catSlug = 'trousers-chinos';
    else if (title.includes('Formal') || title.includes('Slacks')) catSlug = 'formal-slacks';

    const product = await prisma.product.create({
      data: {
        title,
        slug: `${slug}-${j}`,
        description: `Premium craftsmanship meets modern comfort in the ${title}. Tailored with high-grade stretch fabrics, structured waistbands, and clean tapered lines for everyday versatility and formal refinement.`,
        basePrice: price,
        status: ProductStatus.approved,
        categoryId: categories[catSlug]?.id || categories['pants'].id,
        brandId: brands[brandSlug]?.id,
        images: {
          create: [
            {
              url: `/products/pants/pant-${j}.jpeg`,
              sortOrder: 0,
            }
          ]
        },
        variants: {
          create: [
            {
              sku: `PANT-${j}-30`,
              attributes: { waist: '30', length: '32' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 20,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `PANT-${j}-32`,
              attributes: { waist: '32', length: '32' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 35,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `PANT-${j}-34`,
              attributes: { waist: '34', length: '32' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 30,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            },
            {
              sku: `PANT-${j}-36`,
              attributes: { waist: '36', length: '32' },
              priceModifier: 0,
              inventory: {
                create: {
                  quantity: 15,
                  reservedQuantity: 0,
                  lowStockThreshold: 5,
                }
              }
            }
          ]
        }
      }
    });

    console.log(`Created Pants #${j}: ${product.title}`);
  }

  console.log('Successfully seeded 56 products (34 Shirts & 22 Pants) with inventory and variants!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
