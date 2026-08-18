import process from 'node:process';
import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ShopSmart Fashion DB Seeding (40+ Curated Fashion Shirts & Apparel)...');

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
    { name: 'Urban Vogue', slug: 'urban-vogue' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: b,
    });
  }
  console.log(`Created ${brandsData.length} fashion brands.`);

  // Verified, studio-quality, high-resolution fashion shirt image assets (Unsplash CDN direct)
  const img = {
    oxfordWhite: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    linenBeige: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    skyBlueCotton: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80',
    navyFormal: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    poloBlack: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80',
    whiteTee: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    corduroyOlive: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    blackTrousers: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    beigeChinos: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    denimJeans: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    blazerCharcoal: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    kurtaWhite: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    formalHoundstooth: 'https://images.unsplash.com/photo-1620012253295-c15c429fbb41?auto=format&fit=crop&w=800&q=80',
    stripedShirt: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    denimShirt: 'https://images.unsplash.com/photo-1588731234159-8b9963143fca?auto=format&fit=crop&w=800&q=80',
    poloRed: 'https://images.unsplash.com/photo-1622445268462-327fb738a0bc?auto=format&fit=crop&w=800&q=80',
    oxfordGreen: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
    flannelCheck: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=80',
    blackTee: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    bomberJacket: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    kurtaCharcoal: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
    linenSky: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    linenWhite: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    casualRust: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    dressFloral: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    blouseSatin: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80',
    trousersWomen: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    kidsPolo: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
    kidsDress: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    poloNavy: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80',
  };

  // --- 4. 45+ Curated Fashion Products with Pakistani Pricing ---
  const productsData = [
    // 1. Oxford Shirts
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
      images: [{ url: img.oxfordWhite, sortOrder: 0 }]
    },
    {
      title: 'Forest Green Oxford Button-Down Shirt',
      slug: 'forest-green-oxford-shirt',
      description: 'Rich forest green heavy oxford cloth with durable chalk buttons and curved hem. A versatile staple that softens with each wash.',
      basePrice: 2599.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-OXF-GRN-S', attributes: { Size: 'S', Color: 'Forest Green' }, priceModifier: 0, stock: 35 },
        { sku: 'UT-OXF-GRN-M', attributes: { Size: 'M', Color: 'Forest Green' }, priceModifier: 0, stock: 65 },
        { sku: 'UT-OXF-GRN-L', attributes: { Size: 'L', Color: 'Forest Green' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.oxfordGreen, sortOrder: 0 }]
    },
    {
      title: 'Pastel Pink Pinpoint Oxford Shirt',
      slug: 'pastel-pink-pinpoint-oxford-shirt',
      description: 'Subtle pastel pink pinpoint Oxford weave shirt with soft brushed handfeel. Ideal for summer smart-casual styling.',
      basePrice: 2499.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-OXF-PNK-S', attributes: { Size: 'S', Color: 'Pastel Pink' }, priceModifier: 0, stock: 30 },
        { sku: 'CF-OXF-PNK-M', attributes: { Size: 'M', Color: 'Pastel Pink' }, priceModifier: 0, stock: 60 },
        { sku: 'CF-OXF-PNK-L', attributes: { Size: 'L', Color: 'Pastel Pink' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.oxfordWhite, sortOrder: 0 }]
    },
    {
      title: 'Sky Blue Button-Down Oxford Shirt',
      slug: 'sky-blue-button-down-oxford-shirt',
      description: 'Traditional American ivy-style button down collar shirt made with 2-ply 80s yarn. Resilient, crisp, and comfortable.',
      basePrice: 2650.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-OXF-BLU-S', attributes: { Size: 'S', Color: 'Sky Blue' }, priceModifier: 0, stock: 40 },
        { sku: 'SC-OXF-BLU-M', attributes: { Size: 'M', Color: 'Sky Blue' }, priceModifier: 0, stock: 70 },
        { sku: 'SC-OXF-BLU-L', attributes: { Size: 'L', Color: 'Sky Blue' }, priceModifier: 0, stock: 55 },
      ],
      images: [{ url: img.skyBlueCotton, sortOrder: 0 }]
    },
    {
      title: 'Charcoal Grey Oxford Casual Shirt',
      slug: 'charcoal-grey-oxford-casual-shirt',
      description: 'Deep charcoal melange oxford weave with dark horn buttons and modern slim profile.',
      basePrice: 2499.0,
      categoryId: categories['oxford-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-OXF-CHR-M', attributes: { Size: 'M', Color: 'Charcoal' }, priceModifier: 0, stock: 50 },
        { sku: 'PA-OXF-CHR-L', attributes: { Size: 'L', Color: 'Charcoal' }, priceModifier: 0, stock: 40 },
      ],
      images: [{ url: img.oxfordGreen, sortOrder: 0 }]
    },

    // 2. Linen Shirts
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
      images: [{ url: img.linenBeige, sortOrder: 0 }]
    },
    {
      title: 'Crisp White Resort Linen Shirt',
      slug: 'crisp-white-resort-linen-shirt',
      description: 'Pure 100% natural linen with a relaxed revere Cuban collar and mother-of-pearl buttons. Ideal for beach resorts and summer evenings.',
      basePrice: 3750.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-LIN-WHT-S', attributes: { Size: 'S', Color: 'White' }, priceModifier: 0, stock: 40 },
        { sku: 'SC-LIN-WHT-M', attributes: { Size: 'M', Color: 'White' }, priceModifier: 0, stock: 65 },
        { sku: 'SC-LIN-WHT-L', attributes: { Size: 'L', Color: 'White' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.linenWhite, sortOrder: 0 }]
    },
    {
      title: 'Olive Washed Linen Casual Shirt',
      slug: 'olive-washed-linen-casual-shirt',
      description: 'Enzyme-washed pure linen shirt in an earthy olive hue. Pre-shrunk for maximum comfort and durability.',
      basePrice: 3650.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-LIN-OLV-M', attributes: { Size: 'M', Color: 'Olive' }, priceModifier: 0, stock: 45 },
        { sku: 'UT-LIN-OLV-L', attributes: { Size: 'L', Color: 'Olive' }, priceModifier: 0, stock: 40 },
      ],
      images: [{ url: img.linenBeige, sortOrder: 0 }]
    },
    {
      title: 'Sky Blue Pure Linen Shirt',
      slug: 'sky-blue-pure-linen-shirt',
      description: 'Cooling sky blue natural linen with regular fit and curved bottom hem. Breathable structure for all-day ventilation.',
      basePrice: 3450.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-LIN-SKY-S', attributes: { Size: 'S', Color: 'Sky Blue' }, priceModifier: 0, stock: 35 },
        { sku: 'CF-LIN-SKY-M', attributes: { Size: 'M', Color: 'Sky Blue' }, priceModifier: 0, stock: 55 },
        { sku: 'CF-LIN-SKY-L', attributes: { Size: 'L', Color: 'Sky Blue' }, priceModifier: 0, stock: 40 },
      ],
      images: [{ url: img.linenSky, sortOrder: 0 }]
    },
    {
      title: 'Vintage Striped Linen Resort Shirt',
      slug: 'vintage-striped-linen-resort-shirt',
      description: 'Retro vertical striped French linen shirt with relaxed revere collar. Ultralight and breathable for hot summer days.',
      basePrice: 3450.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-LIN-STP-M', attributes: { Size: 'M', Color: 'Navy/White' }, priceModifier: 0, stock: 40 },
        { sku: 'SC-LIN-STP-L', attributes: { Size: 'L', Color: 'Navy/White' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.stripedShirt, sortOrder: 0 }]
    },

    // 3. Casual Shirts
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
      images: [{ url: img.skyBlueCotton, sortOrder: 0 }]
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
      images: [{ url: img.corduroyOlive, sortOrder: 0 }]
    },
    {
      title: 'Classic Indigo Denim Western Shirt',
      slug: 'classic-indigo-denim-western-shirt',
      description: '100% rigid washed cotton denim shirt featuring pearl snap buttons, pointed front/back yokes, and twin flap chest pockets.',
      basePrice: 3250.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-DNM-WST-S', attributes: { Size: 'S', Color: 'Indigo' }, priceModifier: 0, stock: 35 },
        { sku: 'UT-DNM-WST-M', attributes: { Size: 'M', Color: 'Indigo' }, priceModifier: 0, stock: 75 },
        { sku: 'UT-DNM-WST-L', attributes: { Size: 'L', Color: 'Indigo' }, priceModifier: 0, stock: 60 },
      ],
      images: [{ url: img.denimShirt, sortOrder: 0 }]
    },
    {
      title: 'Monochrome Buffalo Check Flannel Shirt',
      slug: 'monochrome-check-flannel-shirt',
      description: 'Double-brushed heavyweight cotton flannel shirt with a classic black-and-grey check pattern. Warm, soft, and durable.',
      basePrice: 2999.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-FLN-CHK-M', attributes: { Size: 'M', Color: 'Black/Grey' }, priceModifier: 0, stock: 45 },
        { sku: 'CF-FLN-CHK-L', attributes: { Size: 'L', Color: 'Black/Grey' }, priceModifier: 0, stock: 55 },
      ],
      images: [{ url: img.flannelCheck, sortOrder: 0 }]
    },
    {
      title: 'Rust Corduroy Button-Up Overshirt',
      slug: 'rust-corduroy-overshirt',
      description: 'Warm rust-toned fine wale corduroy shirt with tortoise buttons. Perfect autumn and winter layering essential.',
      basePrice: 3850.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-CORD-RST-M', attributes: { Size: 'M', Color: 'Rust' }, priceModifier: 0, stock: 35 },
        { sku: 'PA-CORD-RST-L', attributes: { Size: 'L', Color: 'Rust' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.casualRust, sortOrder: 0 }]
    },
    {
      title: 'Khaki Military Utility Twill Shirt',
      slug: 'khaki-utility-twill-shirt',
      description: 'Durable structured cotton twill workshirt with dual utility chest pockets and reinforced shoulder seams.',
      basePrice: 2850.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-TWL-KHK-M', attributes: { Size: 'M', Color: 'Khaki' }, priceModifier: 0, stock: 40 },
        { sku: 'UT-TWL-KHK-L', attributes: { Size: 'L', Color: 'Khaki' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.corduroyOlive, sortOrder: 0 }]
    },

    // 4. Formal Shirts
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
      images: [{ url: img.navyFormal, sortOrder: 0 }]
    },
    {
      title: 'Charcoal Houndstooth Formal Shirt',
      slug: 'charcoal-houndstooth-formal-shirt',
      description: 'Micro-houndstooth woven luxury cotton shirt with spread collar and French front placket. Precision tailored for formal suits.',
      basePrice: 2850.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-FRM-HND-S', attributes: { Size: 'S', Color: 'Charcoal' }, priceModifier: 0, stock: 40 },
        { sku: 'PA-FRM-HND-M', attributes: { Size: 'M', Color: 'Charcoal' }, priceModifier: 0, stock: 60 },
        { sku: 'PA-FRM-HND-L', attributes: { Size: 'L', Color: 'Charcoal' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.formalHoundstooth, sortOrder: 0 }]
    },
    {
      title: 'Classic Bengal Stripe Formal Shirt',
      slug: 'classic-bengal-stripe-formal-shirt',
      description: 'Tailored blue-and-white Bengal stripe dress shirt with stiffened spread collar and French cuffs for cufflinks.',
      basePrice: 3150.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-FRM-STP-M', attributes: { Size: 'M', Color: 'Blue Stripe' }, priceModifier: 0, stock: 50 },
        { sku: 'CF-FRM-STP-L', attributes: { Size: 'L', Color: 'Blue Stripe' }, priceModifier: 0, stock: 40 },
      ],
      images: [{ url: img.stripedShirt, sortOrder: 0 }]
    },
    {
      title: 'Pearl White Royal Twill Dress Shirt',
      slug: 'pearl-white-royal-twill-dress-shirt',
      description: '100% two-ply Egyptian cotton royal twill shirt. Subtle satin sheen and structured semi-spread collar.',
      basePrice: 3450.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-TWL-WHT-S', attributes: { Size: 'S', Color: 'Pearl White' }, priceModifier: 0, stock: 40 },
        { sku: 'PA-TWL-WHT-M', attributes: { Size: 'M', Color: 'Pearl White' }, priceModifier: 0, stock: 70 },
        { sku: 'PA-TWL-WHT-L', attributes: { Size: 'L', Color: 'Pearl White' }, priceModifier: 0, stock: 55 },
      ],
      images: [{ url: img.oxfordWhite, sortOrder: 0 }]
    },

    // 5. Polo Shirts
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
      images: [{ url: img.poloBlack, sortOrder: 0 }]
    },
    {
      title: 'Crimson Heather Pique Polo Shirt',
      slug: 'crimson-heather-pique-polo-shirt',
      description: 'Soft combed cotton pique knit with tipping on the collar and cuffs. Tailored slim fit for effortless weekend style.',
      basePrice: 2150.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['modern-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MW-POL-RED-S', attributes: { Size: 'S', Color: 'Crimson' }, priceModifier: 0, stock: 30 },
        { sku: 'MW-POL-RED-M', attributes: { Size: 'M', Color: 'Crimson' }, priceModifier: 0, stock: 55 },
        { sku: 'MW-POL-RED-L', attributes: { Size: 'L', Color: 'Crimson' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.poloRed, sortOrder: 0 }]
    },
    {
      title: 'Navy Heather Performance Polo',
      slug: 'navy-heather-performance-polo',
      description: 'Moisture-wicking breathable cotton-poly blend pique polo shirt with 3-button placket.',
      basePrice: 1999.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['modern-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MW-POL-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 60 },
        { sku: 'MW-POL-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.poloNavy, sortOrder: 0 }]
    },
    {
      title: 'Forest Green Classic Polo',
      slug: 'forest-green-classic-polo',
      description: 'Rich dark green combed cotton pique polo with contrasting white collar tipping.',
      basePrice: 2150.0,
      categoryId: categories['polo-shirts'].id,
      brandId: brands['modern-wear'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'MW-POL-GRN-M', attributes: { Size: 'M', Color: 'Forest Green' }, priceModifier: 0, stock: 40 },
        { sku: 'MW-POL-GRN-L', attributes: { Size: 'L', Color: 'Forest Green' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.poloBlack, sortOrder: 0 }]
    },

    // 6. T-Shirts
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
      images: [{ url: img.whiteTee, sortOrder: 0 }]
    },
    {
      title: 'Pitch Black Heavyweight Boxy Tee',
      slug: 'pitch-black-heavyweight-tee',
      description: '100% 240 GSM organic ring-spun cotton tee with drop shoulders and structured relaxed silhouette.',
      basePrice: 1299.0,
      categoryId: categories['t-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-TEE-BLK-S', attributes: { Size: 'S', Color: 'Pitch Black' }, priceModifier: 0, stock: 80 },
        { sku: 'UT-TEE-BLK-M', attributes: { Size: 'M', Color: 'Pitch Black' }, priceModifier: 0, stock: 130 },
        { sku: 'UT-TEE-BLK-L', attributes: { Size: 'L', Color: 'Pitch Black' }, priceModifier: 0, stock: 95 },
      ],
      images: [{ url: img.blackTee, sortOrder: 0 }]
    },
    {
      title: 'Olive Mineral Wash Vintage Tee',
      slug: 'olive-mineral-wash-vintage-tee',
      description: 'Vintage mineral-washed cotton tee with soft distressed patina and comfortable crew neck.',
      basePrice: 1450.0,
      categoryId: categories['t-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-TEE-OLV-M', attributes: { Size: 'M', Color: 'Olive' }, priceModifier: 0, stock: 50 },
        { sku: 'UT-TEE-OLV-L', attributes: { Size: 'L', Color: 'Olive' }, priceModifier: 0, stock: 60 },
      ],
      images: [{ url: img.whiteTee, sortOrder: 0 }]
    },

    // 7. Pants, Chinos & Jeans
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
      images: [{ url: img.blackTrousers, sortOrder: 0 }]
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
      images: [{ url: img.beigeChinos, sortOrder: 0 }]
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
      images: [{ url: img.denimJeans, sortOrder: 0 }]
    },

    // 8. Outerwear & Traditional
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
      ],
      images: [{ url: img.blazerCharcoal, sortOrder: 0 }]
    },
    {
      title: 'Classic Navy Flight Bomber Jacket',
      slug: 'classic-navy-flight-bomber-jacket',
      description: 'Water-resistant matte nylon shell with ribbed collar, hem, and storm flap zipper. Lightweight all-season outerwear.',
      basePrice: 4850.0,
      categoryId: categories['jackets-outerwear'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-JCK-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 25 },
        { sku: 'UT-JCK-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 35 },
      ],
      images: [{ url: img.bomberJacket, sortOrder: 0 }]
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
      ],
      images: [{ url: img.kurtaWhite, sortOrder: 0 }]
    },
    {
      title: 'Charcoal Linen Traditional Kurta',
      slug: 'charcoal-linen-traditional-kurta',
      description: 'Pure washed linen festive kurta with metallic horn buttons and tailored modern fit.',
      basePrice: 3650.0,
      categoryId: categories['traditional-wear'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-KRT-CHR-M', attributes: { Size: 'M', Color: 'Charcoal' }, priceModifier: 0, stock: 30 },
        { sku: 'SC-KRT-CHR-L', attributes: { Size: 'L', Color: 'Charcoal' }, priceModifier: 0, stock: 40 },
      ],
      images: [{ url: img.kurtaCharcoal, sortOrder: 0 }]
    },

    // 9. Women's & Kids Fashion
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
      ],
      images: [{ url: img.dressFloral, sortOrder: 0 }]
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
      images: [{ url: img.blouseSatin, sortOrder: 0 }]
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
      images: [{ url: img.trousersWomen, sortOrder: 0 }]
    },
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
      images: [{ url: img.kidsPolo, sortOrder: 0 }]
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
      images: [{ url: img.kidsDress, sortOrder: 0 }]
    },
    {
      title: 'Navy Linen Mandarin Collar Shirt',
      slug: 'navy-linen-mandarin-collar-shirt',
      description: 'Sophisticated band collar shirt in French pure linen with concealed placket and barrel cuffs.',
      basePrice: 3550.0,
      categoryId: categories['linen-shirts'].id,
      brandId: brands['stylecraft'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'SC-LIN-NVY-M', attributes: { Size: 'M', Color: 'Navy' }, priceModifier: 0, stock: 40 },
        { sku: 'SC-LIN-NVY-L', attributes: { Size: 'L', Color: 'Navy' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.navyFormal, sortOrder: 0 }]
    },
    {
      title: 'Textured Cream Waffle Resort Shirt',
      slug: 'textured-cream-waffle-resort-shirt',
      description: 'Airy waffle-textured 100% cotton camp shirt with dropped shoulders and notched resort collar.',
      basePrice: 2750.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['urban-thread'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'UT-WFL-CRM-M', attributes: { Size: 'M', Color: 'Cream' }, priceModifier: 0, stock: 35 },
        { sku: 'UT-WFL-CRM-L', attributes: { Size: 'L', Color: 'Cream' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.linenBeige, sortOrder: 0 }]
    },
    {
      title: 'Striped Seersucker Summer Shirt',
      slug: 'striped-seersucker-summer-shirt',
      description: 'Puckered breathable cotton seersucker shirt that naturally holds fabric away from the skin for cooling comfort.',
      basePrice: 2950.0,
      categoryId: categories['casual-shirts'].id,
      brandId: brands['classic-fit'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'CF-SER-BLU-M', attributes: { Size: 'M', Color: 'Blue Stripe' }, priceModifier: 0, stock: 40 },
        { sku: 'CF-SER-BLU-L', attributes: { Size: 'L', Color: 'Blue Stripe' }, priceModifier: 0, stock: 45 },
      ],
      images: [{ url: img.stripedShirt, sortOrder: 0 }]
    },
    {
      title: 'Olive Poplin Slim Fit Dress Shirt',
      slug: 'olive-poplin-slim-fit-shirt',
      description: 'Lightweight high-thread count cotton poplin shirt with modern spread collar for work and evening wear.',
      basePrice: 2650.0,
      categoryId: categories['formal-shirts'].id,
      brandId: brands['prime-apparel'].id,
      status: ProductStatus.approved,
      variants: [
        { sku: 'PA-POP-OLV-M', attributes: { Size: 'M', Color: 'Olive' }, priceModifier: 0, stock: 35 },
        { sku: 'PA-POP-OLV-L', attributes: { Size: 'L', Color: 'Olive' }, priceModifier: 0, stock: 50 },
      ],
      images: [{ url: img.oxfordGreen, sortOrder: 0 }]
    },
  ];

  let totalVariants = 0;
  for (const item of productsData) {
    const { variants, images, ...pData } = item;
    await prisma.product.create({
      data: {
        ...pData,
        images: {
          create: images.map(imgItem => ({
            url: imgItem.url,
            sortOrder: imgItem.sortOrder,
          })),
        },
        variants: {
          create: variants.map(v => ({
            sku: v.sku,
            attributes: v.attributes,
            priceModifier: v.priceModifier,
            inventory: {
              create: {
                quantity: v.stock,
                reservedQuantity: 0,
              },
            },
          })),
        },
      },
    });
    totalVariants += variants.length;
  }

  console.log(`Created ${productsData.length} fashion products and ${totalVariants} variants/inventory records.`);

  // --- 5. Banners ---
  await prisma.banner.create({
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1600&q=80',
      linkUrl: '/products',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sortOrder: 0,
    },
  });

  await prisma.banner.create({
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
      linkUrl: '/products?category=sale',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sortOrder: 1,
    },
  });

  console.log(`Created 2 fashion CMS banners.`);
  console.log('Fashion DB Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
