# Phase 7 — Checkout, Payment & Order Completion

## Summary
Phase 7 implements the complete production-style checkout-to-order flow by wiring the existing ShopSmart backend APIs to a fully rebuilt frontend checkout experience.

---

## Backend Checkout Flow

| Step | Method | Endpoint | Auth | Notes |
|------|--------|----------|------|-------|
| Create session | POST | `/api/v1/checkout/sessions` | Optional | Returns authoritative totals |
| Confirm session | POST | `/api/v1/checkout/sessions/:sessionId/confirm` | Optional | Requires `Idempotency-Key` header |
| List orders | GET | `/api/v1/orders` | Required | Cursor paginated |
| Get order detail | GET | `/api/v1/orders/:orderId` | Required | Includes items, shipment, history |
| Cancel order | POST | `/api/v1/orders/:orderId/cancellation` | Required | Only while pending/confirmed |
| Stripe webhook | POST | `/api/v1/webhooks/stripe` | — | Advance order to confirmed |

---

## Payment Provider

**Stripe** is the configured provider (already implemented in the backend).

**Payment method flow:**
- **Card:** Backend creates a Stripe `PaymentIntent` and now returns its `clientSecret`. Frontend uses `@stripe/react-stripe-js` `<Elements>` + `<PaymentElement>` to securely collect card details. The Stripe webhook `payment_intent.succeeded` transitions the order to `confirmed`.
- **COD:** Order confirmed immediately by the backend after checkout.confirm.
- **Bank Transfer:** Order stays `pending` until manually confirmed by admin.

---

## Frontend Files Created / Modified

### Created
| File | Purpose |
|------|---------|
| `src/types/checkout.types.ts` | Full Order, Payment, OrderStatus, ShippingAddress types |
| `src/services/orders.service.ts` | API client for orders (list, detail, cancel) |
| `src/features/orders/hooks/use-orders.ts` | TanStack Query hooks: `useOrders`, `useOrder`, `useCancelOrder` |
| `src/app/(storefront)/orders/page.tsx` | Order history page with status filter tabs |
| `src/app/(storefront)/orders/[id]/page.tsx` | Order detail with cancellation, timeline, shipment |

### Modified
| File | Change |
|------|--------|
| `src/app/(storefront)/checkout/page.tsx` | Complete rewrite — multi-step, Stripe Elements, COD/bank, idempotency |
| `src/app/(storefront)/checkout/success/page.tsx` | Fetches real order data via `useOrder()` |
| `src/services/checkout.service.ts` | Updated to return full `ConfirmCheckoutResult` |
| `src/features/checkout/hooks/use-checkout.ts` | Updated types |
| `src/config/env.ts` | Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `src/components/storefront/header.tsx` | Added "My Orders" link (desktop dropdown + mobile nav) |
| `.env.example` (frontend) | Added Stripe publishable key placeholder |

### Modified (Backend)
| File | Change |
|------|--------|
| `src/modules/payments/payments.service.ts` | Returns `clientSecret` from Stripe PaymentIntent for card payments |
| `.env.example` (backend) | Added `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` placeholders |

---

## Environment Variables

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend (`.env`):**
```
STRIPE_SECRET_KEY=sk_test_...       ← Server-side ONLY
STRIPE_WEBHOOK_SECRET=whsec_...     ← Server-side ONLY
```

> [!CAUTION]
> **Never put `sk_test_*` or `whsec_*` in the frontend.** These are backend-only secrets.

---

## Payment Flow

```
Cart → POST /checkout/sessions → totalAmount (authoritative)
     → POST /checkout/sessions/:id/confirm (Idempotency-Key header)
          ↓
     [card]  → Stripe PaymentIntent → clientSecret returned
                Frontend Stripe Elements → stripe.confirmPayment()
                  ↓
              Stripe Webhook → payment_intent.succeeded
                  ↓
              Backend → updatePaymentStatus(succeeded) + confirmPendingOrder()
          ↓
     [cod]   → Payment.status = succeeded immediately
              → confirmPendingOrder() → Order.status = confirmed
          ↓
     Frontend → redirect /checkout/success?orderId=...&orderNumber=...
     Success Page → GET /orders/:orderId → display real backend data
```

---

## Idempotency

- A `crypto.randomUUID()` key is generated once per checkout *attempt* and stored in a `useRef` (not state — not re-generated on re-renders).
- The key is sent as the `Idempotency-Key` header on `POST /checkout/sessions/:id/confirm`.
- The backend checks for an existing payment with that key before creating a new one.
- If payment fails, a **new** key is generated for the next attempt only.
- This prevents accidental double-charges from double-clicks or network retries.

---

## Stripe Webhook Setup (Local Development)

To test card payments end-to-end, Stripe webhooks must reach your local backend:

```bash
# 1. Install Stripe CLI
# https://stripe.com/docs/stripe-cli#install

# 2. Login
stripe login

# 3. Forward webhooks to local backend
stripe listen --forward-to http://localhost:4000/api/v1/webhooks/stripe

# 4. Copy the webhook secret printed by the CLI
# → Set STRIPE_WEBHOOK_SECRET=whsec_... in shopsmart-backend/.env

# 5. Use test card: 4242 4242 4242 4242 / any future date / any CVC
```

---

## Validation Results

| Check | Result |
|-------|--------|
| Frontend `typecheck` | ✅ PASS |
| Frontend `lint` | ✅ PASS (warnings only — pre-existing `<img>` tags) |
| Backend `tsc --noEmit` | ✅ PASS |
| Backend `lint` | ✅ PASS |
| Backend API running | ✅ PASS (`GET /products` returns 200) |
| Browser automated test | ❌ BLOCKED (Playwright CDN 404 — browser tool infrastructure issue) |

---

## Security Confirmation

| Requirement | Status |
|------------|--------|
| Stripe secret key server-side only | ✅ |
| Webhook secret server-side only | ✅ |
| No card data stored | ✅ (Stripe handles via PaymentElement) |
| Backend totals authoritative | ✅ (frontend never trusts its own calculations) |
| Payment status set by webhook | ✅ (card only — COD/bank handled server-side) |
| Idempotency prevents double charges | ✅ |

---

## Remaining Issues

1. **Browser automated test blocked** — Playwright driver download fails (CDN 404). Please manually test in your browser at `http://localhost:3000`.
2. **Stripe `clientSecret` requires a real Stripe test key** — Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` and `STRIPE_SECRET_KEY=sk_test_...` in respective env files. Until then, card payment shows "Stripe not configured" message; COD and Bank Transfer work without Stripe keys.
3. **Guest order history** — The `/orders` page requires authentication (by backend design). Guests see a "Sign in to view orders" message on the success page. This is by design per backend architecture.
4. **Stripe webhook local forwarding** — Requires Stripe CLI setup (documented above). Without it, card payment orders will stay `pending` even after successful payment.
