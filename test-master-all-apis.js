const BASE_URL = 'http://localhost:4000/api/v1';

async function runMasterTestSuite() {
  console.log('================================================================================');
  console.log('🌟 ASORA MASTER COMPREHENSIVE END-TO-END API SUITE');
  console.log('   Testing all endpoints across Storefront & Admin Panel');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${title} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // Tokens & State
  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let testProductVariantId = '';
  let testCategoryId = '';
  let testOrderId = '';

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. PUBLIC SETTINGS & STORE PROFILE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('▶ [MODULE 1: Platform & Public Settings]');
  try {
    const res = await fetch(`${BASE_URL}/admin/settings/public`);
    const json = await res.json();
    assert('GET /admin/settings/public returns 200', res.status === 200);
    assert('Public settings contains ASORA store name', json.data?.store_name === 'ASORA', `store_name: ${json.data?.store_name}`);
    assert('Public settings contains WhatsApp number', Boolean(json.data?.whatsapp_number), `whatsapp_number: ${json.data?.whatsapp_number}`);
  } catch (err) {
    assert('GET /admin/settings/public network error', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION & SESSIONS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 2: Identity & Authentication]');
  try {
    // Admin Login
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@shopsmart.com', password: 'Admin@123456' }),
    });
    const adminData = await adminLogin.json();
    assert('POST /auth/login (Admin)', adminLogin.status === 200 && adminData.data?.user?.role === 'admin');
    adminToken = adminData.data?.accessToken;

    // Customer Registration or Login
    const testEmail = `customer_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password@123', fullName: 'Test Customer' }),
    });
    const regData = await regRes.json();
    assert('POST /auth/register', regRes.status === 201 || regRes.status === 200);

    // Customer Login
    const custLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testEmail, password: 'Password@123' }),
    });
    const custData = await custLogin.json();
    assert('POST /auth/login (Customer)', custLogin.status === 200 && Boolean(custData.data?.accessToken));
    customerToken = custData.data?.accessToken;

    // Get Current Profile
    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    assert('GET /users/me (Authenticated Customer)', meRes.status === 200 && meData.data?.email === testEmail);
  } catch (err) {
    assert('Auth Module Error', false, err.message);
  }

  const adminHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };
  const customerHeaders = {
    'Authorization': `Bearer ${customerToken}`,
    'Content-Type': 'application/json',
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. CATALOG (CATEGORIES, BRANDS, PRODUCTS)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 3: Product Catalog, Categories & Search]');
  try {
    // Categories
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    assert('GET /categories returns tree', catRes.status === 200 && Array.isArray(catData.data) && catData.data.length > 0, `Total categories: ${catData.data?.length}`);
    testCategoryId = catData.data?.[0]?.id;

    // Brands
    const brandRes = await fetch(`${BASE_URL}/brands`);
    const brandData = await brandRes.json();
    assert('GET /brands', brandRes.status === 200 && Array.isArray(brandData.data));

    // Products List
    const prodRes = await fetch(`${BASE_URL}/products?limit=24`);
    const prodData = await prodRes.json();
    const items = prodData.data?.items || prodData.data || [];
    assert('GET /products (Catalog pagination)', prodRes.status === 200 && items.length > 0, `Returned ${items.length} products`);
    if (items.length > 0) {
      testProductId = items[0].id;
      testProductVariantId = items[0].variants?.[0]?.id;
    }

    // Product Search
    const searchRes = await fetch(`${BASE_URL}/products?q=Heavyweight`);
    const searchData = await searchRes.json();
    const searchItems = searchData.data?.items || searchData.data || [];
    assert('GET /products?q=Heavyweight (Search query)', searchRes.status === 200 && searchItems.length > 0, `Found ${searchItems.length} matches`);

    // Product Detail
    if (testProductId) {
      const detailRes = await fetch(`${BASE_URL}/products/${testProductId}`);
      const detailData = await detailRes.json();
      assert('GET /products/:id (Product Detail)', detailRes.status === 200 && Boolean(detailData.data?.title), `Title: ${detailData.data?.title}`);
    }
  } catch (err) {
    assert('Catalog Module Error', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CART & WISHLIST
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 4: Shopping Cart & Wishlist]');
  try {
    // Add Item to Cart
    if (testProductVariantId) {
      const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({ productVariantId: testProductVariantId, quantity: 2 }),
      });
      assert('POST /cart/items (Add standard variant to cart)', addCartRes.status === 200 || addCartRes.status === 201);

      // Get Cart
      const cartRes = await fetch(`${BASE_URL}/cart`, { headers: customerHeaders });
      const cartData = await cartRes.json();
      assert('GET /cart (Retrieve active cart)', cartRes.status === 200 && cartData.data?.items?.length > 0, `Items in cart: ${cartData.data?.items?.length}`);
    }

    // Wishlist Add
    if (testProductId) {
      const addWishRes = await fetch(`${BASE_URL}/wishlist/items`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({ productId: testProductId }),
      });
      assert('POST /wishlist/items (Add to wishlist)', addWishRes.status === 200 || addWishRes.status === 201);

      const getWishRes = await fetch(`${BASE_URL}/wishlist`, { headers: customerHeaders });
      const wishData = await getWishRes.json();
      assert('GET /wishlist (Retrieve wishlist items)', getWishRes.status === 200 && Array.isArray(wishData.data?.items || wishData.data));
    }
  } catch (err) {
    assert('Cart/Wishlist Module Error', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. COUPONS & MARKETING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 5: Coupons & Marketing]');
  try {
    // Newsletter Subscription
    const newsRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `subscriber_${Date.now()}@asora.pk` }),
    });
    assert('POST /newsletter/subscribe', newsRes.status === 200 || newsRes.status === 201);

    // Contact Form Submission
    const contactRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sohail Customer',
        email: 'sohail@asora.pk',
        subject: 'Wholesale Inquiry',
        message: 'Hello, I want to order 50 pieces for our streetwear exhibition.',
      }),
    });
    assert('POST /contact (Customer Inquiries)', contactRes.status === 200 || contactRes.status === 201);
  } catch (err) {
    assert('Marketing/Contact Module Error', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. CHECKOUT & ORDERS (COD FLOW)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 6: Checkout Sessions & Order Creation]');
  try {
    // Create Checkout Session
    const sessionRes = await fetch(`${BASE_URL}/checkout/sessions`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        guestAddress: {
          fullName: 'Muhammad Sohail',
          phone: '03110297772',
          line1: 'House 12, Street 4, Block 5',
          city: 'Karachi',
          region: 'Sindh',
          country: 'PK',
          postalCode: '75000',
        },
        shippingMethod: 'standard',
      }),
    });
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.data?.sessionId || sessionData.data?.id;
    assert('POST /checkout/sessions (Initialize checkout session)', (sessionRes.status === 200 || sessionRes.status === 201) && Boolean(sessionId), `Session ID: ${sessionId}`);

    if (sessionId) {
      // Confirm Checkout Session (Produces Order)
      const confirmRes = await fetch(`${BASE_URL}/checkout/sessions/${sessionId}/confirm`, {
        method: 'POST',
        headers: {
          ...customerHeaders,
          'Idempotency-Key': `idemp_${Date.now()}`,
        },
        body: JSON.stringify({
          paymentMethod: 'cod',
        }),
      });
      const confirmData = await confirmRes.json();
      testOrderId = confirmData.data?.order?.id || confirmData.data?.id;
      assert('POST /checkout/sessions/:id/confirm (Confirm COD Order)', (confirmRes.status === 200 || confirmRes.status === 201) && Boolean(testOrderId), `Order ID: ${testOrderId}`);

      // List Customer Orders
      const custOrdersRes = await fetch(`${BASE_URL}/orders`, { headers: customerHeaders });
      const custOrders = await custOrdersRes.json();
      assert('GET /orders (Customer order history)', custOrdersRes.status === 200 && Array.isArray(custOrders.data?.items || custOrders.data));
    }
  } catch (err) {
    assert('Checkout/Orders Module Error', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. ADMIN PANEL OPERATIONS & SYNC
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▶ [MODULE 7: Admin Panel Operations & Real-Time Sync]');
  try {
    // Admin Dashboard Summary
    const summaryRes = await fetch(`${BASE_URL}/admin/dashboard/summary`, { headers: adminHeaders });
    const summaryData = await summaryRes.json();
    assert('GET /admin/dashboard/summary (Admin KPIs & Revenue)', summaryRes.status === 200);

    // Admin Orders List
    const adminOrdersRes = await fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders });
    const adminOrdersData = await adminOrdersRes.json();
    assert('GET /admin/orders (Admin order management table)', adminOrdersRes.status === 200 && Array.isArray(adminOrdersData.data?.items || adminOrdersData.data));

    // Admin Status Update on Order (Transition to processing)
    if (testOrderId) {
      const updateStatusRes = await fetch(`${BASE_URL}/orders/${testOrderId}/status`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'processing' }),
      });
      assert('PATCH /orders/:id/status (Admin updates order status to Processing)', updateStatusRes.status === 200 || updateStatusRes.status === 204, `Status HTTP ${updateStatusRes.status}`);
    }

    // Admin Inventory Check
    const lowStockRes = await fetch(`${BASE_URL}/inventory/low-stock`, { headers: adminHeaders });
    assert('GET /inventory/low-stock (Admin inventory monitor)', lowStockRes.status === 200);

    // Admin Settings Update & Sync Check
    const updateSettingsRes = await fetch(`${BASE_URL}/admin/settings/bulk`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        store_name: 'ASORA',
        tagline: 'WEAR YOUR STORY.',
        whatsapp_number: '03110297772',
        support_phone: '03110297772',
        support_email: 'support@asora.pk',
        free_shipping_threshold: '2500',
      }),
    });
    assert('PATCH /admin/settings/bulk (Admin updates store parameters)', updateSettingsRes.status === 200);
  } catch (err) {
    assert('Admin Module Error', false, err.message);
  }

  console.log('\n================================================================================');
  console.log(`📊 MASTER TEST RESULTS:`);
  console.log(`   ✅ Passed Tests: ${passed}`);
  console.log(`   ❌ Failed Tests: ${failed}`);
  console.log(`   Total Tests:    ${passed + failed}`);
  console.log(`   Success Rate:   ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
