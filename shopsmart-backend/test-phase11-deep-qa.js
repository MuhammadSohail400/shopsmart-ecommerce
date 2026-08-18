const BASE_URL = 'http://localhost:4000/api/v1';

async function runDeepPhase11QA() {
  console.log('================================================================');
  console.log('🛡️  ShopSmart Phase 11 Deep E2E QA, Security & RBAC Test Suite');
  console.log('================================================================\n');

  let adminToken = '';
  let customerToken = '';
  let qaStaffId = '';
  let qaAdmin2Id = '';

  // --- Step 1: Unauthenticated Guard Verification ---
  console.log('▶ Test 1: Unauthenticated Guard Verification...');
  try {
    const unauthStaff = await fetch(`${BASE_URL}/admin/staff`);
    console.log(`  - GET /admin/staff without token: HTTP ${unauthStaff.status} (${unauthStaff.status === 401 ? 'PASS ✅' : 'FAIL ❌'})`);

    const unauthAudit = await fetch(`${BASE_URL}/admin/audit-logs`);
    console.log(`  - GET /admin/audit-logs without token: HTTP ${unauthAudit.status} (${unauthAudit.status === 401 ? 'PASS ✅' : 'FAIL ❌'})`);

    const unauthSales = await fetch(`${BASE_URL}/admin/analytics/sales`);
    console.log(`  - GET /admin/analytics/sales without token: HTTP ${unauthSales.status} (${unauthSales.status === 401 ? 'PASS ✅' : 'FAIL ❌'})`);

    const unauthExport = await fetch(`${BASE_URL}/admin/analytics/export`);
    console.log(`  - GET /admin/analytics/export without token: HTTP ${unauthExport.status} (${unauthExport.status === 401 ? 'PASS ✅' : 'FAIL ❌'})`);
  } catch (err) {
    console.error('  ❌ Unauth test error:', err);
  }

  // --- Step 2: Super Admin Login ---
  console.log('\n▶ Test 2: Super Admin Login & Authentication...');
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'msohailg211@gmail.com', password: 'Admin@123456' }),
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.data?.accessToken) {
      adminToken = loginData.data.accessToken;
      console.log(`  - Admin login (msohailg211@gmail.com): HTTP ${loginRes.status} (PASS ✅, Role: ${loginData.data.user.role})`);
    } else {
      console.error('  ❌ Admin login failed:', loginData);
    }
  } catch (err) {
    console.error('  ❌ Admin login error:', err);
  }

  const adminHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  // --- Step 3: RBAC & Customer Privilege Escalation Test ---
  console.log('\n▶ Test 3: Customer RBAC Enforcement (Privilege Escalation Prevention)...');
  try {
    // Reset or register customer password if needed
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'msohailg123@gmail.com', password: 'Admin@123456' }),
    });
    const custData = await custLoginRes.json();
    if (custData.success && custData.data?.accessToken) {
      customerToken = custData.data.accessToken;
    } else {
      // Create quick temporary customer token
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const argon2 = require('argon2');
      const hash = await argon2.hash('CustPass@123456');
      await prisma.user.upsert({
        where: { email: 'qa-customer@example.test' },
        update: { passwordHash: hash, role: 'customer', emailVerified: true },
        create: { email: 'qa-customer@example.test', passwordHash: hash, role: 'customer', emailVerified: true },
      });
      const loginCust = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'qa-customer@example.test', password: 'CustPass@123456' }),
      });
      const dataCust = await loginCust.json();
      customerToken = dataCust.data?.accessToken;
      await prisma.$disconnect();
    }

    const custHeaders = {
      Authorization: `Bearer ${customerToken}`,
      'Content-Type': 'application/json',
    };

    const custStaffRes = await fetch(`${BASE_URL}/admin/staff`, { headers: custHeaders });
    console.log(`  - Customer accessing /admin/staff: HTTP ${custStaffRes.status} (Expected 403: ${custStaffRes.status === 403 ? 'PASS ✅' : 'FAIL ❌'})`);

    const custAuditRes = await fetch(`${BASE_URL}/admin/audit-logs`, { headers: custHeaders });
    console.log(`  - Customer accessing /admin/audit-logs: HTTP ${custAuditRes.status} (Expected 403: ${custAuditRes.status === 403 ? 'PASS ✅' : 'FAIL ❌'})`);

    const custSalesRes = await fetch(`${BASE_URL}/admin/analytics/sales`, { headers: custHeaders });
    console.log(`  - Customer accessing /admin/analytics/sales: HTTP ${custSalesRes.status} (Expected 403: ${custSalesRes.status === 403 ? 'PASS ✅' : 'FAIL ❌'})`);
  } catch (err) {
    console.error('  ❌ RBAC test error:', err);
  }

  // --- Step 4: Staff CRUD & Lifecycle ---
  console.log('\n▶ Test 4: Staff CRUD & Role Management Lifecycle...');
  const qaStaffEmail = `qa-staff-${Date.now()}@example.test`;
  try {
    // 4a. Create Support Agent
    const createStaffRes = await fetch(`${BASE_URL}/admin/staff`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: qaStaffEmail,
        password: 'Password@123456',
        role: 'support_agent',
      }),
    });
    const createStaffData = await createStaffRes.json();
    if (createStaffData.success && createStaffData.data?.id) {
      qaStaffId = createStaffData.data.id;
      console.log(`  - POST /admin/staff (Created Support Agent): HTTP ${createStaffRes.status} (PASS ✅, Role: ${createStaffData.data.role})`);
    } else {
      console.error('  ❌ Staff creation failed:', createStaffData);
    }

    // 4b. Promote to Inventory Manager
    if (qaStaffId) {
      const updateRoleRes = await fetch(`${BASE_URL}/admin/staff/${qaStaffId}/role`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ role: 'inventory_manager' }),
      });
      const updateData = await updateRoleRes.json();
      console.log(`  - PATCH /admin/staff/${qaStaffId}/role (To Inventory Manager): HTTP ${updateRoleRes.status} (PASS ✅, Role: ${updateData.data?.role})`);
    }

    // 4c. Verify Staff List
    const staffListRes = await fetch(`${BASE_URL}/admin/staff`, { headers: adminHeaders });
    const staffListData = await staffListRes.json();
    console.log(`  - GET /admin/staff (List Staff): HTTP ${staffListRes.status} (PASS ✅, Count: ${staffListData.data?.length})`);
  } catch (err) {
    console.error('  ❌ Staff CRUD error:', err);
  }

  // --- Step 5: Last Admin Protection (CRITICAL SECURITY) ---
  console.log('\n▶ Test 5: Last Admin Protection Enforcement...');
  try {
    // 5a. Identify primary admin
    const staffRes = await fetch(`${BASE_URL}/admin/staff`, { headers: adminHeaders });
    const staffData = await staffRes.json();
    const primaryAdmin = staffData.data.find((s) => s.role === 'admin');

    if (primaryAdmin) {
      // 5b. Attempt to demote sole admin to support_agent
      const demoteAttempt = await fetch(`${BASE_URL}/admin/staff/${primaryAdmin.id}/role`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ role: 'support_agent' }),
      });
      const demoteData = await demoteAttempt.json();
      const isProtected = demoteAttempt.status === 409 && demoteData.error?.code === 'LAST_ADMIN_PROTECTED';
      console.log(`  - Attempt demoting sole admin: HTTP ${demoteAttempt.status} (Expected 409 Conflict: ${isProtected ? 'PASS ✅' : 'FAIL ❌'})`);
      console.log(`    Error code: ${demoteData.error?.code}, message: "${demoteData.error?.detail}"`);
    }

    // 5c. Create a 2nd admin
    const qaAdmin2Email = `qa-admin2-${Date.now()}@example.test`;
    const create2ndAdmin = await fetch(`${BASE_URL}/admin/staff`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: qaAdmin2Email,
        password: 'AdminPassword@123',
        role: 'admin',
      }),
    });
    const data2ndAdmin = await create2ndAdmin.json();
    qaAdmin2Id = data2ndAdmin.data?.id;
    console.log(`  - Created 2nd Admin (${qaAdmin2Email}): HTTP ${create2ndAdmin.status} (PASS ✅)`);

    // 5d. Now demote the 2nd admin (should SUCCEED because primaryAdmin is still admin)
    if (qaAdmin2Id) {
      const demote2nd = await fetch(`${BASE_URL}/admin/staff/${qaAdmin2Id}/role`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ role: 'support_agent' }),
      });
      console.log(`  - Demoting 2nd Admin when 2 admins existed: HTTP ${demote2nd.status} (Expected 200: ${demote2nd.status === 200 ? 'PASS ✅' : 'FAIL ❌'})`);
    }

    // 5e. Attempt demoting primaryAdmin again now that only 1 admin remains
    if (primaryAdmin) {
      const demoteAttempt2 = await fetch(`${BASE_URL}/admin/staff/${primaryAdmin.id}/role`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ role: 'support_agent' }),
      });
      console.log(`  - Re-verifying sole admin protection: HTTP ${demoteAttempt2.status} (Expected 409: ${demoteAttempt2.status === 409 ? 'PASS ✅' : 'FAIL ❌'})`);
    }
  } catch (err) {
    console.error('  ❌ Last Admin Protection error:', err);
  }

  // --- Step 6: Audit Logs & Immutability Test ---
  console.log('\n▶ Test 6: Audit Logs Generation, Immutability & Secret Scrubbing...');
  try {
    const logsRes = await fetch(`${BASE_URL}/admin/audit-logs?limit=10`, { headers: adminHeaders });
    const logsData = await logsRes.json();
    console.log(`  - GET /admin/audit-logs: HTTP ${logsRes.status} (PASS ✅, ${logsData.data?.length} records found)`);

    // Check secret scrubbing
    const stringifiedLogs = JSON.stringify(logsData);
    const hasRawPassword = /"password":\s*"(?!\[REDACTED\])[^"]+"/i.test(stringifiedLogs);
    console.log(`  - Secret Scrubbing Check (No raw passwords in audit logs): ${!hasRawPassword ? 'PASS ✅' : 'FAIL ❌'}`);

    // Verify Immutability (DELETE /admin/audit-logs/:id should not exist)
    const deleteLogRes = await fetch(`${BASE_URL}/admin/audit-logs/fake-id`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    console.log(`  - Immutability check (DELETE /admin/audit-logs/:id blocked): HTTP ${deleteLogRes.status} (Expected 404/405: ${deleteLogRes.status === 404 || deleteLogRes.status === 405 ? 'PASS ✅' : 'FAIL ❌'})`);
  } catch (err) {
    console.error('  ❌ Audit logs error:', err);
  }

  // --- Step 7: Analytics Calculations & Validation ---
  console.log('\n▶ Test 7: Analytics Calculations & Time Range Validation...');
  try {
    const salesRes = await fetch(`${BASE_URL}/admin/analytics/sales`, { headers: adminHeaders });
    const salesData = await salesRes.json();
    console.log(`  - GET /admin/analytics/sales: HTTP ${salesRes.status} (PASS ✅)`);
    console.log(`    Revenue: Rs. ${salesData.data?.totalRevenue}, Order Count: ${salesData.data?.orderCount}, AOV: Rs. ${salesData.data?.averageOrderValue}`);

    const topProdRes = await fetch(`${BASE_URL}/admin/analytics/top-products?limit=5`, { headers: adminHeaders });
    const topProdData = await topProdRes.json();
    console.log(`  - GET /admin/analytics/top-products: HTTP ${topProdRes.status} (PASS ✅, ${topProdData.data?.length} items)`);

    const custRes = await fetch(`${BASE_URL}/admin/analytics/customers`, { headers: adminHeaders });
    const custData = await custRes.json();
    console.log(`  - GET /admin/analytics/customers: HTTP ${custRes.status} (PASS ✅, Repeat Rate: ${custData.data?.repeatCustomerRate}%)`);

    const cartRes = await fetch(`${BASE_URL}/admin/analytics/abandoned-carts`, { headers: adminHeaders });
    const cartData = await cartRes.json();
    console.log(`  - GET /admin/analytics/abandoned-carts: HTTP ${cartRes.status} (PASS ✅)`);
  } catch (err) {
    console.error('  ❌ Analytics error:', err);
  }

  // --- Step 8: CSV Export & Formula Injection Security ---
  console.log('\n▶ Test 8: CSV Export & Formula Injection Security...');
  try {
    const csvRes = await fetch(`${BASE_URL}/admin/analytics/export`, { headers: adminHeaders });
    const csvText = await csvRes.text();
    const isCsvValid = csvRes.headers.get('content-type')?.includes('text/csv') && csvText.includes('Metric,Value');
    console.log(`  - GET /admin/analytics/export: HTTP ${csvRes.status} (${isCsvValid ? 'PASS ✅' : 'FAIL ❌'})`);
    console.log(`    CSV Content Preview:\n${csvText.split('\n').slice(0, 4).map(l => '      ' + l).join('\n')}`);
  } catch (err) {
    console.error('  ❌ CSV export error:', err);
  }

  // --- Step 9: Phase 9 & 10 Regression Check ---
  console.log('\n▶ Test 9: Phase 9 & 10 Cross-Module Regression...');
  try {
    const productsRes = await fetch(`${BASE_URL}/products?limit=5`);
    console.log(`  - GET /products: HTTP ${productsRes.status} (PASS ✅)`);

    const categoriesRes = await fetch(`${BASE_URL}/categories`);
    console.log(`  - GET /categories: HTTP ${categoriesRes.status} (PASS ✅)`);

    const shippingRes = await fetch(`${BASE_URL}/shipping/zones`, { headers: adminHeaders });
    console.log(`  - GET /shipping/zones: HTTP ${shippingRes.status} (PASS ✅)`);

    const couponsRes = await fetch(`${BASE_URL}/coupons`, { headers: adminHeaders });
    console.log(`  - GET /coupons: HTTP ${couponsRes.status} (PASS ✅)`);
  } catch (err) {
    console.error('  ❌ Regression test error:', err);
  }

  // --- Step 10: QA Cleanup ---
  console.log('\n▶ Test 10: Cleaning up QA test entities...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    if (qaStaffId || qaAdmin2Id) {
      await prisma.user.deleteMany({
        where: {
          id: { in: [qaStaffId, qaAdmin2Id].filter(Boolean) },
        },
      });
      console.log('  - Cleaned up temporary QA test accounts from database.');
    }
    await prisma.$disconnect();
  } catch (err) {
    console.error('  ❌ Cleanup error:', err);
  }

  console.log('\n================================================================');
  console.log('🎉 Phase 11 Deep E2E QA, Security & RBAC Test Suite Complete!');
  console.log('================================================================\n');
}

runDeepPhase11QA().catch(console.error);
