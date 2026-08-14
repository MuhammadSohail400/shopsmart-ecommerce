# Frontend Architecture Document (FAD)
## ShopSmart AI — Modern Full Stack E-commerce Platform

**Document Version:** 1.0
**Status:** Draft — Ready for Frontend Implementation
**Source of Truth Used:** Actual backend source code (`shopsmart-backend/src`), `prisma/schema.prisma`, actual route files (not `openapi/openapi.yaml` alone — see Section 0), PRD, SRS, SDD, DDD, API Design Spec, Backend Standards, and both backend audits
**Last Updated:** August 11, 2026

---

## 0. Methodology Note — Why This Document Does Not Trust the OpenAPI File Alone

`docs/FINAL-BACKEND-INDEPENDENT-AUDIT.md` found that `openapi/openapi.yaml` documents 71 endpoints against **103 actual routes** in code (~69% coverage), missing the entire password-reset, email/phone-verification, and session-management surface, with 10 documented paths that don't exist in code. The API Design Specification (`docs/05-api-design/`) is close to actual behavior for the modules it details in depth, but is a design document, not a route dump.

Consequently, every endpoint in this document's contract mapping (Section 21) was verified directly against the actual `*.routes.ts` files in `shopsmart-backend/src/modules/*/`, not copied from the OpenAPI spec or the API Design Spec. Where the two disagree, **actual code wins**. This is called out inline wherever it matters.

---

## 1. Frontend Architecture Overview

### 1.1 Architectural Goals
- Consume the existing, stable REST contract (`/api/v1/*`, 25 modules, ~103 endpoints) without requiring any backend change
- Support three distinct experiences from one codebase: public storefront (SEO-critical), authenticated customer account area, and an internal admin/staff console (RBAC-gated: `admin`, `inventory_manager`, `support_agent`)
- Support both guest and registered checkout, matching the backend's dual identity model (`Authorization: Bearer` for registered users, `X-Guest-Cart-Id` header for guests)
- Meet the PRD's non-functional targets that are frontend-owned: product pages under 2s load (NFR, PRD §17), WCAG 2.1 AA (PRD §20), and SEO requirements (PRD §21) — which drive the rendering-strategy decision in Section 2
- Keep authorization **advisory only** on the client; every permission decision is re-enforced server-side (SRS/SDD SEC-002) — the frontend hides/disables UI for UX, never as a security boundary

### 1.2 Frontend Responsibilities
- Rendering, routing, and client-side state for storefront, account, and admin surfaces
- Calling the versioned REST API and normalizing its envelope/error shapes (Section 6)
- Managing the access token in memory and orchestrating silent refresh (Section 7)
- Client-side validation as a UX layer only — never a substitute for the server's Zod validation (PRD §10, explicit non-negotiable)
- Guest cart identity (`X-Guest-Cart-Id`) generation and persistence
- Presenting the RFC-7807-aligned error contract in a consistent, user-safe way

### 1.3 Backend/Frontend Boundary
The frontend owns **nothing** past the HTTP boundary: no direct DB access, no business rule duplication beyond client-side UX validation, no server-side session state (the API is stateless — SDD §4). All business rules (stock non-negativity, coupon eligibility, return windows, RBAC) are enforced server-side; the frontend's job is to reflect the server's decisions quickly and to fail gracefully when its own optimistic assumptions turn out to be wrong (e.g., an item goes out of stock between "add to cart" and "checkout" — a case the backend explicitly signals via `409`/flagged cart items, SRS FR-057).

### 1.4 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           BROWSER                                  │
│   Storefront (SSR/ISR)   Account Area (CSR)   Admin Console (CSR) │
└───────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                          NEXT.JS APPLICATION                        │
│  App Router · Route Groups · Server Components · Route Handlers     │
│  (Route Handlers used only for BFF concerns — Section 6.5)          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    UI COMPONENT LAYER (shared, dumb)                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                 FEATURE LAYER (auth, cart, checkout, ...)           │
│         feature hooks + Zustand slices + React Query hooks          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│              APPLICATION / API LAYER (services + api client)        │
│    typed request builders · envelope unwrap · error normalization   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS, Bearer + HttpOnly cookie
┌────────────────────────────────▼────────────────────────────────────┐
│         SHOPSMART BACKEND API — /api/v1 (Express, 25 modules)       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Recommended Frontend Stack

| Concern | Choice | Why |
|---|---|---|
| **Framework** | **Next.js 15 (App Router)** | The PRD is explicit about SEO (§21: structured data, sitemap, canonical URLs, OG tags) and performance (§17/§19: P75 page loads <2s, CDN-cacheable category/CMS pages). A pure client SPA (which the original SDD sketched as "React + Vite") cannot satisfy server-rendered structured data and crawlable product pages without a separate SSR layer bolted on later. Next.js gives SSR/ISR for the storefront and plain CSR for the admin console in a single codebase. **This is a deliberate deviation from SDD §4's "React + Vite SPA" sketch — see Section 23, ADR-FE-001, for the full rationale.** |
| **Runtime library** | **React 19** | Ships with Next.js 15; Server Components + `use()` reduce client-side data-fetching boilerplate for the storefront's read-heavy pages (product/category listings). |
| **Language** | **TypeScript 5.6+, strict mode** | Matches the backend's own standard (Backend Standards §7 mandates TS strict, zero `any` — confirmed zero `any`/`@ts-ignore` in the audit). Shared type discipline between teams reduces integration drift. |
| **Styling** | **Tailwind CSS 4** | Fast to build a large surface (storefront + admin) with consistent design tokens; no runtime CSS-in-JS cost on SSR pages. |
| **Server state / data fetching** | **TanStack Query (React Query) v5** | The API is a plain REST/JSON contract with explicit cache-relevant signals (ETags are not used, but cursor pagination and `PATCH`-based mutations are) — React Query's cache, invalidation, and optimistic-update primitives map directly onto Section 9's data needs (cart, wishlist, orders) without hand-rolled caching logic. |
| **Client/UI state** | **Zustand** | Small, unopinionated, no boilerplate for the few genuinely global UI concerns (Section 8: guest cart ID, checkout step, UI toggles). Redux's ceremony isn't justified — most "global" state here is actually server state and belongs in React Query, not a client store. |
| **Forms** | **React Hook Form** | Performant for the checkout multi-step form and the admin console's dense CRUD forms (products, coupons, shipping zones); minimal re-renders. |
| **Validation** | **Zod** | The backend already validates every request body with Zod (Backend Standards §9.2). Reusing Zod on the frontend (not necessarily the *same* schemas, since some are server-only, e.g. password hash concerns — but the same *library* and often mirrored shape) keeps the validation mental model identical across the stack and lets `zodResolver` wire directly into React Hook Form. |
| **API client** | **Native `fetch` wrapped in a thin typed client** (Section 6) | No need for Axios's interce../plugin ecosystem — `fetch` plus a small typed wrapper handling the envelope, auth header injection, and refresh-on-401 retry covers everything the contract requires. Keeps bundle size down. |
| **Authentication** | **Custom, backend-driven** (Section 7) — access token in memory (React Query/Zustand), refresh token in the browser's HttpOnly cookie set by the backend | The backend already implements the full JWT + rotating-refresh-token + HttpOnly-cookie design (SDD §9, confirmed in `auth.controller.ts`/`cookie.util.ts`). NextAuth/Auth.js would fight this existing design rather than help; a thin custom auth context is less code and less abstraction mismatch. |
| **UI component strategy** | **shadcn/ui (Radix primitives + Tailwind)** as the base primitive layer, with ShopSmart-specific compound components in `components/` | Accessible-by-default primitives (dialogs, dropdowns, comboboxes) directly serve PRD §20's WCAG 2.1 AA requirement (keyboard nav, focus management, ARIA) without hand-building them; shadcn ships as owned source, not a black-box dependency, so it can be themed to match a future design system. |
| **Testing** | **Vitest + React Testing Library** (unit/component), **Playwright** (E2E) | Matches the backend's own test runner choice (Vitest, confirmed in `vitest.config.ts`) for tooling consistency across the stack; Playwright covers the cross-page flows (guest checkout, admin RBAC gating) that unit tests can't. |
| **Linting/formatting** | **ESLint (typescript-eslint) + Prettier**, same posture as backend | Consistency with the backend's own lint/format standard (Backend Standards §19). |

**Technologies deliberately not introduced:** Redux/Redux Toolkit (Zustand + React Query cover all real state needs), GraphQL client (the API is REST-only — API Design Spec §20 treats GraphQL as a possible *future additive* layer, not a current concern), a headless-CMS SDK (CMS pages/FAQ/banners are already served by the backend's own CMS module — Section 9.11), NextAuth/Auth.js (see Authentication row above).

---

## 3. Application Architecture

```
Browser
  ↓
Next.js (App Router: RSC for storefront reads, CSR islands for interactivity)
  ↓
UI Components (dumb, presentation-only — components/ui/, components/shared/)
  ↓
Features (feature-owned hooks, forms, and composed UI — features/<domain>/)
  ↓
Application/API Layer (typed service functions, one per backend module — services/<domain>.service.ts)
  ↓
API Client (single fetch wrapper: auth header, envelope unwrap, error normalization, refresh-retry)
  ↓
ShopSmart Backend API (/api/v1, Express, 25 modules)
```

**Layer responsibilities:**
- **UI Components** never import a service or know about the API contract. They receive data and callbacks as props.
- **Features** own a domain's hooks (React Query hooks wrapping a service function), Zustand slices (if any), and the composed screens/forms for that domain. A feature may import from `components/` and `services/`, never the reverse.
- **Application/API Layer** (`services/`) is the only place that imports the API client and knows the shape of a request/response for a given endpoint. Each service function returns already-unwrapped, typed data (envelope stripped) or throws a normalized `ApiError` (Section 6.4).
- **API Client** (`lib/api-client.ts`) is the single chokepoint for every HTTP call: it injects `Authorization`, attaches `X-Guest-Cart-Id` where relevant, unwraps `{ success, data, meta }` / `{ success, data, pagination, meta }`, converts RFC-7807 error bodies into a typed `ApiError`, and owns the 401 → silent-refresh → retry-once flow (Section 7.4).

---

## 4. Folder Structure

```
src/
├── app/                          # Next.js App Router — routing only, minimal logic
│   ├── (storefront)/             # Route group: public + customer-authenticated storefront
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing (category/search results)
│   │   │   └── [slug]/page.tsx   # Product detail
│   │   ├── categories/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx          # Multi-step checkout shell
│   │   │   └── confirmation/[orderId]/page.tsx
│   │   ├── account/              # Requires auth — guarded via middleware.ts
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[orderId]/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── sessions/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── [slug]/page.tsx       # CMS static pages (About, Terms, Privacy — catch-all, lowest priority)
│   ├── (admin)/admin/            # Route group: staff console — admin, inventory_manager, support_agent
│   │   ├── layout.tsx            # RBAC gate + admin shell (sidebar/nav scoped by role)
│   │   ├── dashboard/page.tsx
│   │   ├── orders/               # admin, support_agent
│   │   ├── products/             # admin, inventory_manager
│   │   ├── inventory/            # admin, inventory_manager
│   │   ├── coupons/              # admin
│   │   ├── shipping/             # admin
│   │   ├── cms/                  # admin
│   │   ├── staff/                # admin only
│   │   ├── audit-logs/           # admin only
│   │   ├── analytics/            # admin
│   │   └── settings/             # admin
│   ├── api/                      # Route Handlers — BFF concerns only (Section 6.5), never business logic
│   ├── layout.tsx
│   ├── error.tsx / not-found.tsx
│   └── middleware.ts             # Route protection (Section 12.2), redirects unauthenticated/unauthorized
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (button, dialog, input, ...) — no business knowledge
│   └── shared/                   # ShopSmart-specific but domain-agnostic: PriceDisplay, StockBadge, EmptyState, ErrorState
│
├── features/                     # One folder per backend-aligned domain (Section 5)
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── wishlist/
│   ├── reviews/
│   ├── admin-catalog/            # admin-side product/category/brand/inventory management
│   ├── admin-orders/
│   ├── admin-analytics/
│   └── ... (mirrors Section 5)
│   # each feature/<domain>/ contains: components/, hooks/, api.ts (thin re-export of the service),
│   # schemas.ts (Zod), types.ts (if not already covered by types/api/)
│
├── services/                     # Application/API layer — one file per backend module (Section 6.2)
│   ├── auth.service.ts
│   ├── products.service.ts
│   ├── cart.service.ts
│   ├── checkout.service.ts
│   ├── orders.service.ts
│   └── ... (25 files, one per API module, Section 9)
│
├── lib/
│   ├── api-client.ts             # Section 6 — the single HTTP chokepoint
│   ├── query-client.ts           # React Query client + default options
│   ├── guest-cart.ts             # X-Guest-Cart-Id generation/persistence (Section 8)
│   └── utils.ts
│
├── hooks/                        # Cross-feature generic hooks (useDebounce, useMediaQuery) — NOT feature-specific data hooks (those live in features/<domain>/hooks)
│
├── stores/                       # Zustand slices for genuine client/UI state only (Section 8)
│   ├── ui-store.ts               # cart drawer open/closed, mobile nav, theme
│   └── checkout-store.ts         # in-progress checkout step/local form draft (not server state)
│
├── types/
│   └── api/                      # Hand-maintained TS types mirroring backend DTOs (Section 6.3) — one file per module, matching services/
│
├── schemas/                      # Zod schemas for client-side form validation (Section 10) — NOT shared with backend schemas, mirrored intentionally
│
└── config/
    ├── env.ts                    # Validated, typed env access (Section 19) — mirrors backend's env.ts pattern
    └── site.ts                   # Non-secret constants: pagination defaults, max cart quantity display, etc.
```

**Why this shape, not the example in the prompt:** The example folder list included `stores`, which most of this app doesn't need much of — server state (products, cart, orders) belongs in React Query, not Zustand, so `stores/` is deliberately small (2 files) rather than a dumping ground. `services/` is kept as a distinct layer from `features/*/hooks` specifically so a future API client swap (e.g., adding GraphQL per API Design Spec §20) only touches `services/` and `lib/api-client.ts`, never the 25+ feature folders that consume them.

---

## 5. Feature Architecture

Each feature module below corresponds 1:1 to a backend module (SDD §6, API Design Spec §9). "Isolation" means: a feature only imports its own `services/<domain>.service.ts`, shared `components/`, and generic `hooks/` — never another feature's internals directly. Cross-feature composition (e.g., checkout needing cart + addresses + shipping) happens at the **page** level in `app/`, which is allowed to import multiple features.

| Feature | Backend Module | Auth Model | Notes |
|---|---|---|---|
| `auth` | Authentication | Public + self | Register, login, refresh, logout, verify-email/phone, password reset, session list/revoke |
| `account` | Users | Bearer | Profile (`/users/me`), addresses |
| `products` | Products, Categories, Brands, Product Variants/Images | Public read, staff write | Listing, detail, filters, variants |
| `cart` | Cart, Cart Items | Bearer or `X-Guest-Cart-Id` | Dual identity — see Section 8 |
| `wishlist` | Wishlist | Bearer only | No guest wishlist (PRD §10.2: "authenticated users only") |
| `coupons` | Coupons | Public validate, admin write | Cart-embedded validation UX + full admin CRUD |
| `checkout` | Checkout, Shipping (read) | Bearer or guest | Multi-step; owns idempotency-key generation |
| `orders` | Orders, Order Items | Bearer (owner) / staff (all) | History, detail, cancellation, invoice |
| `payments` | Payments | Bearer (owner) / staff | Payment status view, retry; refunds are staff-only (`admin-orders`) |
| `reviews` | Reviews | Public read, customer write | Verified-purchase gated (server-enforced, `403 REVIEW_NOT_ELIGIBLE`) |
| `notifications` | Notifications | Bearer | Preference toggles only — no in-app notification feed exists server-side |
| `cms` | CMS Pages | Public | Static pages, FAQ, banners |
| `admin-catalog` | Products, Categories, Brands, Inventory (admin views) | `admin`, `inventory_manager` | Bulk import, variant/image management, low-stock list |
| `admin-orders` | Orders, Payments, Shipping (admin) | `admin`, `support_agent` | Status overrides, refunds, shipment/zone/rate management |
| `admin-coupons` | Coupons (admin) | `admin` | CRUD |
| `admin-cms` | CMS Pages, Banners, FAQ (admin) | `admin` | CRUD |
| `admin-staff` | Admin (staff) | `admin` | Staff accounts, role assignment (last-admin-protected server-side) |
| `admin-analytics` | Analytics | `admin` | Sales, top products, customers, abandoned carts, CSV export |
| `admin-audit-logs` | Audit Logs | `admin` | Read-only log viewer |
| `admin-settings` | Settings | `admin` | Platform settings, tax rules |

**Boundary rule:** if `admin-orders` needs to show a product name inside an order line item, it renders data the **order** endpoint already returned (order items are denormalized snapshots server-side per DDD — order items are immutable once created), not a live call into `products.service.ts`. This mirrors the backend's own module-boundary discipline (confirmed in the audit: modules call each other's public `index.ts` surface, never reach into another module's repository).

---

## 6. API Integration Architecture

### 6.1 Request Flow

```
Component/hook calls a feature hook (e.g. useAddToCart())
  → hook calls services/cart.service.ts::addItem()
    → service calls lib/api-client.ts::apiClient.post('/cart/items', body)
      → apiClient attaches Authorization (if present) or X-Guest-Cart-Id
      → fetch() executes
      → apiClient unwraps { success, data, meta } → returns data
      → on 401: apiClient attempts one silent /auth/refresh, retries original call once
      → on any other error: apiClient throws typed ApiError built from the RFC-7807 body
    ← service returns typed CartView
  ← hook feeds result into React Query cache, returns { data, isPending, error } to the component
```

### 6.2 API Service Organization
One file per backend module under `services/`, each exporting plain async functions (not a class) — e.g.:

```ts
// services/cart.service.ts
export async function getCart(ctx: CartContext): Promise<CartView> { ... }
export async function addItem(ctx: CartContext, body: AddCartItemBody): Promise<CartView> { ... }
export async function updateItem(ctx: CartContext, itemId: string, quantity: number): Promise<CartView> { ... }
export async function removeItem(ctx: CartContext, itemId: string): Promise<CartView> { ... }
export async function applyCoupon(ctx: CartContext, code: string): Promise<CartView> { ... }
```
`CartContext` mirrors the backend's own `getContext(req)` shape (`{ userId?: string; guestCartId?: string }`, confirmed in `cart.controller.ts`) — the frontend's context type deliberately shadows the backend's so the guest/registered duality is explicit at every call site, not hidden behind a global.

### 6.3 API Types
`types/api/<module>.ts` hand-maintains TypeScript interfaces mirroring the backend's actual response shapes (verified against controllers, not assumed from the OpenAPI schema — see Section 0). No codegen from `openapi.yaml` is recommended until the audit's P3-1 finding (69% coverage) is remediated; generating types from an incomplete spec would silently omit real endpoints (auth verification, sessions) and encode 10 endpoints that don't exist.

### 6.4 Error Normalization
Every non-2xx response is converted into one shape:
```ts
class ApiError extends Error {
  status: number;
  code: string;            // e.g. "COUPON_EXPIRED", "OUT_OF_STOCK"
  userMessage: string;     // safe to render directly (server already sanitized it)
  validationErrors?: { field: string; message: string }[];
  requestId: string;       // for support/bug-report correlation
}
```
This maps directly onto the backend's `ProblemDetails` shape (API Design Spec §7, confirmed identical in `app-error.ts`). UI code should render `userMessage` and, for `422` with `validationErrors`, map each entry onto the corresponding form field — never render `detail` (technical, not customer-safe) to an end user.

### 6.5 Route Handlers — Scope Restriction
`app/api/` Route Handlers exist **only** for concerns that must run on the Next.js server rather than the browser: none are currently required for MVP, since the backend already provides HttpOnly cookie-based refresh and CORS is configured for direct browser-to-API calls (`CORS_ORIGIN` in backend `env.ts`). If a future need arises (e.g., proxying the Stripe webhook forward isn't needed — that's backend-to-Stripe only), a Route Handler should be added deliberately, not used as a default proxy layer, to avoid duplicating the backend's own API surface.

### 6.6 Retry & Timeout
- **Timeout:** 10s default per request (product listing/search may warrant a slightly longer ceiling given full-text search), surfaced as a retryable `ApiError` with `code: 'REQUEST_TIMEOUT'`.
- **Retry:** React Query's default retry (3x, exponential backoff) is used for `GET` requests only. Mutations (`POST`/`PATCH`/`DELETE`) are **never** auto-retried by the client except the explicit 401-refresh-retry-once flow — retrying a checkout confirmation or payment call automatically would be actively dangerous without the caller controlling the `Idempotency-Key` (Section 6.7), so those retries are surfaced to the user as an explicit "Try again" action, not silent.

### 6.7 Idempotency-Key Handling
The backend requires `Idempotency-Key` on: `POST /checkout/sessions/{id}/confirm` and `POST /orders/{orderId}/refunds` (confirmed in `checkout.controller.ts` and API Design Spec §9.17). The frontend generates a UUID **once per checkout attempt** (stored in `checkout-store.ts`, not regenerated on retry) so that a network-level retry of the same user action reuses the same key and safely returns the original order rather than creating a duplicate.

---

## 7. Authentication Architecture

### 7.1 Actual Backend Flow (verified in `auth.controller.ts`, `auth.routes.ts`, `cookie.util.ts`, `jwt.util.ts`)

| Step | Endpoint | Notes |
|---|---|---|
| Register | `POST /api/v1/auth/register` | Rate-limited (5/15min). Returns `{ userId, verificationRequired }`. No token issued — user must log in separately. |
| Verify email | `POST /api/v1/auth/verify-email` | Signed, time-limited token from email link. **Not in the API Design Spec's endpoint table but exists in code** — include it. |
| Verify phone | `POST /api/v1/auth/verify-phone` | OTP, 6-digit. Also undocumented in the spec but real. |
| Login | `POST /api/v1/auth/login` | Body: `{ identifier, password }` (not separate email/phone fields). Response: `{ accessToken, user }` in body + `Set-Cookie: refreshToken=...; HttpOnly; Secure(prod); SameSite=Strict; Path=/api/v1/auth`. |
| Refresh | `POST /api/v1/auth/refresh` | Cookie-only, no `Authorization` header needed. Rotates the refresh cookie on every call. Reuse of an already-rotated token revokes the whole session family. |
| Logout | `POST /api/v1/auth/logout` | Requires `Authorization`. Revokes the refresh token family server-side, clears the cookie. Returns `204`. |
| Password reset request | `POST /api/v1/auth/password-reset/request` | Always returns success regardless of whether the account exists (enumeration protection) — the frontend must show the same generic message either way, never branch on existence. |
| Password reset confirm | `POST /api/v1/auth/password-reset/confirm` | Revokes **all** existing sessions on success — the frontend should tell the user they'll need to log in again on other devices. |
| List sessions | `GET /api/v1/auth/sessions` | Returns active refresh-token families (`id`, `familyId`, `createdAt`, `expiresAt`) — this is the data source for PRD FR-011 ("log out of all devices" / view active sessions). |
| Revoke session | `DELETE /api/v1/auth/sessions/{sessionId}` | Ownership enforced server-side by construction (query scoped to the caller). |

### 7.2 Access Token Handling
The access token is held **in memory only** (a React Query-managed value or a small non-persisted Zustand slice) — never in `localStorage`/`sessionStorage`, matching SDD §4's explicit constraint ("holds no secrets beyond a short-lived access token in memory"). On a hard page refresh, the token is gone by design; the app calls `POST /auth/refresh` once on boot (relying on the HttpOnly cookie) to silently re-establish a session before rendering any auth-gated UI.

### 7.3 Refresh Token / Cookie Strategy
Entirely backend-owned. The frontend never reads, writes, or inspects the `refreshToken` cookie directly (it's `HttpOnly` — JS cannot access it). The frontend's only job is to ensure `credentials: 'include'` is set on every `fetch` call so the browser sends/receives the cookie, and to call `/auth/refresh` at the right moments (Section 7.4).

### 7.4 Session Management / Silent Refresh Flow
1. On app boot, call `POST /auth/refresh`. Success → populate the in-memory access token and user object, render authenticated UI. Failure (`401`) → treat as logged out, render public UI.
2. On any API call that returns `401` with `code: INVALID_TOKEN` or `MISSING_TOKEN`, the API client attempts exactly one `/auth/refresh`, then retries the original request once with the new token. A second `401` after that is treated as a real logout (clear in-memory state, redirect to `/login` if the route requires auth).
3. `REFRESH_TOKEN_REUSE_DETECTED` (theft signal — full family revoked server-side) is treated identically to an unrecoverable logout, with no retry.

### 7.5 Protected Routes
Enforced at two layers:
- **`middleware.ts`** (Next.js edge middleware): redirects unauthenticated requests away from `(storefront)/account/*` and unauthorized roles away from `(admin)/admin/*`, based on a lightweight signal (e.g., presence of the refresh cookie — middleware cannot verify the JWT without duplicating backend secrets, so this is a **UX-level** redirect, not a security boundary).
- **Actual data fetches**: every protected page still calls the real API, which is the only place authorization is actually enforced (RBAC on the server, per SDD §9.4/SEC-002). If middleware's cookie-presence check is ever wrong (e.g., stale cookie), the API call fails with `401`/`403` and the UI reacts normally (Section 7.6) — middleware is a convenience, not a guarantee.

### 7.6 Handling 401 / 403 / 422 / 409
| Status | Meaning (per API Design Spec §7–8, confirmed in `app-error.ts`) | Frontend behavior |
|---|---|---|
| `401` | Missing/invalid/expired access token, or bad credentials | Attempt silent refresh once (Section 7.4); if that fails, clear session and redirect to `/login` with a `returnTo` param. For `/auth/login` itself, `401 INVALID_CREDENTIALS` renders as a generic inline form error — never reveal which field was wrong (server doesn't either). |
| `403` | Authenticated but insufficient role, or a specific business-eligibility gate (e.g., `REVIEW_NOT_ELIGIBLE`) | Render the server's generic `userMessage`; for role-based `403` on an admin route, redirect to the admin dashboard (the user is staff, just the wrong kind) rather than logging them out. |
| `422` | Validation or business-rule failure | Map `validationErrors[].field` onto the corresponding form field via React Hook Form's `setError`; for business errors without a specific field (e.g., `COUPON_EXPIRED`), show `userMessage` as a toast/inline banner near the relevant control. |
| `409` | State conflict (stock changed, duplicate SKU, cancellation window closed) | Never silently retried. Show the specific conflict inline (e.g., cart line item flagged "only 2 left" per SRS FR-057's exact requirement) and require explicit user action to proceed. |

---

## 8. State Management

| State category | Where it lives | Examples |
|---|---|---|
| **Server state** | React Query | Products, cart, wishlist, orders, addresses, admin lists — anything that originates from the API. Query keys are structured per-resource (`['cart']`, `['products', filters]`, `['orders', orderId]`) so targeted invalidation (Section 9) is precise. |
| **Auth state** | A thin `AuthProvider` (React context) backed by React Query (`useQuery(['session'], ...)` for the current user, refetched by the refresh flow) — **not** Zustand, since it's fundamentally server-derived state with a specific lifecycle (Section 7.4) | Current user, role, `isAuthenticated` |
| **Guest identity** | `lib/guest-cart.ts`, persisted to a first-party cookie (not `localStorage`, so it survives and is consistently available to both client and any future server-rendered cart preview) | `guestCartId` (UUID, generated client-side, sent as `X-Guest-Cart-Id`) |
| **Client/UI state** | Zustand (`stores/ui-store.ts`) | Cart drawer open/closed, mobile nav open, admin sidebar collapsed |
| **Form state** | React Hook Form (local to the form's component tree) | Checkout address form, product create/edit form, login/register forms |
| **In-progress checkout state** | Zustand (`stores/checkout-store.ts`) | Current step, the generated `Idempotency-Key` for this attempt (Section 6.7), locally-drafted (not-yet-submitted) shipping selection |

**What must NOT be stored globally:** product catalog data outside React Query's cache (no duplicating it into Zustand "for convenience"); the access token in any persisted store; any PII beyond what the current screen needs (e.g., don't hydrate a global "all addresses" store when only the checkout flow needs them — let React Query's per-query cache handle it, scoped by query key).

---

## 9. Data Fetching & Caching

| Domain | Strategy |
|---|---|
| **Products** | `GET /products` and `GET /products/{id}` are public, cacheable. Use Next.js **ISR** (revalidate on a moderate interval, e.g. 5–10 minutes, matching the backend's own Redis product-cache TTL per SDD §11) for product/category pages, plus React Query on the client for any client-side re-fetch (filter changes, pagination) after initial hydration. Cursor pagination (API Design Spec §12) — client stores `nextCursor` from the response and passes it forward; no offset/page-number UI for the storefront catalog. |
| **Cart** | Always client-fetched (never cached at the CDN/ISR layer — it's inherently personal, matches SDD §19 "dynamic/personalized content... not cached at edge"). React Query with a short `staleTime` (~0, always revalidate on mount/focus) since stock/price can change between visits. Every mutation (`addItem`, `updateItem`, etc.) invalidates `['cart']`. |
| **Wishlist** | Same pattern as cart, scoped to `['wishlist']`, registered-users-only. |
| **Orders** | List: cursor-paginated, `['orders', filters]`. Detail: `['orders', orderId]`, moderate `staleTime` (order status doesn't change every second) with an explicit refetch button/action on the order-tracking screen rather than aggressive polling — no WebSocket exists yet server-side (API Design Spec §20 lists it as a future enhancement), so real-time status is **not** available; design the UI around "refresh to check" rather than implying live updates. |
| **Inventory (admin)** | `PATCH /inventory/{variantId}` requires an `If-Match` header carrying the current `version` (optimistic concurrency, confirmed in the actual route and DDD §14.1) — the admin inventory-edit form must read and hold the `version` field from the last fetch and send it back; a `412` response means someone else changed it first, and the UI must refetch and show the new value rather than blindly retrying. |
| **Admin analytics** | Explicit date-range-scoped queries (`['analytics', 'sales', range]`), fetched on demand (not polled), with a manual "Refresh" affordance — these are reporting views, not live dashboards. |
| **Pagination (general)** | Cursor-based everywhere per API Design Spec §12 — implement as "Load more" / infinite-scroll-style UX for the storefront, and a "Next page" cursor button for admin tables (admin tables can still be cursor-based even though they feel like classic pagination — there's no offset fallback in the actual contract for high-volume resources). |
| **Optimistic updates** | Used narrowly, only where the failure mode is cheap to reconcile: cart quantity `+`/`-` steppers and wishlist add/remove. **Not** used for checkout confirmation, payment, or any inventory-affecting admin write — those always wait for the server response given their financial/stock impact. |
| **Loading/error states** | Every feature's list/detail hook returns React Query's standard `{ data, isPending, isError, error }`; shared `components/shared/EmptyState.tsx` and `ErrorState.tsx` render consistent UI, with `ErrorState` consuming the normalized `ApiError` (Section 6.4) to show `userMessage`. |

---

## 10. Forms & Validation

- **Every** form uses React Hook Form + a Zod schema via `zodResolver`, defined in `schemas/<domain>.schema.ts`.
- Frontend validation schemas are **modeled after**, but not code-shared with, the backend's Zod schemas (`*.validators.ts` files) — they cannot be literally shared since they live in separate deployables and the backend's schemas may encode server-only concerns (e.g., password hash timing). Where a validation rule matters twice (e.g., password minimum length, PRD §15.1), it is intentionally duplicated in both places.
- **Frontend validation is UX-only.** Every submit still hits the real endpoint, and the `422 validationErrors` response is the authoritative source of field errors — the UI's job is to catch obvious mistakes before a round-trip, not to replace server enforcement. This is a hard project rule (PRD §10, and reiterated by the task brief for this document).
- Validation-heavy admin forms (product create/edit, coupon create) mirror the corresponding backend Zod schema's shape field-for-field so a server-side `422` can always be mapped onto an existing client field — no "unmapped validation error" dead-ends.

---

## 11. Error Handling

Centralized around the `ApiError` shape (Section 6.4). UI-level behavior by status:

| Status | UI Behavior |
|---|---|
| `400` | Should be rare (malformed request/missing required header) — treated as a client bug; log to error reporting (Section 20), show a generic "Something went wrong" with a retry action. |
| `401` | Section 7.6 |
| `403` | Section 7.6 |
| `404` | Dedicated not-found UI per resource type (product not found ≠ order not found ≠ page not found) — `app/not-found.tsx` for route-level 404s, inline `EmptyState` variants for resource-level 404s within an otherwise-valid page. |
| `409` | Section 7.6 — always requires explicit user acknowledgment/action, never auto-resolved. |
| `422` | Section 7.6 / Section 10 |
| `429` | Read `Retry-After` header (confirmed present per API Design Spec §16) and show a countdown/"try again in Ns" message rather than a generic error — especially important on login/checkout given the tight rate limits (5 login attempts/15min). |
| `500` / `502` / `503` | Generic, safe "we're having trouble — try again shortly" messaging (never surface `detail`); these map to `AppError.isOperational = false` server-side (confirmed in `app-error.ts` for `ExternalServiceError`), meaning the backend itself treats them as unexpected — the frontend should not attempt to interpret them further, just retry-affordance + log. |

`app/error.tsx` (Next.js error boundary) catches any unhandled render-time exception and reports it (Section 20) without exposing a stack trace to the user.

---

## 12. Routing Architecture

### 12.1 Public Routes
```
/                                  Homepage (featured/trending, PRD §10.3)
/products                          Listing (search/filter/sort results)
/products/[slug]                   Product detail
/categories/[slug]                 Category listing
/cart                              Cart
/checkout                          Multi-step: address → shipping → payment → review (PRD §10.4)
/checkout/confirmation/[orderId]   Order confirmation
/login
/register
/forgot-password
/reset-password
/[slug]                            CMS static pages (About, Terms, Privacy, FAQ landing) — lowest route priority, catch-all against `GET /cms/pages/{slug}`
```

### 12.2 Authenticated Customer Routes (`/account/*`, `customer` role or any authenticated user)
```
/account/orders
/account/orders/[orderId]
/account/addresses
/account/wishlist
/account/sessions
/account/profile
```
Wishlist is authenticated-only server-side (no guest wishlist exists per PRD §10.2) — `/wishlist` is not a public route; guests attempting to "save" are prompted to log in, matching the PRD's stated UX.

### 12.3 Admin/Staff Routes (`/admin/*`, RBAC-gated per Section 5's table)
```
/admin/dashboard                   admin, inventory_manager, support_agent (scoped view)
/admin/orders                      admin, support_agent
/admin/products                    admin, inventory_manager
/admin/inventory                   admin, inventory_manager
/admin/coupons                     admin
/admin/shipping                    admin
/admin/cms                         admin
/admin/staff                       admin only
/admin/audit-logs                  admin only
/admin/analytics                   admin only
/admin/settings                    admin only
```
**Not invented:** no `/admin/reviews` moderation route exists as a first-class page separate from the product/review detail context, since the only backend capability is `DELETE /reviews/{reviewId}` (admin-only, moderation) — this is exposed inline on the relevant product's review list in the admin product detail view, not as a standalone top-level nav item, since the backend provides no `GET /admin/reviews` listing endpoint. If a dedicated moderation queue is wanted, it requires a **new backend endpoint** and is out of scope for this document (Section 0 — no APIs invented).

### 12.4 Route Protection Strategy
`middleware.ts` provides the fast-path redirect (Section 7.5); every `(admin)` layout additionally checks the resolved user's role client-side (post-hydration) before rendering role-specific nav items, and every admin page's data fetch will itself fail with a real `403` if middleware's check was ever bypassed or stale — defense in depth, matching the backend's own "never rely on the client to hide unauthorized actions" posture (SEC-002).

---

## 13. Component Architecture

- **UI primitives** (`components/ui/`): shadcn/ui-sourced — `Button`, `Input`, `Dialog`, `Select`, `Combobox`, `Tabs`, `Toast`, etc. Zero business logic, zero API knowledge.
- **Shared components** (`components/shared/`): domain-agnostic but ShopSmart-specific — `PriceDisplay` (currency formatting, discount strikethrough per PRD §10.2's "discounted price if applicable"), `StockBadge`, `RatingStars`, `EmptyState`, `ErrorState`, `Pagination`/`LoadMore` (cursor-aware), `RoleGate` (renders children only if the current user's role is in an allowed set — UX convenience wrapper around Section 7.6's server-enforced reality).
- **Feature components** (`features/<domain>/components/`): compose UI primitives + shared components with feature hooks — e.g. `features/cart/components/CartLineItem.tsx`, `features/checkout/components/ShippingMethodStep.tsx`.
- **Layouts**: `app/(storefront)/layout.tsx` (header/nav/footer for public+account), `app/(admin)/admin/layout.tsx` (sidebar nav scoped by role, per Section 12.3).
- **Page components**: thin — a page composes 1+ feature components and handles route-level concerns (params, metadata) only; no business logic in `app/**/page.tsx` files themselves, mirroring the backend's own "thin controller" discipline (Backend Standards §5, confirmed in the audit).
- **Forms, tables, modals, dialogs, notifications, loading/error/empty states**: forms live in their owning feature; a shared `DataTable` (admin-focused, cursor-pagination-aware) is used across every admin list screen (orders, products, coupons, staff, audit logs) rather than one-off tables per screen.

---

## 14. UI/UX Integration

**No UI/UX design files (mockups, Figma exports, wireframes) were found in the provided ZIP.** The `docs/` tree contains only PRD/SRS/SDD/DDD/API-Design/Backend-Standards and the two audits — no `07-ui-ux` or design-asset directory exists.

**Explicitly marked as NOT decided by this document** (per the task's own instruction: don't invent a final visual design when none is provided):
- Visual design language, color palette, typography scale, spacing scale beyond Tailwind's defaults
- Exact homepage layout/hero treatment
- Product card visual density (grid columns at each breakpoint, image aspect ratio)
- Checkout step visual treatment (single-page vs. wizard-with-progress-bar — this document specifies the *information architecture* of the 4 steps per PRD §10.4, not their visual presentation)
- Admin console visual density/branding

These are legitimate UI/UX design decisions that should be made in a dedicated design phase before component-level implementation begins; this document defines the *functional* component/page structure they'll be applied to (Sections 12–13), not the final visual design.

---

## 15. Responsive Architecture

| Breakpoint | Behavior |
|---|---|
| **Mobile** (<640px) | Bottom or hamburger nav; single-column product grid; cart as a full-screen route/sheet rather than a side drawer; checkout steps stacked, one step visible at a time (matches PRD persona "Ayesha... browses on mobile during commute"). Admin console: not optimized for mobile-first (internal tool), but must remain usable — collapse sidebar to an icon rail. |
| **Tablet** (640–1024px) | 2–3 column product grid; cart drawer becomes viable; admin tables gain horizontal scroll rather than column-hiding, to avoid silently hiding data staff need. |
| **Desktop** (≥1024px) | Full multi-column layouts; cart as a persistent slide-over drawer; admin dashboard uses multi-panel layouts (summary cards + charts side-by-side). |

Navigation, product grids, and checkout responsiveness directly serve PRD §17's "checkout completable in 3 steps or fewer for a returning customer" — for a returning customer with a saved address and payment method, the mobile checkout flow should be capable of collapsing address+shipping into a single reviewed step rather than forcing three full screens.

---

## 16. Security Architecture

| Concern | Frontend Responsibility |
|---|---|
| **XSS** | Never use `dangerouslySetInnerHTML` for user-generated content (reviews, profile fields) — React's default escaping is sufficient and matches the backend's own output-encoding stance (SDD §10). CMS page HTML content (`GET /cms/pages/{slug}`) originates from admin-authored content, not arbitrary user input, but should still be sanitized client-side (e.g. via `rehype-sanitize` if rendered as HTML/MDX) as defense-in-depth. |
| **CSRF** | The access token travels only via `Authorization: Bearer` (not a cookie), which is not attacker-triggerable via a plain cross-site request — the independent audit confirms this design is sound and that the lack of an extra CSRF token is an accepted trade-off, not a gap. The frontend must not weaken this by ever moving the access token into a cookie. |
| **Token storage** | Access token: memory only (Section 7.2). Refresh token: never touched by frontend code — `HttpOnly` cookie, backend-managed entirely. No token of any kind in `localStorage`/`sessionStorage`. |
| **Sensitive data exposure** | Never log request/response bodies containing passwords, tokens, or payment details client-side, even in dev-mode console logs; the backend's own audit flagged exactly this class of leak (F-1, raw reset token in debug logs) as a real regression — the frontend should not reintroduce an equivalent mistake in browser console/error-reporting breadcrumbs (Section 20). |
| **Route protection** | Section 12.4 — UX-layer only, never the actual authorization boundary. |
| **Environment variables** | Section 19 — strict public/secret separation; no backend secret (JWT signing key, Stripe secret key, DB URL) is ever referenced from frontend code, since none of them are needed there. |
| **Secure API communication** | All calls over HTTPS in every environment above local dev; `credentials: 'include'` scoped correctly so the refresh cookie is only ever sent to the actual API origin. |
| **Payment security** | Raw card data never touches the frontend's own state or any custom form field — Stripe's own client-side Elements/SDK (tokenizing directly to Stripe) is the only acceptable way to collect card input, matching the backend's explicit "raw card data never touches platform servers" constraint (PRD §10.5) — this applies equally to the frontend, which must not add its own card `<input>` fields. |

---

## 17. Performance

- **Code splitting**: route-based by default (Next.js App Router); the admin console's bundle is naturally split from the storefront's since they're separate route groups — no admin-only dependency (e.g., chart library for analytics) should leak into the storefront's client bundle.
- **Lazy loading**: heavy, admin-only, or below-the-fold widgets (analytics charts, the rich-text CMS editor, image cropping tools for product image upload) loaded via `next/dynamic` with `ssr: false` where they're client-only anyway.
- **Image optimization**: `next/image` for all product/category imagery, sourced from Cloudinary URLs (the backend stores only Cloudinary URLs/public IDs, per SDD §12) — Cloudinary's own transformation URLs can be combined with `next/image`'s `loader` to avoid double-processing.
- **Caching**: Section 9's per-domain strategy; category/CMS pages additionally benefit from Next.js's own full-route cache (ISR) where content isn't user-specific, directly serving PRD §19's CDN-edge-caching expectation.
- **Bundle optimization**: Tailwind's JIT + shadcn's "owned source" component model avoids importing an entire component-library bundle for a handful of primitives; Zustand and TanStack Query are both intentionally small.
- **SSR/CSR split**: storefront read-heavy pages (home, listing, detail, category, CMS) render as Server Components with ISR; anything requiring the user's identity or mutating state (cart, checkout, account, all of `/admin`) is a Client Component tree hydrated after the RSC shell — matching the SDD's own reasoning that "personalized content... not cached at edge."
- **Minimizing unnecessary API requests**: React Query's cache + `staleTime` tuning per Section 9 avoids re-fetching unchanged data on every navigation; debounced search input (PRD §10.3: autocomplete after 2+ characters) prevents a request per keystroke.

---

## 18. Testing Architecture

| Level | Scope | Tooling |
|---|---|---|
| **Unit** | Pure functions: `lib/api-client.ts`'s envelope-unwrap/error-normalization logic, Zod schemas, formatting utils (`PriceDisplay` logic) | Vitest |
| **Component** | Individual components/feature hooks in isolation, with `msw` (Mock Service Worker) mocking the API contract (built from the actual verified endpoint shapes, Section 21 — not the incomplete OpenAPI spec) | Vitest + React Testing Library + MSW |
| **Integration** | A feature's full flow against a mocked API layer (e.g., "add to cart → apply coupon → see updated subtotal" using MSW handlers that mirror real response shapes including error cases like `409` stock conflicts) | Vitest + RTL + MSW |
| **E2E** | Real cross-page user journeys against a real (staging) backend instance: guest checkout end-to-end, registered login + order history, admin RBAC (an `inventory_manager` cannot reach `/admin/staff`), refresh-token rotation surviving a page reload | Playwright |

**What should be tested at each level**, concretely: unit-test the 401→refresh→retry-once logic in isolation (it's easy to get subtly wrong); component-test that a `422` with `validationErrors` correctly populates React Hook Form field errors; integration-test the full guest-to-registered cart-merge-adjacent flow if/when it's designed (not currently specified server-side — flagged as an open question in Section 22); E2E-test that an `inventory_manager` genuinely cannot load `/admin/staff` (both the middleware redirect AND the underlying API's `403`, since middleware alone is not the real boundary per Section 12.4).

---

## 19. Environment Configuration

| Variable | Public/Secret | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Public | e.g. `https://api.shopsmart.ai/api/v1` — must match the backend's own `API_BASE_PATH`/deployment origin exactly |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe Elements client-side init — the *publishable* key only; the secret key lives exclusively in the backend's `STRIPE_SECRET_KEY` and is never referenced here |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public | For constructing Cloudinary transformation URLs client-side |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical URL base for SEO metadata (sitemap, OG tags, canonical links — PRD §21) |

No frontend environment variable should ever hold a database URL, JWT signing secret, Stripe secret key, or Resend API key — all of those are exclusively backend concerns (confirmed present only in the backend's `env.ts`, never needed client-side given the architecture in Section 7).

**Environments:** `development` (points at local backend, `http://localhost:4000/api/v1`, matching the backend's own default `PORT: 4000`), `staging`, `production` — mirroring the backend's own `NODE_ENV` enum (`development | staging | production | test`, confirmed in backend `env.ts`) so environment naming stays consistent across both halves of the stack.

---

## 20. Observability & Logging

- **Client-side error reporting**: any error-reporting integration (e.g. Sentry) must scrub request/response bodies of `password`, `token`, `accessToken`, `paymentMethodToken`, and any `Authorization` header value before a breadcrumb/log is sent — directly analogous to the backend's own logging-policy discipline, and a direct lesson from the backend audit's F-1 finding (a raw secret token leaking into logs at debug level). No payment card data ever exists in frontend memory to begin with (Section 16), so there is nothing to scrub there beyond confirming it's never captured.
- **Correlation**: every API response includes `meta.requestId` (or `error.requestId` on failure) — the frontend should attach this ID to any client-side error report so a user-reported issue can be correlated with the backend's own structured logs (which are keyed by the same correlation ID per SDD §15).
- **What is never logged, client or server**: passwords, raw tokens (access, refresh, password-reset), full card numbers/CVV (never present client-side at all), and full request bodies on auth endpoints.

---

## 21. Frontend ↔ Backend Contract

This table reflects the **actual route surface**, verified directly against `shopsmart-backend/src/modules/*/*.routes.ts` (Section 0) — not the OpenAPI file, which the independent audit found to be materially incomplete (69% coverage, missing the entire verification/session/password-reset surface).

| Frontend Feature | Backend Module | Endpoint(s) (method + path) | Auth | Role(s) |
|---|---|---|---|---|
| Register | Auth | `POST /auth/register` | No | — |
| Verify email | Auth | `POST /auth/verify-email` | No | — |
| Verify phone | Auth | `POST /auth/verify-phone` | No | — |
| Login | Auth | `POST /auth/login` | No | — |
| Refresh | Auth | `POST /auth/refresh` | Cookie only | — |
| Logout | Auth | `POST /auth/logout` | Bearer | any |
| Password reset request | Auth | `POST /auth/password-reset/request` | No | — |
| Password reset confirm | Auth | `POST /auth/password-reset/confirm` | No | — |
| List sessions | Auth | `GET /auth/sessions` | Bearer | any |
| Revoke session | Auth | `DELETE /auth/sessions/{sessionId}` | Bearer | any (owner, enforced by query scope) |
| Get/update/delete profile | Users | `GET/PATCH/DELETE /users/me` | Bearer | any |
| Addresses CRUD | Users | `GET/POST /users/me/addresses`, `PATCH/DELETE /users/me/addresses/{addressId}` | Bearer | any (owner) |
| Categories browse/manage | Categories | `GET /categories`, `GET /categories/{id}`, `POST/PATCH/DELETE /categories/{id}` | Read: no / Write: Bearer | admin (write) |
| Brands browse/manage | Brands | `GET /brands`, `GET /brands/{id}`, `POST/PATCH/DELETE /brands/{id}` | Read: no / Write: Bearer | admin (write) |
| Product listing/detail | Products | `GET /products` (rate-limited "browse" tier), `GET /products/{id}` | No | — |
| Product CRUD | Products | `POST /products`, `PATCH/DELETE /products/{id}` | Bearer | admin, inventory_manager |
| Product images | Products | `POST /products/{id}/images`, `PATCH .../images/{id}/reorder`, `DELETE .../images/{id}` | Bearer | admin, inventory_manager |
| Product variants | Products | `POST/PATCH/DELETE /products/{id}/variants[/{variantId}]` | Bearer | admin, inventory_manager |
| Inventory view/update | Inventory | `GET /inventory/low-stock`, `GET /inventory/{variantId}`, `PATCH /inventory/{variantId}` (requires `If-Match`) | Bearer | admin, inventory_manager |
| Cart view/clear | Cart | `GET /cart`, `DELETE /cart` | Bearer or `X-Guest-Cart-Id` | customer or guest |
| Cart items | Cart | `POST /cart/items`, `PATCH/DELETE /cart/items/{itemId}` | Bearer or `X-Guest-Cart-Id` | customer or guest |
| Cart coupon | Cart | `POST/DELETE /cart/coupon` | Bearer or `X-Guest-Cart-Id` | customer or guest |
| Wishlist | Wishlist | `GET /wishlist`, `POST /wishlist/items`, `DELETE /wishlist/items/{productId}`, `POST /wishlist/items/{productId}/move-to-cart` | Bearer | customer |
| Coupon admin CRUD | Coupons | `GET/POST /coupons`, `PATCH/DELETE /coupons/{id}` | Bearer | admin |
| Coupon validate | Coupons | `POST /coupons/validate` | Optional | customer or guest |
| Checkout session | Checkout | `POST /checkout/sessions`, `GET /checkout/sessions/{id}` | Bearer or guest | customer or guest |
| Checkout confirm | Checkout | `POST /checkout/sessions/{id}/confirm` (requires `Idempotency-Key`) | Bearer or guest | customer or guest |
| Order list/detail | Orders | `GET /orders` (query-validated), `GET /orders/{orderId}` | Bearer | owner; admin/support_agent see all |
| Order cancellation | Orders | `POST /orders/{orderId}/cancellation` | Bearer | owner, admin |
| Delivery confirmation | Orders | `POST /orders/{orderId}/delivery-confirmation` | Bearer | owner |
| Order status override | Orders | `PATCH /orders/{orderId}/status` | Bearer | admin |
| Payments view/retry | Payments | `GET /orders/{orderId}/payments`, `POST /orders/{orderId}/payments/retry` | Bearer | owner |
| Refunds | Payments | `POST /orders/{orderId}/refunds` (requires `Idempotency-Key`) | Bearer | admin, support_agent |
| Shipping zones/rates (admin) | Shipping | `GET/POST /shipping/zones`, `POST /shipping/rates` | Bearer | admin |
| Shipment view | Shipping | `GET /orders/{orderId}/shipment` | Bearer | owner, admin, support_agent |
| Reviews | Reviews | `GET /products/{id}/reviews` (no auth), `POST /products/{id}/reviews` (customer, verified-purchase-gated), `DELETE /reviews/{id}` (admin moderation) | Mixed | see above |
| Notification preferences | Notifications | `GET/PATCH /users/me/notification-preferences` | Bearer | customer |
| CMS pages/FAQ/banners (public) | CMS | `GET /cms/pages/{slug}`, `GET /cms/faq`, `GET /cms/banners` | No | — |
| CMS admin CRUD | CMS | `POST/PATCH /cms/pages`, `POST/PATCH/DELETE /cms/banners`, `POST/PATCH/DELETE /cms/faq` | Bearer | admin |
| Analytics | Analytics | `GET /admin/analytics/sales|top-products|customers|abandoned-carts|export` | Bearer | admin |
| Admin dashboard/orders/staff | Admin | `GET /admin/dashboard/summary`, `GET /admin/orders`, `GET/POST /admin/staff`, `PATCH /admin/staff/{id}/role` | Bearer | admin (staff endpoints); support_agent, inventory_manager (scoped dashboard/orders per role) |
| Audit logs | Audit Logs | `GET /admin/audit-logs` | Bearer | admin |
| Settings | Settings | `GET/PATCH /admin/settings`, `GET/POST /admin/settings/tax-rules` | Bearer | admin |
| Stripe webhook | Payments | `POST /webhooks/stripe` | Signed webhook | — (backend-to-Stripe only; **frontend never calls this**) |

*(Request/response bodies for the highest-traffic endpoints are detailed in Sections 6–10; the full field-level shape for every endpoint should be pulled from the actual controller/validator pair at implementation time, per Section 0's methodology, rather than assumed from this summary table.)*

---

## 22. Complete Frontend Development Roadmap

**Phase 1 — Foundation**
Next.js 15 App Router scaffold, TypeScript strict config, Tailwind + shadcn/ui setup, `lib/api-client.ts` (envelope unwrap, error normalization, no auth yet), `config/env.ts`, ESLint/Prettier matching backend conventions, base layout shells (storefront + admin, empty).

**Phase 2 — Design System**
Port/theme shadcn primitives, build `components/shared/*` (PriceDisplay, StockBadge, EmptyState, ErrorState, RatingStars, DataTable shell), establish responsive breakpoint conventions (Section 15). *(Blocked on real UI/UX design input per Section 14 for anything beyond functional structure.)*

**Phase 3 — Authentication**
`auth` feature: register, login, verify-email/phone, password reset request/confirm, session list/revoke, the full silent-refresh flow (Section 7.4), `AuthProvider`, `middleware.ts` route protection.

**Phase 4 — Product Catalog**
`products` feature (public): listing with filters/sort/cursor-pagination, detail page with variants/images/stock status, category/brand browsing, ISR wiring, search with debounced autocomplete.

**Phase 5 — Cart & Wishlist**
`cart` feature (guest + registered dual identity, Section 8), `wishlist` feature, cart drawer/page UI, coupon application UX with `422`/business-error handling.

**Phase 6 — Checkout**
`checkout` feature: multi-step flow (address → shipping → payment → review per PRD §10.4), Stripe Elements integration (Section 16), idempotency-key lifecycle (Section 6.7), guest checkout path, order confirmation page.

**Phase 7 — Orders**
`orders` feature: history, detail, status display (mapped from the actual `OrderStatus` enum — `pending/confirmed/processing/shipped/delivered/cancelled/disputed/refunded`, which differs from the PRD's narrative "Packed" language — see Section 23 conflicts), cancellation, invoice download, payment retry.

**Phase 8 — Reviews**
`reviews` feature: display on product pages, submission form (gated by the server's verified-purchase check, `403 REVIEW_NOT_ELIGIBLE` handled gracefully), admin moderation entry point (Section 12.3).

**Phase 9 — Admin: Catalog & Inventory**
`admin-catalog`: product/category/brand CRUD, variant/image management, bulk import UX, low-stock list, optimistic-concurrency-aware inventory editing (`If-Match`/`version`, Section 9).

**Phase 10 — Admin: Orders, Shipping, Coupons, CMS, Settings**
`admin-orders` (status overrides, refunds), `admin-coupons`, shipping zones/rates, `admin-cms`, `admin-settings` (platform settings, tax rules).

**Phase 11 — Admin: Staff, Audit Logs, Analytics**
`admin-staff` (role management, last-admin-protection UX awareness), `admin-audit-logs` (read-only viewer), `admin-analytics` (sales/top-products/customers/abandoned-carts + CSV export).

**Phase 12 — Testing & Production Hardening**
Fill in the unit/component/integration/E2E coverage described in Section 18 across all prior phases (not deferred entirely to the end — each phase should land with its own tests; this phase closes remaining gaps), accessibility audit against WCAG 2.1 AA (PRD §20), performance pass against PRD §17/§19 targets, error-reporting/observability wiring (Section 20), final security review of Section 16's checklist.

---

## 23. Architecture Decisions (ADRs)

### ADR-FE-001: Next.js (SSR/ISR) over the SDD's Original React + Vite SPA Sketch
**Decision:** Next.js 15 App Router, not a client-only Vite SPA.
**Rationale:** SDD §4's high-level architecture diagram labels the client layer "React + Vite + TypeScript SPA," and the backend's `CORS_ORIGIN` default (`http://localhost:5173`) reflects that original assumption. However, the PRD's SEO requirements (§21: structured data, sitemap, canonical URLs, human-readable slugs) and performance requirements (§17/§19: sub-2s page loads, CDN-edge caching of category/CMS pages) are difficult to satisfy from a pure client-rendered SPA without bolting on a separate SSR/prerendering layer later — which is effectively "becoming Next.js" anyway, just later and with more migration cost. This document's task brief also explicitly directs evaluating and selecting a Next.js/React/TypeScript stack, which is treated as the authoritative, current instruction superseding the SDD's earlier sketch.
**Alternative Considered:** React + Vite SPA (the SDD's original sketch) — rejected for the reasons above. A separate static-site layer for SEO-critical pages only (hybrid) was also considered and rejected as unnecessary complexity given Next.js can serve both needs from one codebase.
**Consequence:** `CORS_ORIGIN` on the backend will need to be updated for whichever port/origin the Next.js dev server and production deployment actually use — this is a deployment/config concern, not a backend code change, and is flagged here rather than silently assumed.

### ADR-FE-002: Native `fetch` + Thin Wrapper over Axios
**Decision:** A single hand-rolled `lib/api-client.ts` around `fetch`, not Axios.
**Rationale:** The contract's needs (auth header injection, envelope unwrap, RFC-7807 error normalization, one-shot refresh-and-retry on `401`) are fully coverable in under ~150 lines; Axios's interceptor model doesn't meaningfully simplify this and adds bundle weight and an extra abstraction to learn.
**Alternative Considered:** Axios with interceptors — rejected as unnecessary given `fetch`'s current browser/Node support is sufficient and Next.js's own data-fetching extensions build on `fetch` natively.

### ADR-FE-003: TanStack Query for All Server State, Zustand Reserved for True Client State
**Decision:** No server-derived data (products, cart, orders, etc.) is ever mirrored into Zustand.
**Rationale:** Avoids the classic "two sources of truth" bug class (a Zustand copy of cart data going stale relative to React Query's cache after a mutation). Keeps `stores/` intentionally small (Section 4/8).
**Alternative Considered:** A single global Redux store for everything — rejected as it would reintroduce exactly the duplication this ADR avoids, plus materially more boilerplate for no corresponding benefit at this project's scale.

### ADR-FE-004: No Auth Library (NextAuth/Auth.js) — Custom Context Wrapping the Existing Backend Flow
**Decision:** Hand-rolled `AuthProvider` + `lib/api-client.ts` refresh logic, not NextAuth/Auth.js.
**Rationale:** The backend already fully implements JWT + rotating refresh tokens + HttpOnly cookies end-to-end (Section 7.1, verified in code, not assumed). NextAuth's provider/adapter model is designed to *own* this flow (including OAuth provider abstractions the PRD explicitly defers — §6, "future" social login) — adopting it here would mean adapting a library to fit a flow it didn't design, for less code than writing the ~200 lines of custom logic Section 7 actually requires.
**Alternative Considered:** NextAuth/Auth.js with a Credentials provider — rejected; would require nontrivial workarounds to delegate entirely to the backend's own token issuance/rotation rather than NextAuth's own session model, with unclear net benefit.

### ADR-FE-005: Types Hand-Maintained, Not Codegen'd from `openapi.yaml`
**Decision:** `types/api/*.ts` are hand-written and verified against actual controller/route code, not generated from the OpenAPI spec.
**Rationale:** Section 0 — the spec is confirmed 69% complete by the independent backend audit, missing the entire verification/session/password-reset surface and containing 10 phantom paths. Generating types from it today would silently omit real, needed endpoints and offer false confidence in ones that don't exist.
**Alternative Considered:** `openapi-typescript` codegen — not rejected permanently, just deferred; **revisit once the backend's OpenAPI doc is regenerated from the real route table** (a fix the audit already recommends on the backend side). At that point, codegen becomes strictly better than hand-maintenance and this ADR should be superseded.

### ADR-FE-006: Cursor Pagination UI Patterns over Classic Page Numbers
**Decision:** "Load more"/infinite-scroll for storefront lists, cursor-based "Next" for admin tables — no page-number UI anywhere against the primary contract.
**Rationale:** The backend deliberately chose cursor pagination for all high-volume endpoints (API Design Spec §12, ADR-API-006) specifically because offset pagination degrades and destabilizes under concurrent writes. A page-number UI implies random-access-by-page-index, which the API doesn't actually support for these resources — building that UI would misrepresent the underlying capability.
**Alternative Considered:** Classic numbered pagination — rejected as architecturally dishonest given the actual API shape; reserved only for the few small, inherently-bounded admin lists the spec itself flags as exceptions (e.g., `ShippingZone`), if a convenience `page`/`pageSize` alias is confirmed to exist for those specific endpoints at implementation time.

---

## Summary

**Architecture summary:** ShopSmart AI's frontend is a Next.js 15 (App Router) application split into three experiences — public/SEO-critical storefront (SSR/ISR), authenticated customer account area, and an RBAC-gated internal admin console — all consuming the existing, stable `/api/v1` REST contract through a single typed API client. Server state (products, cart, orders, wishlist, admin resources) lives in TanStack Query; genuine client-only UI state lives in a deliberately small Zustand footprint; authentication mirrors the backend's actual JWT-access-token-in-memory + HttpOnly-rotating-refresh-cookie design exactly, with no auth library fighting that design. The architecture treats server-side authorization as the only real security boundary throughout (Sections 7, 12, 16).

**Technology decisions:** Next.js 15, React 19, TypeScript strict, Tailwind + shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod, native `fetch`-based API client, custom auth (no NextAuth), Vitest/RTL/Playwright — each justified against this specific project's actual backend behavior and PRD constraints in Section 2, not generic defaults.

**Important assumptions:**
1. The backend's actual route surface (verified directly in source, Section 0/21) is authoritative over both `openapi.yaml` and the API Design Specification wherever they disagree.
2. No UI/UX design assets exist in the provided project (Section 14) — this document specifies functional/information architecture only; visual design is a separate, not-yet-done phase.
3. No WebSocket/real-time order-status channel exists server-side yet (it's a documented future enhancement) — order tracking UX is refresh-based, not live, until that changes.
4. A cart guest→registered merge-on-login flow is **not specified anywhere in the provided backend code or docs** — flagged as an open question (see Conflicts below), not assumed.

**Conflicts discovered between documents and actual backend:**
1. **SDD's original client stack sketch ("React + Vite SPA") vs. this task's Next.js instruction** — resolved in favor of Next.js per ADR-FE-001, with the resulting `CORS_ORIGIN` config implication flagged, not silently patched.
2. **OpenAPI spec vs. actual routes** — 69% coverage per the independent audit; this document was built from actual route files, not the spec (Section 0).
3. **PRD's narrative order-lifecycle labels ("Packed", "Out for Delivery" — PRD §13) vs. the actual implemented `OrderStatus` enum** (`pending, confirmed, processing, shipped, delivered, cancelled, disputed, refunded` — from `prisma/schema.prisma`) — the frontend must display status based on the **real enum values**, not the PRD's narrative labels; a status-label mapping/copy layer should translate `processing` → a customer-friendly string like "Preparing your order," but the underlying state machine the UI branches on is the Prisma enum, not the PRD prose.
4. **Guest cart → registered cart merge on login is unspecified.** Neither the PRD, SDD, DDD, nor the actual `cart` module code (`cart.controller.ts`/`cart.service.ts`, as far as verified) describes what happens to a guest's Redis-backed cart when that guest subsequently logs in or registers. This is a real product/backend gap, not something the frontend can safely assume or paper over — it should be raised with the backend team before Phase 5 (Cart & Wishlist) implementation begins, since the frontend's guest-identity handling (Section 8) needs to know whether to call a merge endpoint, silently drop the guest cart, or something else.

---

*End of Document. This Frontend Architecture Document is ready for developer implementation, subject to the open items flagged above (guest-cart merge behavior, and a real UI/UX design pass) being resolved before the corresponding phases begin.*
