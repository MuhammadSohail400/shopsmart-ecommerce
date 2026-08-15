# ShopSmart AI — Frontend

This is the Next.js 15 frontend application for ShopSmart AI, providing the public storefront, customer account area, and internal admin console. It consumes the ShopSmart REST API.

## Project Status

The frontend is being built in phases according to the Frontend Architecture specifications.

| Phase | Status | Modules/Features |
|---|---|---|
| 1 — Foundation | **COMPLETE** | Next.js 15 App Router, TypeScript strict, ESLint/Prettier, API Client (fetch-based), React Query setup, Zustand store setup |
| 2 — Design System | **COMPLETE** | Tailwind CSS v3, Shadcn UI + Base UI components, Lucide icons, Dark mode support, globals.css |
| 3 — Authentication | **COMPLETE** | Login, Register, Password Reset, Email/Phone Verification, JWT Rotation, Protected Routes |
| 4 — Product Catalog | **COMPLETE** | Homepage, Categories, Brands, Product Grid, Product Details (Variants, Images), Search, Filtering, Pagination |
| 5 — Shopping | Pending | Cart, Checkout, Stripe Elements, Shipping, Wishlist |
| 6 — Post-Purchase | Pending | Orders list, Order details, Reviews |
| 7 — Operations | Pending | Admin Dashboard, Product Management, CMS Management, Analytics |
| 8 — Hardening | Pending | Final performance optimizations, Lighthouse testing, E2E testing |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + `@base-ui/react`
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React

## Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env.local` and configure your API URL.
   ```bash
   cp .env.example .env.local
   ```
   *Required variables*:
   - `NEXT_PUBLIC_API_URL`: The URL of the backend API (default: `http://localhost:4000/api/v1`)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Code Quality

Run the following commands to validate the codebase:

- **Typecheck**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Build**: `npm run build`

## Architecture Highlights

- **API Client**: Uses a custom, strongly-typed `fetch` wrapper rather than Axios to take full advantage of Next.js 15's native caching and request deduplication.
- **State Management**: TanStack query handles all asynchronous server state (products, user data). Zustand is reserved exclusively for ephemeral client UI state (e.g., active filters, mobile menu toggles).
- **Security**: The frontend does NOT use NextAuth; it implements a strict adherence to the backend's JWT-in-memory and HttpOnly-refresh-cookie design. Protected routes utilize Next.js middleware and Higher Order Components.
