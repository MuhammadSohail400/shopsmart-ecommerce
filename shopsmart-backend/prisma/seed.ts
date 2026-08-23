import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ASORA Streetwear & Anime Catalog DB Seeding (24 Real Pieces)...');

  // --- 1. Clean up old records safely ---
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

  // --- 2. ASORA Core Categories ---
  const asoraCategories = [
    { name: 'Anime Collection', slug: 'anime-collection', depth: 0 },
    { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', depth: 0 },
    { name: 'Graphic Prints', slug: 'graphic-prints', depth: 0 },
    { name: 'Minimal Collection', slug: 'minimal-collection', depth: 0 },
    { name: 'New Drops', slug: 'new-drops', depth: 0 },
    { name: 'Custom T-Shirts', slug: 'custom-t-shirts', depth: 0 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of asoraCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  console.log('Created ASORA Categories.');

  // --- 3. ASORA Brand ---
  const asoraBrand = await prisma.brand.upsert({
    where: { slug: 'asora' },
    update: { name: 'ASORA' },
    create: { name: 'ASORA', slug: 'asora' },
  });

  // --- 4. 24 Authentic ASORA Products ---
  const products = [
    {
      title: 'Domain Expansion Heavyweight Tee',
      slug: 'domain-expansion-heavyweight-tee',
      categorySlug: 'anime-collection',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 1,
      tagline: 'Infinite Void Jujutsu Graphic Edition',
      description: 'Crafted from 240+ GSM ultra-heavyweight combed cotton with drop-shoulder silhouette and premium DTG anime artwork print. Breathable, durable, and engineered for contemporary streetwear aesthetics.',
    },
    {
      title: 'Shadow Monarch Oversized Tee',
      slug: 'shadow-monarch-oversized-tee',
      categorySlug: 'anime-collection',
      price: 2999,
      compareAtPrice: 3599,
      imageIndex: 2,
      tagline: 'Solo Leveling Arise Edition',
      description: 'Dark purple and crimson energy aesthetic printed on raw black heavyweight cotton. Features oversized boxy drape and ribbed reinforced crewneck collar.',
    },
    {
      title: 'Neo Tokyo Cyberpunk Graphic Tee',
      slug: 'neo-tokyo-cyberpunk-graphic-tee',
      categorySlug: 'graphic-prints',
      price: 2799,
      compareAtPrice: 3299,
      imageIndex: 3,
      tagline: 'Futuristic Mecha Streetwear',
      description: 'Futuristic Kanji typography paired with bold distressed cyberpunk graphics. 100% breathable organic cotton with silicone wash for soft hand-feel.',
    },
    {
      title: 'Gojo Satoru Limitless Oversized Tee',
      slug: 'gojo-satoru-limitless-oversized-tee',
      categorySlug: 'anime-collection',
      price: 3199,
      compareAtPrice: 3799,
      imageIndex: 4,
      tagline: 'The Honored One Limited Drop',
      description: 'Minimalist front chest print with expansive full-back Six Eyes illustration. High-definition screenprint on 240 GSM pre-shrunk cotton.',
    },
    {
      title: 'Flame Hashira Rengoku Tribute Tee',
      slug: 'flame-hashira-rengoku-tribute-tee',
      categorySlug: 'anime-collection',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 5,
      tagline: 'Set Your Heart Ablaze Edition',
      description: 'Fiery crimson and gold gradient Japanese typography. Designed with relaxed fit and double-stitched hem for ultimate longevity.',
    },
    {
      title: 'Berserk Brand of Sacrifice Tee',
      slug: 'berserk-brand-of-sacrifice-tee',
      categorySlug: 'graphic-prints',
      price: 2699,
      compareAtPrice: 3199,
      imageIndex: 6,
      tagline: 'Guts Dark Fantasy Streetwear',
      description: 'Vintage washed charcoal base with distressed crimson rune iconography. Heavyweight 260 GSM fabric built for authentic streetwear layering.',
    },
    {
      title: 'Survey Corps Wings of Freedom Tee',
      slug: 'survey-corps-wings-of-freedom-tee',
      categorySlug: 'anime-collection',
      price: 2799,
      compareAtPrice: 3399,
      imageIndex: 7,
      tagline: 'Attack on Titan Military Edition',
      description: 'Iconic shield badge print on army olive / dark grey cotton fabric. Designed with dropped shoulders and relaxed sleeve taper.',
    },
    {
      title: 'Naruto Sage Mode Heavyweight Tee',
      slug: 'naruto-sage-mode-heavyweight-tee',
      categorySlug: 'anime-collection',
      price: 2999,
      compareAtPrice: 3599,
      imageIndex: 8,
      tagline: 'Toad Sage Sensory Edition',
      description: 'Vibrant orange and vermillion character print on obsidian black combed cotton. Fade-resistant DTG ink with reinforced rib collar.',
    },
    {
      title: 'Akatsuki Red Cloud Minimal Tee',
      slug: 'akatsuki-red-cloud-minimal-tee',
      categorySlug: 'minimal-collection',
      price: 2599,
      compareAtPrice: 2999,
      imageIndex: 9,
      tagline: 'Rogue Ninja Minimalist Drop',
      description: 'Subtle high-density embroidered red cloud emblem on center chest with clean back typography. Clean, modern, understated anime style.',
    },
    {
      title: 'Chainsaw Devil Pochita Boxy Tee',
      slug: 'chainsaw-devil-pochita-boxy-tee',
      categorySlug: 'graphic-prints',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 10,
      tagline: 'Makima & Denji Urban Drop',
      description: 'Bold grunge pop-art character illustration with high-impact color contrast. Oversized streetwear cut for daily statement wear.',
    },
    {
      title: 'One Piece Gear 5 Sun God Nika Tee',
      slug: 'one-piece-gear-5-sun-god-nika-tee',
      categorySlug: 'anime-collection',
      price: 3299,
      compareAtPrice: 3899,
      imageIndex: 11,
      tagline: 'Warrior of Liberation Edition',
      description: 'Ethereal white-and-gold cloud silhouette print on deep pitch black 240+ GSM cotton. A must-have centerpiece piece for anime collectors.',
    },
    {
      title: 'Dragon Ball Ultra Instinct Goku Tee',
      slug: 'dragon-ball-ultra-instinct-goku-tee',
      categorySlug: 'new-drops',
      price: 2999,
      compareAtPrice: 3599,
      imageIndex: 12,
      tagline: 'Silver Aura Martial Arts Tee',
      description: 'Silver-foil accented anime illustration on premium bio-washed heavyweight cotton. Breathable, sweat-resistant, and extraordinarily durable.',
    },
    {
      title: 'Death Note Shinigami Ryuk Vintage Tee',
      slug: 'death-note-shinigami-ryuk-vintage-tee',
      categorySlug: 'graphic-prints',
      price: 2799,
      compareAtPrice: 3299,
      imageIndex: 13,
      tagline: 'Gothic Noir Anime Graphic',
      description: 'Vintage acid-washed charcoal cotton featuring full-size Ryuk gothic illustration. Soft vintage drape with contemporary streetwear fit.',
    },
    {
      title: 'Sukuna Malevolent Shrine Oversized Tee',
      slug: 'sukuna-malevolent-shrine-oversized-tee',
      categorySlug: 'anime-collection',
      price: 3199,
      compareAtPrice: 3799,
      imageIndex: 14,
      tagline: 'King of Curses Premium Drop',
      description: 'Detailed bone shrine graphic with blood-red Kanji calligraphy. High density ink on 240 GSM pre-shrunk cotton fabric.',
    },
    {
      title: 'Killua Zoldyck Godspeed Lightning Tee',
      slug: 'killua-zoldyck-godspeed-lightning-tee',
      categorySlug: 'anime-collection',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 15,
      tagline: 'Hunter x Hunter Aura Edition',
      description: 'Electric blue and ultraviolet lightning visual effects screenprinted with glow highlights. Boxy oversized silhouette with thick neckband.',
    },
    {
      title: 'Ghost in the Shell Cyber Minimal Tee',
      slug: 'ghost-in-the-shell-cyber-minimal-tee',
      categorySlug: 'minimal-collection',
      price: 2499,
      compareAtPrice: 2999,
      imageIndex: 16,
      tagline: 'Section 9 Technical Edition',
      description: 'Clean architectural cybernetic typography and Section 9 micro-graphics. Minimalist aesthetic tailored for stealthy urban fashion.',
    },
    {
      title: 'Evangelion Unit-01 Berserk State Tee',
      slug: 'evangelion-unit-01-berserk-state-tee',
      categorySlug: 'new-drops',
      price: 3099,
      compareAtPrice: 3699,
      imageIndex: 17,
      tagline: 'Neon Genesis Tokyo-3 Drop',
      description: 'Hyper-detailed mecha illustration in neon purple and luminous green. Printed on heavy 240 GSM organic cotton with relaxed drop sleeves.',
    },
    {
      title: 'Vagabond Miyamoto Musashi Ink Wash Tee',
      slug: 'vagabond-miyamoto-musashi-ink-wash-tee',
      categorySlug: 'oversized-t-shirts',
      price: 2999,
      compareAtPrice: 3599,
      imageIndex: 18,
      tagline: 'Traditional Sumi-e Brushwork',
      description: 'Traditional Japanese brushstroke samurai artwork. Organic natural cotton feel with subtle washed texture and relaxed streetwear drape.',
    },
    {
      title: 'Bleach Ichigo Hollow Mask Streetwear Tee',
      slug: 'bleach-ichigo-hollow-mask-streetwear-tee',
      categorySlug: 'anime-collection',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 19,
      tagline: 'Getsuga Tensho Bankai Edition',
      description: 'Split Hollow mask and Zanpakuto artwork with stark red-and-white accents against jet black cotton. Premium streetwear construction.',
    },
    {
      title: 'Tokyo Ghoul Kaneki Centipede Heavy Tee',
      slug: 'tokyo-ghoul-kaneki-centipede-heavy-tee',
      categorySlug: 'graphic-prints',
      price: 2799,
      compareAtPrice: 3399,
      imageIndex: 20,
      tagline: 'Anteiku 1000 Minus 7 Edition',
      description: 'Distressed monochrome manga panel collage with crimson eye highlight. Heavyweight 240 GSM cotton with ribbed collar and drop shoulders.',
    },
    {
      title: 'Vinland Saga Thorfinn Warrior Tee',
      slug: 'vinland-saga-thorfinn-warrior-tee',
      categorySlug: 'oversized-t-shirts',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 21,
      tagline: 'True Warrior Journey Drop',
      description: 'Earthy charcoal washed cotton with vintage dagger and Nordic rune accents. Built for rugged durability and timeless oversized fit.',
    },
    {
      title: 'Mob Psycho 100% Explosion Tee',
      slug: 'mob-psycho-100-explosion-tee',
      categorySlug: 'new-drops',
      price: 2899,
      compareAtPrice: 3499,
      imageIndex: 22,
      tagline: 'Esper Psychic Aura Edition',
      description: 'Vibrant rainbow chromatic aberration graphic capturing Mob’s full psychic surge. Soft hand-feel with heavy 240 GSM garment structure.',
    },
    {
      title: 'Spike Spiegel Cowboy Bebop Noir Tee',
      slug: 'spike-spiegel-cowboy-bebop-noir-tee',
      categorySlug: 'minimal-collection',
      price: 2699,
      compareAtPrice: 3199,
      imageIndex: 23,
      tagline: 'See You Space Cowboy Edition',
      description: 'Classic jazz-noir anime silhouette with subtle smoke trail and timeless catchphrase typography. Clean, sophisticated streetwear.',
    },
    {
      title: 'ASORA Signature Minimal Boxy Tee',
      slug: 'asora-signature-minimal-boxy-tee',
      categorySlug: 'oversized-t-shirts',
      price: 2499,
      compareAtPrice: 2999,
      imageIndex: 24,
      tagline: 'Core Brand Streetwear Essential',
      description: 'ASORA signature Japanese Kanji crest with crimson accent on pure black heavyweight combed cotton. The definitive staple for every streetwear wardrobe.',
    },
  ];

  console.log('Inserting 24 real ASORA products with variants and inventory...');

  for (const p of products) {
    const categoryId = categoryMap[p.categorySlug] || categoryMap['anime-collection'];

    const createdProduct = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: `${p.tagline} — ${p.description}`,
        basePrice: p.price,
        status: ProductStatus.approved,
        categoryId: categoryId,
        brandId: asoraBrand.id,
      },
    });

    // Add Primary Product Image
    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        url: `/products/shirts/shirt-${p.imageIndex}.jpeg`,
        sortOrder: 0,
      },
    });

    // Add S, M, L, XL Variants with 50 units in stock each
    const sizes = ['S', 'M', 'L', 'XL'];
    for (const size of sizes) {
      const sku = `ASORA-${p.slug.slice(0, 8).toUpperCase()}-${size}`;
      const variant = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: sku,
          priceModifier: 0,
          attributes: {
            size: size,
            color: 'Pitch Black',
            fit: 'Oversized Boxy Fit',
            fabric: '100% Combed Heavyweight Cotton (240+ GSM)',
          },
        },
      });

      await prisma.inventory.create({
        data: {
          productVariantId: variant.id,
          quantity: 50,
          reservedQuantity: 0,
          lowStockThreshold: 10,
        },
      });
    }
  }

  // --- 5. Seed Admin User & Platform Settings ---
  console.log('Seeding ASORA Admin User and Platform Settings...');
  // Password hash for Admin@123456
  const adminPasswordHash = '$2b$10$wEeV0q433sPZ3eH7i43Fm.s5WzN3q9eWvMfxvRz6Nvx/d1l1d9xSm'; // bcrypt hash of Admin@123456

  await prisma.user.upsert({
    where: { email: 'admin@shopsmart.com' },
    update: { role: 'admin', emailVerified: true },
    create: {
      email: 'admin@shopsmart.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@asora.pk' },
    update: { role: 'admin', emailVerified: true },
    create: {
      email: 'admin@asora.pk',
      passwordHash: adminPasswordHash,
      role: 'admin',
      emailVerified: true,
    },
  });

  // Seed Platform Settings
  const initialSettings = [
    { key: 'store_name', value: 'ASORA' },
    { key: 'tagline', value: 'WEAR YOUR STORY.' },
    { key: 'whatsapp_number', value: '03110297772' },
    { key: 'support_phone', value: '03110297772' },
    { key: 'support_email', value: 'support@asora.pk' },
    { key: 'free_shipping_threshold', value: '2500' },
    { key: 'currency', value: 'PKR' },
  ];

  for (const s of initialSettings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // --- 6. Seed Pakistan Shipping Zone & Rates ---
  console.log('Seeding Nationwide Pakistan Shipping Zone & Rates...');
  const existingZone = await prisma.shippingZone.findFirst({
    where: { countries: { has: 'PK' } },
    include: { rates: true },
  });

  if (!existingZone) {
    await prisma.shippingZone.create({
      data: {
        name: 'Pakistan Nationwide',
        countries: ['PK'],
        rates: {
          create: [
            { method: 'standard', cost: 200, etaDays: 3 },
            { method: 'express', cost: 350, etaDays: 1 },
          ],
        },
      },
    });
  }

  console.log('✅ Seeding complete: 24 authentic ASORA products, Admin users, Settings, and Shipping Zones seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
