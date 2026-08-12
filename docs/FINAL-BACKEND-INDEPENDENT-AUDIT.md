# ShopSmart AI Backend — Final Independent Audit

## Executive Summary

The backend is well-architected and the P0 password-reset redesign is fundamentally sound: dedicated high-entropy tokens, hashed storage, single-use enforcement, and session revocation are all real and correctly wired. However, this audit found **one confirmed regression against the P0 fix itself** (the raw reset token is written to logs via the generic domain-event logger whenever `LOG_LEVEL=debug`), **one unaddressed concurrency gap** in coupon per-user redemption limits, and **the P3-1 "100% OpenAPI coverage" claim is false** — independent route inventory found 103 actual endpoints against 71 documented (42 undocumented, including the password-reset, email/phone-verification, and session-management endpoints; 10 documented paths that don't match any route in code). P1-2, P2-1, and P2-2 hold up under review.

Automated verification (`npm test`, `tsc --noEmit`, lint, `prisma validate`) could **not** be independently re-executed in this sandbox: `prisma generate` requires downloading engine binaries from `binaries.prisma.sh`, which this environment's network policy blocks (403 Forbidden), so the Prisma client isn't generated and `tsc --noEmit` fails purely on missing generated types (`Role`, `Prisma`, `OrderStatus`, etc. "not exported" — an environment artifact, not a code defect). Test counts were verified statically (59 `it()` blocks match the reported 59/59) but tests were not executed. Everything else in this report is based on direct source, schema, and OpenAPI inspection.

## Scope

Full `shopsmart-backend` source tree (20 modules, ~140 files), `prisma/schema.prisma`, `openapi/openapi.yaml`, all test files, middleware, config, and the six planning documents. No code was modified.

## Documents Reviewed

PRD, SRS, System Design (SDD), Database Design (DDD), API Design Specification, Backend Standards — all under `docs/`. Also reviewed the prior `docs/BACKEND-FULL-AUDIT.md` as evidence to verify, not to trust.

## Document Consistency (Phase 1)

The layered flow (routes → controllers → services → repositories → Prisma) is followed consistently across every module sampled (auth, orders, inventory, coupons, payments, reviews, cms). Controllers are thin (parse/validate/call-service/respond); business rules live in services; all Prisma calls are confined to `*.repository.ts` files. Cross-module calls go through each module's `index.ts` public surface (e.g. orders imports `decrementStock` from `@modules/inventory`, not the inventory repository directly), which matches the stated module-boundary rule. No circular-dependency smell or business logic in controllers was found in the modules reviewed. No architectural violations found.

## P0 Security Re-Verification

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | Normal access JWT cannot be used as reset token | **CONFIRMED** | `confirmPasswordReset` (`auth.service.ts`) never calls `verifyAccessToken`; it only hashes the input and does a Redis lookup under a `password-reset:` prefix. Structurally cannot accept a JWT. |
| 2 | Refresh token cannot be used as reset token | **CONFIRMED** | Refresh tokens are validated only via `hashRefreshToken` + `authRepository.findRefreshTokenByHash`, an entirely separate code path from reset confirmation. |
| 3 | Reset token uses cryptographically secure randomness | **CONFIRMED** | `generatePasswordResetToken()` in `jwt.util.ts` uses `crypto.randomBytes(32)` (32 bytes / 256 bits). |
| 4 | Raw token is not stored in Redis | **CONFIRMED** | `redis.set(\`password-reset:${hash}\`, user.id, ...)` — only the SHA-256 hash is used as the key; the raw value never touches Redis. |
| 5 | Only a hash is stored | **CONFIRMED** | Same evidence as #4. |
| 6 | Raw token is not logged | **NOT CONFIRMED** | `eventBus.publish('user.password_reset_requested', { ..., resetToken: raw })` (`auth.service.ts`) is logged in full by the bus itself: `DomainEventBus.publish()` in `src/shared/events/event-bus.ts` runs `logger.debug({ event, payload }, 'Domain event published')` for **every** event, unconditionally, before emitting it. `PasswordResetRequestedEvent.resetToken` is the raw token, so it is written to the log stream whenever `LOG_LEVEL=debug`. Default `LOG_LEVEL` is `info` (`env.ts`), so this does not fire in a default deployment, but it is a live leak path the moment debug logging is turned on for troubleshooting (a routine ops action) — see Finding F-1. |
| 7 | Raw token is not persisted in PostgreSQL | **CONFIRMED** | No `PasswordReset*` model exists in `prisma/schema.prisma`; the only related table, `NotificationLog`, stores `type/channel/recipient/status/error`, never the email body/token. `resend.adapter.ts` logs only `{ to, subject }`, never `html`. |
| 8 | TTL is exactly the intended value | **CONFIRMED** | `PASSWORD_RESET_TTL_SECONDS = 15 * 60`, matching the 15-minute TTL the prior audit (`docs/BACKEND-FULL-AUDIT.md:65-66`) specified as the fix. |
| 9 | Token is single-use | **CONFIRMED** | `confirmPasswordReset` calls `redis.del(\`password-reset:${tokenHash}\`)` immediately after a successful reset. |
| 10 | Token cannot be reused after successful reset | **CONFIRMED** | Same as #9 — the Redis key is gone, so a second confirm with the same raw token gets `AuthenticationError('RESET_TOKEN_INVALID')`. Covered by test: `tests/api/auth.api.test.ts:195` "rejects reset token on second use." |
| 11 | Expired tokens fail | **CONFIRMED** | Redis `EX` expiry means `redis.get` returns `null` after 15 minutes, which throws `RESET_TOKEN_INVALID`. Covered by `tests/integration/auth.integration.test.ts:106`. |
| 12 | Password reset revokes existing sessions | **CONFIRMED** | `await authRepository.revokeAllUserTokens(userId)` runs right after the password hash update, before the single-use token is deleted. |
| 13 | User enumeration protection is preserved | **CONFIRMED** | `requestPasswordReset` returns silently (no error, no distinguishing response) when no user matches. Covered by `tests/api/auth.api.test.ts:141`. |
| 14 | Reset-token validation is independent from normal JWT access-token validation | **CONFIRMED** | Distinct hashing functions (`hashPasswordResetToken` vs `hashRefreshToken`), distinct Redis key namespaces, and reset confirmation never touches `jwt.verify`. |

**13 of 14 CONFIRMED, 1 NOT CONFIRMED** (raw-token logging — see F-1).

## Authentication & Authorization

- **Registration/login**: generic `INVALID_CREDENTIALS` message regardless of which check fails (`auth.service.ts:login`) — no user-enumeration signal on the login path either.
- **Refresh rotation & reuse detection**: `refresh()` hashes the incoming raw token, checks `revoked`; if the token was already revoked (rotated once already) it treats reuse as theft and calls `revokeTokenFamily(existing.familyId)`, invalidating the whole chain — correct token-family design (SDD Section 9.2). No test exercises the reuse-detection branch specifically (family revocation on replay); this is a coverage gap, not a code defect (see Test Quality).
- **Logout**: revokes the entire token family, not just the presented token — reasonable (logs out all rotations of that session).
- **Sessions**: `GET /auth/sessions` lists only `authRepository.listActiveSessions(userId)` (implicitly scoped); `DELETE /auth/sessions/:sessionId` calls `findSessionById(sessionId, userId)` — ownership is enforced in the query itself, not just checked after fetch, so this is IDOR-safe by construction.
- **RBAC**: `requireRole()` is a pure role gate; ownership checks are correctly pushed to the service layer per the documented convention (e.g., `orders.service.ts:cancel` explicitly checks `order.userId !== requestingUser.id` for non-admins before allowing cancellation, and `getById`/`list` branch on `isStaff` to decide whether to scope by user). This matches Backend Standards Section 10.5 and was not violated in any module sampled (orders, reviews, coupons, admin, users all follow the same pattern).
- **Cookies**: refresh token is `httpOnly`, `secure` in production, `sameSite: 'strict'`, and scoped to `path: '/api/v1/auth'` — a solid baseline that also incidentally mitigates CSRF for the cookie-based token (the access token travels only via `Authorization: Bearer`, which is not attacker-triggerable via a plain cross-site request, so the lack of an explicit CSRF token is acceptable given this design, not a gap).
- **Privilege escalation**: `PATCH /admin/staff/:staffId/role` has a `LAST_ADMIN_PROTECTED` guard (test: `admin.api.test.ts:54`) preventing the org from being left without an admin — good defensive design, not required by the prompt but worth noting as a real safeguard.
- **Rate limiting**: `strictLimit` (5 requests / 15 min) is applied to register, verify-email, verify-phone, login, and both password-reset endpoints — appropriate coverage of the brute-force-sensitive surface.

No IDOR, broken access control, or role-bypass issues were found in the modules reviewed.

## Database

Reviewed `prisma/schema.prisma`, relations, and repository query patterns.

- Primary keys: UUID `@id @default(uuid())` consistently.
- Foreign keys / cascade behavior: deliberate and differentiated — e.g. `Review.user` is `onDelete: Cascade` (reviews die with the user) while `Review.order`/`Order.items` use `onDelete: Restrict` (financial/audit records are never silently orphaned by a delete). `Order.user`/`Order.address` use `onDelete: SetNull`, consistent with guest-order support (`userId`/`addressId` are nullable specifically to allow this).
- Nullable fields align with actual optionality (`Order.userId` nullable for guest checkout, `Order.addressId` nullable since a snapshot `shippingAddress` JSON field is the source of truth for fulfillment).
- Transaction boundaries: `confirmPendingOrder` and `cancel` in `orders.service.ts` correctly wrap the money/inventory-critical writes (stock decrement/restore, order status, redemption record, status-history row) in a single `prisma.$transaction`, with non-critical side effects (shipment creation, event publish) deliberately kept outside the transaction.
- Optimistic locking: `Inventory.version` + `conditionalUpdate` using `updateMany({ where: { ..., version: expectedVersion } })`, returning affected-row count to distinguish a version conflict from a 404 — correct pattern.

### Index audit (Phase 4 checklist)

| Index | Column(s) | Actual query using it | Why needed | Redundant? | Justified? |
|---|---|---|---|---|---|
| `CouponRedemption` | `[couponId, userId]` | `countRedemptionsByUser(couponId, userId)` in `coupons.repository.ts`, called from `validateAndCompute` on every cart/coupon check | Per-user usage-limit lookup; hit on every coupon validation | No — composite, not covered by the single-column `[userId]` index below for this specific `(couponId, userId)` filter | Justified |
| `CouponRedemption` | `[userId]` | Any "my redeemed coupons"-style lookup by user alone | Supports queries filtering by `userId` without `couponId` | Not fully redundant with the composite (Postgres can use a composite index for a leading-column-only filter, but a standalone `[userId]` index is more efficient when `couponId` isn't part of the predicate) | Justified, if with a caveat: if no code path currently queries by `userId` alone, this index is unused overhead. Grep of the module shows no such query today — **borderline** (see F-4). |
| `Order` | `[addressId]` | `Order.address` relation lookups / `onDelete: SetNull` cascade resolution | Present and correctly added | No | Justified |
| `Order` | `[userId, createdAt]` | `orders.repository.ts` list/pagination for a user's order history | Composite matches the actual list query (filter by user, sort by date) | No | Justified |
| `Order` | `[status]` | Admin order-status filtering (`admin.repository.ts` / `orders.repository.ts` list with `status` filter) | No | Justified |
| `OrderItem` | `[orderId]` | Every order detail fetch (`order.items` relation) | No | Justified |
| `OrderItem` | `[productVariantId]` | Sales/analytics rollups by variant (`analytics.repository.ts`) | No | Justified |
| `OrderStatusHistory` | `[orderId]` | Order status timeline fetch | No | Justified |
| `Payment` | `[orderId]` | `paymentsRepository.findByOrderId`, used in refunds and `listByOrder` | No | Justified |
| `Review` | `[orderId]` | Duplicate-review check (`@@unique([orderId, productId, userId])` already covers this too, so this standalone index is largely redundant with the unique constraint for `orderId`-only lookups) | Partially redundant — the unique constraint on `[orderId, productId, userId]` already indexes `orderId` as its leading column | **Partially redundant**, low-severity (INFO) | Acceptable, not harmful |
| `Review` | `[userId]` | "My reviews" listing | No | Justified |

All eight columns named in the audit brief (`CouponRedemption.userId`, `Order.addressId`, `OrderItem.orderId`, `OrderItem.productVariantId`, `OrderStatusHistory.orderId`, `Payment.orderId`, `Review.orderId`, `Review.userId`) are present. P2-2 is substantively **VERIFIED**, with one INFO-level observation (partial redundancy of `Review.orderId` against the existing unique constraint) and one borderline case (`CouponRedemption.[userId]` standalone index — currently unused by any query found in this codebase, though a reasonable index to keep for near-term features like a user's redemption history).

## Concurrency & Transactions

- **Inventory decrement**: atomic and correct. `decrementStock` uses `updateMany({ where: { productVariantId, quantity: { gte: quantity } }, data: { quantity: { decrement: quantity } } })` — the sufficiency check and the decrement happen in one statement, so two concurrent requests cannot both pass a separate "is there enough stock" check and then both decrement (classic TOCTOU is closed at the SQL level, not just in application code). Confirmed by targeted unit tests (`inventory.service.test.ts`).
- **Checkout/order confirmation**: wrapped in `prisma.$transaction`, and `confirmPendingOrder` no-ops (returns the order as-is) if it's not still `pending` — this makes the confirm path idempotent against Stripe webhook retries and double-submission.
- **Payment idempotency**: `initiatePayment` short-circuits on a pre-existing row for the same `idempotencyKey` (unique-constrained column, per code comment) before doing anything else — correct.
- **Webhook replay**: `handleStripeWebhookEvent` verifies the Stripe signature via `stripeAdapter.constructWebhookEvent`, and the raw-body route is mounted in `app.ts` **before** `express.json()` specifically so signature verification sees the exact original bytes — a common real-world bug that this code avoids correctly. `payment_intent.succeeded` handling looks up the payment by gateway intent id and no-ops if not found ("already handled"), and `confirmPendingOrder`'s own status check makes a duplicate webhook delivery a safe no-op.
- **Coupon redemption — race condition (F-2, unaddressed)**: `couponsService.validateAndCompute` checks the per-user usage limit via `countRedemptionsByUser` at *cart-validation time*, and the actual `recordRedemption` insert happens later, inside the *order's* transaction at confirmation time — a separate request/transaction. There is no unique constraint on `CouponRedemption(couponId, userId)` (only a non-unique index) and no re-check of the usage limit inside the confirmation transaction. Two concurrent checkouts by the same user using the same single-use coupon (`usageLimitPerUser: 1`) can both pass the pre-check (both see 0 prior redemptions) and both go on to redeem it, exceeding the intended limit. `CouponRedemption.orderId` is unique, so this cannot duplicate-redeem *the same order* (protects against webhook replay), but it does not protect against two *different* concurrent orders. This is the same class of bug the P0 fix addressed for inventory — it simply wasn't extended to coupons.
- **Reviews**: duplicate review is prevented by a real DB constraint, `@@unique([orderId, productId, userId])`, not just an application check — race-safe.
- **Wishlist / cart**: no financial or inventory stakes in these paths; ordinary read-then-write is acceptable here.

## API Security

Spot-checked authentication, authorization, ownership, and validation across admin, orders, payments, coupons, reviews, and inventory endpoints (see Authentication & Authorization above for the ownership-check pattern, which held consistently). `validate()` middleware (Zod) is applied on every route accepting a body/query that was sampled. No endpoint was found returning raw stack traces, DB errors, or internal details — see Error Contracts below. No new IDOR or privilege-escalation findings beyond what's already covered under Authentication & Authorization.

## OpenAPI Verification

The prior audit's OpenAPI finding (P3-1) was explicitly **not trusted** and independently re-derived. An actual-route inventory was built by parsing every `router.<method>(...)` call across all 20 `*.routes.ts` files (including multi-line declarations, which a naive single-line grep undercounts — the first pass returned 69 and missed entire modules like coupons, reviews, notifications, and audit-logs) plus the Stripe webhook route mounted directly in `app.ts`.

- **Actual endpoint count: 103** (102 module routes + 1 webhook route).
- **Documented endpoint count: 71** (parsed directly from `openapi/openapi.yaml`'s `paths:` tree).
- **Coverage: 71/103 ≈ 69%**, not the previously claimed "100%."

**Missing from OpenAPI (42 endpoints)** — selected highlights, full list generated programmatically and available on request:
- All of `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm`, `POST /auth/verify-email`, `POST /auth/verify-phone`, `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId` — i.e. **the entire P0-relevant authentication surface is undocumented**, which is a meaningful gap given this is the area under active security remediation.
- `GET /users/me`, `PATCH /users/me`, `DELETE /users/me`
- `PATCH /orders/:orderId/status`, `POST /orders/:orderId/delivery-confirmation`
- `POST /products/:productId/variants`, `POST /products/:productId/images`, `PATCH /products/:productId`, `PATCH /products/:productId/variants/:variantId`, `PATCH .../images/:imageId/reorder`, `DELETE /products/:productId`, and both product-image/variant delete routes
- `GET /inventory/low-stock`
- `POST /cart/coupon`, `DELETE /cart/coupon`, `PATCH /cart/items/:itemId`
- `GET /admin/staff`, `POST /admin/staff`, `POST/GET /admin/settings/tax-rules`
- `GET /admin/analytics/sales`, `GET /admin/analytics/customers`, `GET /admin/analytics/export`
- `GET/POST /cms/faq`, `PATCH /cms/faq/:faqId`, `DELETE /cms/faq/:faqId`, `PATCH/DELETE /cms/banners/:bannerId`
- `POST /shipping/rates`, `GET /shipping/orders/:orderId/shipment`
- `POST /wishlist/items/:productId/move-to-cart`
- `DELETE /reviews/:reviewId`

**Documented but not matching any actual route (10 entries)** — either stale/renamed or aspirational:
- `GET /coupons` is documented but **there is no `GET /`/list handler in `coupons.routes.ts` at all** (only `POST /`, `PATCH /:couponId`, `DELETE /:couponId`, `POST /validate`) — this isn't a naming mismatch, it's a documented endpoint that doesn't exist in the implementation.
- `PATCH /reviews/{reviewId}/hide` vs. actual `DELETE /reviews/:reviewId` (different HTTP method and different path — the real route is a moderation delete, not a hide-patch).
- `GET /cms/faqs` vs. actual `GET /cms/faq` (pluralization mismatch).
- `GET /admin/analytics/sales-summary`, `/customer-growth`, `/repeat-customers` vs. actual `/sales`, `/customers`, (no growth/repeat-customer route exists at all).
- `POST /wishlist/merge` — no such route in `wishlist.routes.ts`.
- `DELETE /cms/pages/{id}` — no delete handler exists for CMS pages in code (only `POST`/`PATCH`).
- `POST /shipping/zones/{zoneId}/rates`, `DELETE /shipping/zones/{zoneId}/rates/{rateId}` — actual shipping routes are flat (`POST /shipping/rates`), not nested under a zone.

**P3-1 verdict: previously reported as RESOLVED — independently found NOT VERIFIED.** The OpenAPI document is a meaningfully incomplete and partially inaccurate description of the real API surface.

## Error Contracts

`errorHandlerMiddleware` (`src/shared/middleware/error-handler.middleware.ts`) is a single global handler mounted last, producing an RFC-7807-aligned envelope for three cases: `ZodError` (defensive fallback → 422), `AppError` subclasses (mapped to their own status codes, `isOperational` errors logged at `warn`, non-operational at `error` with `stack` — the stack goes to the log, never the response), and unknown errors (always 500, generic `userMessage`, no `detail`/stack in the response body). `requestId` (correlation id) is threaded through every branch. No branch leaks a database error message, driver name, or stack trace to the client. Status codes observed in service code (`NotFoundError`→404-style, `ConflictError`, `PreconditionFailedError`, `AuthenticationError`, `AuthorizationError`, `BusinessRuleError`) map to sensible HTTP semantics based on their class names and usage. This phase is **clean** — no findings.

## Redis

- **TTLs**: OTP (`otp:phone:*`, 5 min), password-reset (`password-reset:*`, 15 min), rate-limit windows (configurable per limiter) — all set explicitly via `EX`, no unbounded keys found in the modules reviewed.
- **Key naming/namespacing**: consistent `prefix:subject:id` convention (`otp:phone:<userId>`, `password-reset:<hash>`, `ratelimit:<keyPrefix>:<identifier>`).
- **Serialization**: values stored are plain strings/codes, not serialized objects — no deserialization risk.
- **Failure behavior**: the rate limiter fails **open** on a Redis error (`catch { next(); }` in `rate-limit.middleware.ts`) — i.e., if Redis is down, login/registration rate limiting is silently disabled rather than blocking traffic. This is a documented, deliberate availability-over-strictness tradeoff (comment: "degrade gracefully rather than hard-failing every request"), which is defensible, but it is a real security-relevant behavior worth the team being aware of explicitly rather than only in a code comment — flagged as INFO (F-5), not a defect.
- **Security-sensitive values**: the raw password-reset token and the phone OTP are both held only in Redis (not Postgres), consistent with the "ephemeral secret" design intent. The logging leak (F-1) is an event-bus problem, not a Redis-usage problem per se.

## Test Quality

Not just counted — inspected for what they actually assert.

| Domain | Coverage | Notes |
|---|---|---|
| Authentication (register/login/generic-error) | GOOD | Explicit non-enumeration assertion on login; validation-error paths covered. |
| Password reset (P0) | GOOD | Covers: reject-JWT-as-reset-token, valid reset + session revocation, single-use rejection, expired-token rejection, non-enumeration on request. This is genuinely thorough security-scenario testing, not just happy-path. |
| Authorization / RBAC | GOOD | 403-vs-401 distinction tested (`products.api.test.ts`), last-admin-protection tested, staff-vs-admin role gating tested. |
| Ownership / IDOR (orders) | GOOD | Explicit test that a customer cannot cancel another user's order, and that `findByIdForUser` vs `findById` is used correctly per role. |
| Inventory / concurrency | GOOD | Directly tests the "affected zero rows → INSUFFICIENT_STOCK" branch, i.e. the actual concurrency-safety mechanism, plus optimistic-locking version-mismatch. |
| Payments / idempotency | GOOD | Idempotency-key short-circuit, COD-vs-bank-transfer confirm timing, webhook no-op-if-unknown, webhook confirms exactly once. |
| Coupons | PARTIAL | Business-rule math and single-request usage-limit check are well tested; **no test exercises the concurrent-redemption race** described in F-2 (would require a concurrency/integration-style test, which the suite doesn't currently attempt for this module). |
| Reviews | GOOD | Verified-purchase gate, duplicate-review conflict, rating-range validation, public-listing-no-auth all covered. |
| Admin | GOOD | Role-change protection and cross-role access covered. |
| Refresh-token reuse detection (family revocation on replay) | MISSING | The rotation "happy path" is tested (`auth.integration.test.ts:117`), but no test submits an already-rotated (revoked) refresh token to confirm the whole family gets revoked and the correct `REFRESH_TOKEN_REUSE_DETECTED` error is thrown — this is the single most security-critical branch of the refresh flow and it has no direct test. |

Tests verify real failure/security scenarios in the large majority of domains, not only success paths. Two concrete gaps: coupon-redemption race condition, refresh-token-reuse-detection.

## Code Quality

No `: any`, `<any>`, or `as any` found anywhere in `src/`. No `@ts-ignore`/`@ts-nocheck` found. No trivially-empty `catch {}` blocks found (the two intentional silent-catch patterns found — `optionalAuthMiddleware`'s invalid-token-as-guest fallback, and the rate limiter's fail-open — are both commented and intentional, not swallowed errors). `tsc --noEmit` could not be independently re-run to completion in this sandbox because the Prisma client isn't generated here (network-blocked); every error produced was a "no exported member `Role`/`Prisma`/etc." from `@prisma/client`, i.e. missing generated types, not a real type error in the hand-written code — this is an environment limitation, not a code-quality finding. P2-1 ("no explicit any") is **VERIFIED** by direct grep of the full `src/` tree.

## Production Readiness

- Environment validation: `env.ts` uses a Zod schema with `safeParse` and `process.exit(1)` on failure — fail-fast, as claimed.
- Helmet + CORS with `credentials: true` (required for the cookie) — present.
- Cookies: `httpOnly`, `secure` in production, `sameSite: strict`, scoped `path` — present.
- Health (`/health`) and readiness (`/ready`, actually pings both Postgres and Redis) endpoints — present and meaningfully differentiated (readiness actually checks dependencies, not just "process is up").
- Graceful shutdown: `SIGTERM`/`SIGINT` handlers close the HTTP server, disconnect Postgres and Redis, with a 10-second force-exit fallback — present and correct.
- Stripe webhook raw-body handling ordered correctly relative to `express.json()` — present (see Concurrency section).
- Scheduled jobs / notification listeners are registered before the server starts accepting traffic (`server.ts:bootstrap`) — correct ordering.

No production-breaking configuration issues found.

## Findings

**F-1 — Raw password-reset token is written to logs at debug level**
- Severity: **P1 (High)**
- Location: `src/shared/events/event-bus.ts`, `DomainEventBus.publish()`; triggered from `src/modules/auth/auth.service.ts:requestPasswordReset`
- Evidence: `publish()` runs `logger.debug({ event, payload }, 'Domain event published')` for every event before emitting it. `payload` for `user.password_reset_requested` is `PasswordResetRequestedEvent`, which includes `resetToken: raw` — the plaintext, unhashed reset token.
- Impact: With `LOG_LEVEL=debug` (a routine setting for staging/troubleshooting, not a hardcoded impossibility — default is `info`), every password-reset request writes the raw, still-valid reset token to the log stream, where it may be aggregated, retained, or accessible to a broader audience than intended, defeating the hash-only-storage design.
- Recommendation: Either (a) strip/redact known-sensitive fields (`resetToken`, and any future secret payload fields) before the generic `publish()` log line, or (b) mark specific event payload fields as non-loggable at the type level and have `publish()` respect that, or (c) simply drop the payload from the generic debug log entirely and let individual subscribers log what they need.

**F-2 — Coupon per-user usage limit is not race-safe across concurrent orders**
- Severity: **P2 (Medium)**
- Location: `src/modules/coupons/coupons.service.ts:validateAndCompute` / `recordRedemption`; `src/modules/coupons/coupons.repository.ts`; `prisma/schema.prisma` `CouponRedemption`
- Evidence: usage-limit check (`countRedemptionsByUser`) happens outside any transaction, separately from the later `recordRedemption` insert (which happens inside the *order's* transaction, not a transaction shared with the check). No unique constraint on `(couponId, userId)` exists to enforce the limit at the database level.
- Impact: Two concurrent checkouts by the same user with the same coupon (`usageLimitPerUser: 1`) can both pass validation and both redeem, exceeding the intended limit. Revenue/business-rule impact, not a memory-safety or data-corruption issue; requires genuine concurrency to trigger (low likelihood, but the inventory module explicitly solved this exact class of bug, so the gap is inconsistent within the same codebase).
- Recommendation: Add a partial unique index (e.g. `@@unique([couponId, userId])` if `usageLimitPerUser` is always 1, or a Postgres partial/counting constraint if limits vary) or re-check the usage count inside the same transaction that performs `recordRedemption`, using `SELECT ... FOR UPDATE` or an equivalent row lock.

**F-3 — Refresh-token reuse detection has no direct test coverage**
- Severity: **P3 (Low)**
- Location: `tests/integration/auth.integration.test.ts`, `src/modules/auth/auth.service.ts:refresh`
- Evidence: no test submits a revoked/already-rotated refresh token to assert `REFRESH_TOKEN_REUSE_DETECTED` and full-family revocation.
- Impact: the correctness of the theft-detection branch relies entirely on manual/code review, not regression protection.
- Recommendation: add an integration test that rotates a refresh token once, then replays the original (now-revoked) token and asserts (a) the error code and (b) that a subsequent refresh with the *second* (legitimately rotated) token also now fails, proving the whole family was revoked.

**F-4 — `CouponRedemption.[userId]` standalone index currently has no matching query**
- Severity: **INFO**
- Location: `prisma/schema.prisma:318`
- Evidence: no code path in `coupons.repository.ts` or elsewhere filters `CouponRedemption` by `userId` alone (only the composite `[couponId, userId]` query was found).
- Impact: none currently; minor write-amplification overhead only. Likely intended for a near-term "my redemption history" feature.
- Recommendation: none required; revisit if the codebase is audited again and the query still doesn't exist.

**F-5 — Rate limiter fails open on Redis outage**
- Severity: **INFO**
- Location: `src/shared/middleware/rate-limit.middleware.ts`
- Evidence: `catch { next(); }` — any Redis error (including a full outage) disables rate limiting rather than blocking the request.
- Impact: during a Redis outage, brute-force protection on login/registration/password-reset is silently disabled. This is a deliberate, documented availability tradeoff, not a bug, but it should be an explicit, acknowledged operational risk (e.g. paired with alerting on Redis health) rather than only visible in a code comment.
- Recommendation: no code change required; consider surfacing a metric/alert when the rate limiter hits its catch branch, so "fail open" is observable in production.

## Previously Reported Findings

- **P0 (Password Reset Security): VERIFIED**, with one caveat — 13/14 sub-checks confirmed; raw-token logging (F-1) is a regression against the intent of the original fix and should be tracked as a new, related finding rather than closing P0 outright.
- **P1-2 (Integration Testing): VERIFIED** — `tests/integration/auth.integration.test.ts` exists and exercises real Redis-backed password-reset lifecycle and session/refresh flows, matching its stated scope.
- **P2-1 (Explicit any): VERIFIED** — zero occurrences of `any`/`@ts-ignore` found across `src/`.
- **P2-2 (Database indexes): VERIFIED** — all eight flagged columns are indexed; one INFO-level near-redundancy noted (Review.orderId vs. its own unique constraint), not a defect.
- **P3-1 (OpenAPI completeness): NOT VERIFIED** — independently rebuilt route inventory found 103 actual endpoints vs. 71 documented (~69% coverage), including the entire password-reset/verification/session surface being undocumented, and 10 documented paths with no corresponding route in code.

## Final Risk Assessment

- **CRITICAL**: none found.
- **HIGH**: 1 (F-1 — raw reset token logged at debug level).
- **MEDIUM**: 1 (F-2 — coupon redemption race condition).
- **LOW**: 1 (F-3 — missing test coverage for refresh-token reuse detection).
- **INFORMATIONAL**: 2 (F-4, F-5).

## Final Recommendation

**NOT READY — REMEDIATION REQUIRED**

Rationale: none of the findings are catastrophic, and the core P0 password-reset architecture, inventory concurrency control, payment idempotency, and error/production-readiness posture are all genuinely solid. But F-1 is a direct, confirmed regression against a security fix that was reported as fully resolved, and the OpenAPI claim that gated frontend integration ("100% coverage") is materially false for the auth surface specifically — a frontend team building against the documented API would not know the password-reset, verification, or session-management endpoints exist. Both are inexpensive to fix (redact one log line; regenerate/extend the OpenAPI doc from the real route table) and should be closed before this is handed off as the stable API foundation for frontend development. F-2 (coupon race) is lower urgency and can reasonably be tracked as a fast-follow rather than a blocker, given its narrow trigger conditions.

---
*Note on automated verification: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npx prisma validate`, and `npm run test:integration` were not independently re-executed in this audit's sandbox environment, because `prisma generate` requires fetching engine binaries from `binaries.prisma.sh`, which this environment's egress policy blocks. All `tsc` errors reproduced here were exclusively "missing exported member" errors from the ungenerated `@prisma/client`, not errors in hand-written code. Test pass/fail counts were verified structurally (59 `it()` blocks match the reported 59/59) but not by execution. This report's findings are based on direct, manual inspection of source, schema, and OpenAPI content rather than re-running the automated suite.*
