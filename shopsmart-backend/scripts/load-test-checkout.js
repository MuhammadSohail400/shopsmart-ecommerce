/**
 * Concurrency load test for the checkout critical path (Phase 8, per the
 * SRS's NFR-009 requirement and DDD Section 14.4: two concurrent checkouts
 * for the last unit of a SKU must not both succeed).
 *
 * This fires N concurrent requests at a real, running instance of the API
 * (docker compose up, or `npm run dev`) — it does NOT run against mocks,
 * unlike the Vitest suite. You need:
 *   1. The API running and reachable (default: http://localhost:4000)
 *   2. A product variant seeded with a KNOWN LOW STOCK COUNT (e.g. quantity: 1)
 *   3. A valid access token for a registered user with an address on file
 *
 * Usage:
 *   API_BASE_URL=http://localhost:4000/api/v1 \
 *   ACCESS_TOKEN=<jwt> \
 *   VARIANT_ID=<uuid> \
 *   ADDRESS_ID=<uuid> \
 *   CONCURRENCY=10 \
 *   node scripts/load-test-checkout.js
 *
 * Expected result: with N concurrent requests against a SKU with quantity=1,
 * exactly 1 checkout should succeed (201) and the rest should fail cleanly
 * with 409 CONFLICT (OUT_OF_STOCK / STOCK_CONFLICT) — never a 500, and never
 * more than 1 success. That's the pass/fail signal this script checks for.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const VARIANT_ID = process.env.VARIANT_ID;
const ADDRESS_ID = process.env.ADDRESS_ID;
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);

if (!ACCESS_TOKEN || !VARIANT_ID || !ADDRESS_ID) {
  console.error('Missing required env vars: ACCESS_TOKEN, VARIANT_ID, ADDRESS_ID');
  process.exit(1);
}

async function authedFetch(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      ...options.headers,
    },
  });
}

async function attemptCheckout(attemptNumber) {
  // Each concurrent "buyer" adds 1 unit to their own cart and checks out.
  // NOTE: since Cart is per-user (not per-request), running this with a
  // single ACCESS_TOKEN simulates N concurrent requests from the SAME
  // account's cart — sufficient to exercise the inventory race, though a
  // more realistic multi-buyer test would use N distinct user tokens.
  const addRes = await authedFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productVariantId: VARIANT_ID, quantity: 1 }),
  });
  if (!addRes.ok) return { attemptNumber, stage: 'add-to-cart', status: addRes.status };

  const sessionRes = await authedFetch('/checkout/sessions', {
    method: 'POST',
    body: JSON.stringify({ addressId: ADDRESS_ID, shippingMethod: 'standard' }),
  });
  if (!sessionRes.ok) {
    const body = await sessionRes.json().catch(() => ({}));
    return { attemptNumber, stage: 'create-session', status: sessionRes.status, code: body?.error?.code };
  }
  const session = await sessionRes.json();

  const confirmRes = await authedFetch(`/checkout/sessions/${session.data.sessionId}/confirm`, {
    method: 'POST',
    headers: { 'Idempotency-Key': `load-test-${attemptNumber}-${Date.now()}` },
    body: JSON.stringify({ paymentMethod: 'cod' }),
  });
  const body = await confirmRes.json().catch(() => ({}));
  return { attemptNumber, stage: 'confirm', status: confirmRes.status, code: body?.error?.code };
}

async function main() {
  console.log(`Firing ${CONCURRENCY} concurrent checkout attempts for variant ${VARIANT_ID}...`);

  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => attemptCheckout(i)),
  );

  const successes = results.filter((r) => r.status === 201);
  const conflicts = results.filter((r) => r.status === 409);
  const unexpected = results.filter((r) => r.status !== 201 && r.status !== 409);

  console.log('\n--- Results ---');
  results.forEach((r) => console.log(JSON.stringify(r)));

  console.log('\n--- Summary ---');
  console.log(`Successes (201): ${successes.length}`);
  console.log(`Clean conflicts (409): ${conflicts.length}`);
  console.log(`Unexpected (5xx / other): ${unexpected.length}`);

  if (unexpected.length > 0) {
    console.error('\n❌ FAIL: unexpected status codes — check server logs for a real error');
    process.exit(1);
  }
  if (successes.length > 1) {
    console.error(`\n❌ FAIL: overselling occurred — ${successes.length} orders succeeded for a stock level that should only allow 1`);
    process.exit(1);
  }
  if (successes.length === 0) {
    console.error('\n⚠️  WARNING: zero successes — check that the variant actually had stock to begin with');
    process.exit(1);
  }

  console.log('\n✅ PASS: exactly one checkout succeeded, the rest failed cleanly with 409');
}

main().catch((err) => {
  console.error('Load test crashed:', err);
  process.exit(1);
});
