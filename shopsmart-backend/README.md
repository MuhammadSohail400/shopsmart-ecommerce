# ShopSmart AI — Backend (Phase 1–4)

Implements the **Foundation**, **Identity & Access**, **Product Catalog**, and **Cart & Promotions** phases per the
approved PRD → SRS → System Design → Database Design → API Design → Backend Standards docs.

## What's included

- **Phase 1 — Foundation:** env validation (Zod), Prisma/Redis/Pino config, global error handler,
  custom error hierarchy, correlation-ID middleware, rate limiter, validate/auth/RBAC middleware
- **Phase 2 — Identity & Access:** `auth` module (register, login, refresh-token rotation +
  reuse detection, logout, sessions, password reset) and `users` module (profile + addresses)
- **Phase 3 — Catalog:** `categories`, `brands`, `products` (+ variants + images), `inventory`
  (optimistic locking via `If-Match` header, per DDD Section 14)
- **Phase 4 — Cart & Promotions:** `cart`, `wishlist`, `coupons` modules, supporting guest and
  authenticated carts, wishlist management, coupon creation and application, plus cart-level pricing behavior.

Every module follows the layered pattern from the Backend Standards doc:
`routes → controller → service → repository`, with a single public `index.ts` per module.

## Setup

```bash
npm install
cp .env.example .env   # fill in real DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

> **Note:** In this sandboxed environment, `npx prisma generate` could not reach
> `binaries.prisma.sh` to download the query engine, so the Prisma Client types aren't generated
> here. Every other file type-checks cleanly (`npx tsc --noEmit`) — the only remaining errors are
> the expected "module has no exported member" errors that disappear once `prisma generate` runs
> with normal network access on your machine.

## Scripts

| Command                   | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Start with hot reload (tsx watch)                     |
| `npm run build`           | Compile TypeScript + resolve path aliases (tsc-alias) |
| `npm start`               | Run the compiled build                                |
| `npm run lint`            | ESLint                                                |
| `npm run format`          | Prettier                                              |
| `npm test`                | Vitest                                                |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes         |
| `npm run prisma:migrate`  | Create/apply a migration                              |

## What's next (Phase 4+)

Per the phase plan: `cart`, `wishlist`, `coupons` (Phase 4) → `checkout`, `orders`, `payments`,
`shipping` (Phase 5) → `reviews`, `notifications` (Phase 6) → `admin`, `analytics`, `cms` (Phase 7).
Each new module drops into `src/modules/<name>/` following the exact same file pattern used here,
and gets mounted in `src/routes/index.ts`.
