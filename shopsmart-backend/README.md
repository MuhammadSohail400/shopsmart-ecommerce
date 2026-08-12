# ShopSmart AI — Backend

Complete backend implementation across all 8 phases, per the approved
PRD → SRS → System Design → Database Design → API Design → Backend Standards
documents. All 22 business modules are built, tested, containerized, and
CI-wired.

## What's included

| Phase | Modules |
|---|---|
| 1 — Foundation | env validation, Prisma/Redis/Pino config, error handling, middleware |
| 2 — Identity & Access | `auth` (register, login, refresh rotation, real email/phone verification), `users` |
| 3 — Catalog | `categories`, `brands`, `products` (+variants+images), `inventory` (optimistic locking) |
| 4 — Shopping | `cart` (guest + registered), `wishlist`, `coupons` |
| 5 — Transactions | `checkout`, `orders`, `payments` (Stripe), `shipping` |
| 6 — Post-Purchase | `reviews`, `notifications` (Resend, domain events, scheduled jobs) |
| 7 — Operations | `settings`, `audit-logs`, `admin`, `analytics`, `cms` |
| 8 — Hardening | test coverage, OpenAPI/Swagger docs, Docker/Nginx/CI-CD, security review, load test |

Every module follows the identical layered pattern: `routes -> controller -> service -> repository`,
with a single public `index.ts` per module — no module ever imports another module's internals.

## Setup (local, without Docker)

```bash
npm install
cp .env.example .env   # fill in real DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Setup (Docker — recommended for a full stack in one command)

```bash
docker compose up --build
```

This starts Postgres, Redis, the app (with migrations applied automatically), and Nginx as a
reverse proxy on `http://localhost:8080`. The app itself is also reachable directly on
`http://localhost:4000`.

## API Documentation

Once running, interactive API docs are served at `GET /docs` (Swagger UI), backed by
`openapi/openapi.yaml`. **Honest scope note:** the OpenAPI spec covers the critical shopping
path (auth, products, cart, checkout, orders, payments) in full detail; the remaining modules
follow the identical conventions but aren't individually documented in the YAML yet — see each
module's `*.routes.ts` for their exact paths in the meantime.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_ACCESS_SECRET` | Yes | Min 16 chars, signs access tokens |
| `JWT_ACCESS_EXPIRES_IN` | No (default `15m`) | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | No (default `7`) | Refresh token lifetime |
| `COOKIE_DOMAIN` | No (default `localhost`) | Refresh token cookie domain |
| `CORS_ORIGIN` | No (default `http://localhost:5173`) | Allowed frontend origin |
| `STRIPE_SECRET_KEY` | No | Card payments won't work without it; app still boots |
| `STRIPE_WEBHOOK_SECRET` | No | Required for Stripe webhook signature verification |
| `RESEND_API_KEY` | No | Emails are logged instead of sent without it |
| `EMAIL_FROM_ADDRESS` | No (default `no-reply@shopsmart.ai`) | Sender address for outgoing email |
| `LOG_LEVEL` | No (default `info`) | Pino log level (`silent` for quiet test runs) |

See `.env.example` for the full list with placeholder values.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript + resolve path aliases |
| `npm start` | Run the compiled build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Run the Vitest suite |
| `npx vitest run --coverage` | Run tests with a coverage report |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes |
| `npm run prisma:migrate` | Create/apply a migration |
| `npm run load-test:checkout` | Concurrency test against a running instance — see script header for required env vars |

## Testing

Run `npm test` for the full suite (unit + API tests, repository layer mocked per Backend
Standards Section 17.1). See `PHASE-1-8-COMPLETE.md` for current pass/fail counts and an honest
coverage summary — coverage is not uniform across all 22 modules; the transactional core
(auth, orders, inventory, coupons, payments) has the deepest test coverage since that's where
correctness matters most.

## Known Limitations

See `PHASE-1-8-COMPLETE.md` for the full, current list. In short: several modules (categories,
brands, wishlist, shipping, settings, cms, audit-logs, notifications) have no dedicated test
file yet; the OpenAPI spec doesn't cover every endpoint; and this was built/tested in a sandboxed
environment where the Prisma query engine binary couldn't be downloaded, so no test here has
touched a real database — every test mocks the repository layer. Run `npx prisma generate`
and the same test suite on a machine with normal internet access to validate against a real
Postgres instance.
