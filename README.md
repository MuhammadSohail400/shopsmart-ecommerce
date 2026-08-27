# 🛍️ ShopSmart AI

> **A Full-Stack Enterprise E-Commerce Platform transformed into ASORA — Premium Anime Streetwear & Custom T-Shirts.**

ShopSmart AI is a modern, scalable full-stack e-commerce platform built with enterprise-level backend architecture and a modern frontend experience. The platform supports authentication, product management, inventory, shopping carts, wishlists, checkout workflows, reviews, and a complete admin dashboard.

The project was later customized for **ASORA**, a premium Anime + Streetwear + Custom T-Shirt brand.

## 🌐 Live Demo

🚀 **Live Website:** [ASORA | Premium Anime Streetwear & Custom T-Shirts](https://asora-streetwear.netlify.app/)

---

# ✨ Features

## 👤 Authentication & Authorization

* User Registration
* Secure Login
* Password Hashing
* JWT Authentication
* Refresh Token Rotation
* Refresh Token Reuse Detection
* Session Management
* Logout
* Password Reset
* Role-Based Access Control (RBAC)
* Protected Routes

---

# 🛒 E-Commerce Features

* Product Catalog
* Categories
* Brands
* Product Variants
* Product Images
* Product Search
* Shopping Cart
* Guest Cart Support
* Wishlist
* Dynamic Cart Management
* Product Reviews & Ratings
* Inventory Management
* Optimistic Locking for Inventory
* Order Management

---

# 🎨 ASORA Customization Features

The platform was customized into **ASORA**, a premium Anime and Streetwear e-commerce brand.

### ASORA Collections

* 🔥 Anime Collection
* 👕 Custom T-Shirts
* 🧥 Oversized T-Shirts
* 🎨 Graphic Prints
* ✨ Minimal Collection
* 🚀 New Drops

### Custom T-Shirt Features

* Upload Custom Design
* PNG Support
* JPG Support
* WebP Support
* Maximum Upload Size: 10MB
* Custom Product Configuration
* Print Placement Selection
* Front Print
* Back Print
* T-Shirt Color Selection
* Size Selection

---

# 🛍️ Cart & Wishlist

The platform includes a modern shopping experience with:

* Persistent Shopping Cart
* Guest Cart Support
* Local Storage Integration
* Unique Guest Cart IDs
* Product Image Preview
* Product Variant Selection
* Custom Product Configuration
* Wishlist Management
* Dynamic Price Calculation
* Free Shipping Progress Bar

### Free Shipping

Free shipping progress is dynamically calculated based on the cart value.

**Free Shipping Threshold: PKR 2,500**

---

# ⭐ Reviews & Ratings

Users can:

* Add Product Reviews
* Rate Products
* View Product Ratings
* View Customer Feedback
* Manage Reviews

---

# 📦 Inventory Management

The inventory system includes:

* Stock Tracking
* Product Variant Inventory
* Inventory Updates
* Optimistic Locking
* Concurrency Protection
* Admin Inventory Management

---

# 🧑‍💼 Admin Dashboard

The platform includes a complete admin system.

### Admin Features

* Dashboard Overview
* KPI Cards
* Recent Orders Feed
* Inventory Health Monitoring
* Product Management
* Category Management
* Brand Management
* Inventory Management
* Order Management
* Shipping Management
* Coupon Management
* CMS Management
* Website Settings

All `/admin/*` routes are protected using role-based authorization.

---

# 🏗️ Architecture

The project follows a modular full-stack architecture.

```text
ShopSmart AI
│
├── Frontend
│   ├── Next.js
│   ├── React
│   ├── TypeScript
│   ├── Tailwind CSS
│   ├── TanStack React Query
│   ├── Zustand
│   └── Shadcn UI
│
├── Backend
│   ├── Node.js
│   ├── Express.js
│   ├── TypeScript
│   ├── Prisma ORM
│   └── REST API
│
├── Database
│   └── PostgreSQL
│
├── Cache
│   └── Redis
│
└── Deployment
    └── Netlify
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* TanStack React Query
* Zustand
* Shadcn UI

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* Zod
* Pino Logger

## Database & Infrastructure

* PostgreSQL
* Redis
* Prisma Migrations

## Authentication

* JWT
* Refresh Tokens
* Secure Password Hashing
* Role-Based Access Control

---

# 🔐 Backend Architecture

The backend follows enterprise-level practices and includes:

* Environment Variable Validation
* Centralized Configuration
* Global Error Handling
* Custom API Error System
* Request Correlation IDs
* Rate Limiting
* Request Validation
* Authentication Middleware
* Authorization Middleware
* Role-Based Access Control
* Structured Logging

---

# 📂 Project Modules

```text
src/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── categories/
│   ├── brands/
│   ├── products/
│   ├── inventory/
│   ├── cart/
│   ├── wishlist/
│   ├── orders/
│   ├── reviews/
│   ├── uploads/
│   └── admin/
│
├── middleware/
│
├── config/
│
├── lib/
│
├── utils/
│
└── server.ts
```

---

# 🔄 Development Phases

## ✅ Phase 1 — Foundation

* Project Architecture
* Environment Validation
* Prisma Configuration
* Redis Configuration
* Pino Logging
* Global Error Handling
* API Error Handling
* Correlation ID Middleware
* Rate Limiting
* Validation Middleware
* Authentication Middleware
* RBAC Middleware

---

## ✅ Phase 2 — Identity & Access

* User Registration
* Login
* JWT Authentication
* Refresh Token Rotation
* Refresh Token Reuse Detection
* Sessions
* Logout
* Password Reset
* User Management

---

## ✅ Phase 3 — Product Catalog & Inventory

* Categories
* Brands
* Products
* Product Variants
* Product Images
* Inventory Management
* Optimistic Locking

---

## ✅ Phase 5 — Cart & Wishlist

* Shopping Cart
* Guest Cart
* Wishlist
* Zustand Store
* Local Storage Persistence
* Guest Cart IDs
* TanStack React Query Integration

---

## 🚧 Phase 7 — Checkout

Planned features include:

* Checkout Flow
* Payment Processing
* Stripe Payment Intent Integration
* Order Creation
* Payment Status Management

---

## ✅ Phase 8 — Reviews & Ratings

* Product Reviews
* Ratings
* Customer Feedback

---

## ✅ Phase 9 — Admin Catalog & Inventory

* Admin Product Management
* Category Management
* Brand Management
* Inventory Management

---

## ✅ Phase 10 — Admin Operations

* Order Management
* Shipping Management
* Coupons
* CMS
* Settings

---

## ✅ Phase 11 — ShopSmart Console

* Admin Overview
* KPI Cards
* Recent Orders Feed
* Inventory Health Monitor

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/MuhammadSohail400/shopsmart-ecommerce.git
```

## Navigate to the Project

```bash
cd shopsmart-ecommerce
```

---

# 🔧 Backend Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
DATABASE_URL=
REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

PORT=4000
NODE_ENV=development
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

The backend server runs on:

```text
http://localhost:4000
```

---

# 💻 Frontend Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the development server:

```bash
npm run dev
```

---

# 🌐 Deployment

The ASORA frontend is currently deployed on Netlify.

### 🔗 Live Website

[ASORA | Premium Anime Streetwear & Custom T-Shirts](https://asora-streetwear.netlify.app/)

---

# 🎯 Project Goals

This project was built to practice and demonstrate:

* Enterprise Backend Architecture
* Scalable REST APIs
* Authentication & Security
* Database Design
* E-Commerce Systems
* Inventory Management
* Admin Dashboards
* Modern React Architecture
* State Management
* API Integration
* Production-Level Development Practices

---

# 🔮 Future Improvements

* Stripe Payment Integration
* Complete Checkout Flow
* Order Tracking
* Email Notifications
* AI Product Recommendations
* AI Shopping Assistant
* Advanced Product Search
* Recommendation Engine
* Analytics Dashboard
* Seller Dashboard
* Multi-Vendor Support
* Mobile Application

---

# 👨‍💻 Author

**Muhammad Sohail**

Full-Stack Developer | Backend Developer | AI Enthusiast

GitHub: [@MuhammadSohail400](https://github.com/MuhammadSohail400)

---

# ⭐ Support

If you found this project useful, please consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  Built with ❤️ using Next.js, Node.js, Express, TypeScript, PostgreSQL, Prisma and Redis.
</p>

<p align="center">
  <strong>ASORA — WEAR YOUR STORY.</strong>
</p>
