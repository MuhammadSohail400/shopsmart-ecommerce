# ShopSmart AI — Phase 1–5 Review Report

**Scope:** Foundation → Identity & Access → Product Catalog → Cart/Wishlist/Coupons → **Checkout/Orders/Payments/Shipping**
**Reviewed against:** PRD v1.0 · SRS v1.0 · System Design Document v1.0 · Database Design Document v1.0 · API Design Specification v1.0 · Backend Standards v1.0
**Date:** July 29, 2026

---

## 1. Test results (executed, not simulated)

```
✓ tests/api/auth.api.test.ts (6 tests)
✓ tests/api/products.api.test.ts (6 tests)
✓ tests/api/orders.api.test.ts (6 tests)

Test Files  3 passed (3)
     Tests  18 passed (18)
```

Same limitation as Phase 1–4: Prisma's query engine binary can't be downloaded in this sandbox (`binaries.prisma.sh` blocked), so no live-database test is possible here. Everything below was run for real with the repository layer mocked (Backend Standards §17.1).

## 2. Two real bugs the test suite caught during Phase 5 (and fixed)

This is worth stating plainly, since it's the actual value of writing tests rather than just asserting the code is correct:

1. **Routing bug:** `paymentsRoutes` was originally mounted at `/` with its own `router.use(authMiddleware)`. Because Express middleware on a router mounted at `/` runs before route matching, this made *every unmatched URL* — not just payment endpoints — return `401` instead of `404`. Caught by the "unknown route → 404" test failing unexpectedly. **Fixed** by mounting payments routes under `/orders` with relative paths.
2. **Incomplete test mock:** the global `@prisma/client` mock only stubbed enums from Phases 1–4 (`Role`, `ProductStatus`, `DiscountType`). Phase 5's new enums (`OrderStatus`, `PaymentMethod`, etc.) were missing, causing `OrderStatus.confirmed` to throw inside the mocked test environment. **Fixed** by extending the mock. (This was a test-infrastructure gap, not a production code bug — real Prisma-generated enums would have worked fine — but it would have silently hidden real bugs in this environment if left unfixed.)

## 3. A design correction made mid-phase (documented, not hidden)

While building Payments, I hit a genuine schema conflict: `Payment.orderId` is required, but the sequence diagram in the API Design Specification (§18.5–18.6) has the **Stripe webhook confirm payment before the Order is finalized** — meaning a card payment would need to reference an Order that doesn't exist yet.

**Resolution:** Orders are now created in a `pending` status immediately at checkout-confirm time (no stock decrement yet), so `Payment.orderId` always has something valid to reference. Once payment succeeds — instantly for COD, or via webhook for card — the order atomically transitions `pending → confirmed` **and** stock is decremented in the same transaction (DDD §14.5). This means:
- A card payment that's abandoned or declined never touches inventory
- COD/bank transfer confirm synchronously (no gateway wait)
- The whole thing is idempotent: `confirmPendingOrder()` no-ops if the order isn't still `pending`, so a duplicate Stripe webhook delivery can't double-decrement stock

A related fix: `Order.addressId` was originally a required FK to `Address`, which silently breaks guest checkout (guests have no `Address` row — `Address.userId` is required). Fixed by making `addressId` optional and adding a required `shippingAddress` JSON snapshot on `Order` itself — which is also just better practice (an order should keep the address as it was at purchase time, not a live pointer that could change later). This mirrors the same "snapshot, don't reference" pattern already used for `OrderItem.priceAtPurchase`.

## 4. Document-compliance trace — Phase 5 modules

| Module | Key FRs/BRs implemented | DDD entities | Backend Standards layering |
|---|---|---|---|
| **Shipping** | FR-074–078, BR-011 | ShippingZone, ShippingRate, Shipment | ✅ |
| **Orders** | FR-059–066, BR-005, BR-012 | Order, OrderItem, OrderStatusHistory | ✅ two-step pending→confirmed handshake, atomic stock decrement (DDD §14.5) |
| **Payments** | FR-067–073, BR-004, FR-116 | Payment, Refund | ✅ idempotency-key enforced at the DB unique-constraint level (FR-072/NFR-008); Stripe isolated to a single adapter file (Backend Standards §13.4 pattern) |
| **Checkout** | FR-051–058, FR-057 (re-validation at final step) | CheckoutSession | ✅ orchestrates cart/users/shipping/coupons/orders/payments entirely through public interfaces — no module-boundary violations |

## 5. Known, flagged gaps (honest, not hidden)

1. **Tax is a flat placeholder (0%)** — `checkout.service.ts` has a `TODO(Phase 7)` comment; real region-based `TaxRule` lookup depends on the Settings module, which is Phase 7 scope per the original phase plan.
2. **Stripe webhook handler and payment-intent creation are structurally complete but untestable here without real Stripe test keys** — the adapter, signature verification, and idempotency logic are all real code (not stubs), but I have no way to fire an actual Stripe test event in this sandbox. Recommend testing this specifically with Stripe's CLI (`stripe trigger payment_intent.succeeded`) once you have test API keys.
3. **Bank transfer confirmation is a manual admin action that doesn't exist yet** — Payment is created in `pending` status and correctly left there; the "admin confirms receipt" endpoint is Phase 7 (Admin module) scope.
4. **No automated retry/expiry sweep for abandoned CheckoutSessions or stuck `pending` orders yet** — the `expiresAt` field exists and is checked on read, but a background job to actively expire/clean these up is Phase 6 scope (background jobs, per Backend Standards §14.6).

## 6. Recommendation

The riskiest part of this phase — money and inventory correctness under concurrency — is handled the way DDD Section 14 specifies: optimistic locking + atomic transactions + idempotency keys, not "hope it works." I'd still strongly suggest, once you have `prisma generate` working locally:
- Run a real load-style test hitting `checkout/sessions/:id/confirm` concurrently for the same last-unit SKU, and confirm exactly one succeeds
- Wire up Stripe test-mode keys and fire real webhook events via the Stripe CLI

Ready for Phase 6 (Reviews, Notifications) whenever you are.
