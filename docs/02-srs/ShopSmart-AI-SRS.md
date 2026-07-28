# Software Requirements Specification (SRS)
## ShopSmart AI — Modern Full Stack E-commerce Platform

**Document Version:** 1.0
**Standard Followed:** IEEE 29148 / IEEE 830 style
**Status:** Draft — Ready for System Design Handoff
**Source Document:** ShopSmart AI Product Requirements Document (PRD) v1.0, Approved
**Last Updated:** July 26, 2026

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) translates the approved ShopSmart AI Product Requirements Document (PRD) into a precise, engineering-ready specification of software behavior. It defines functional requirements, non-functional requirements, business rules, validation rules, error handling, security requirements, use cases, and traceability needed for the System Design phase to begin without further clarification from Product.

### 1.2 Scope
This SRS covers the complete software behavior of ShopSmart AI, a single-vendor B2C e-commerce web platform, including: customer-facing storefront (browsing, search, cart, checkout, orders, returns), and internal administrative systems (catalog management, inventory, order fulfillment, analytics, customer support, CMS, roles/permissions). It excludes database schema design, API contract design, system architecture diagrams, and any code-level implementation, which are addressed in subsequent phases.

### 1.3 Intended Audience
- Software Architects and Solution Architects (System Design phase)
- Backend and Frontend Engineers
- QA/Test Engineers (test case derivation)
- DevOps/Infrastructure Engineers (NFR planning)
- Product Managers (requirement verification)
- UI/UX Designers (interface requirement alignment)

### 1.4 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| BR | Business Rule |
| VR | Validation Rule |
| UC | Use Case |
| RTM | Requirements Traceability Matrix |
| SKU | Stock Keeping Unit |
| RBAC | Role-Based Access Control |
| COD | Cash on Delivery |
| PCI-DSS | Payment Card Industry Data Security Standard |
| OTP | One-Time Password |
| WCAG | Web Content Accessibility Guidelines |
| CMS | Content Management System |
| AOV | Average Order Value |
| GMV | Gross Merchandise Value |
| CDN | Content Delivery Network |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |

### 1.5 References
- ShopSmart AI Product Requirements Document (PRD), v1.0 (Approved)
- IEEE 830-1998, Recommended Practice for Software Requirements Specifications
- IEEE 29148-2018, Systems and Software Engineering — Life Cycle Processes — Requirements Engineering
- WCAG 2.1 Guidelines (W3C)
- PCI-DSS v4.0 Security Standard

### 1.6 Document Overview
Section 2 describes the product at a high level. Section 3 defines external interfaces. Section 4 details system features per module. Sections 5–10 enumerate atomic, ID-tagged requirements (functional, non-functional, business, validation, error handling, security). Section 11 provides detailed use cases. Section 12 provides a Requirements Traceability Matrix. Section 13 is a glossary of domain terms.

---

## 2. Overall Description

### 2.1 Product Perspective
ShopSmart AI is a new, standalone, single-vendor e-commerce platform. It is not an extension of an existing legacy system. It consists of two primary software surfaces sharing a common backend and data layer:
1. **Customer Storefront** — public-facing responsive web application
2. **Admin/Operations Console** — internal dashboard for Admin, Inventory Manager, and Support Agent roles

The system is designed with modular boundaries (catalog, cart/checkout, orders, payments, inventory, CMS, analytics) so that a future native mobile application and future AI services (recommendations, chatbot, semantic search) can integrate against the same core business logic without re-architecture.

### 2.2 Product Functions (Summary)
- Customer account management and authentication
- Product catalog browsing, search, and filtering
- Wishlist and cart management
- Checkout, shipping, tax, and payment processing
- Order creation, tracking, cancellation
- Returns, refunds, and cancellations
- Product reviews
- Coupons and promotions
- Inventory management
- Admin dashboard, analytics, and reporting
- CMS (static pages, banners, FAQ)
- Roles and permissions (RBAC)
- Notifications (email; SMS limited to OTP at MVP)

### 2.3 User Classes and Characteristics

| User Class | Technical Proficiency | System Access |
|---|---|---|
| Guest Customer | Low–Medium | Storefront (browse, search, guest checkout) |
| Registered Customer | Low–Medium | Storefront (full account features) |
| Admin | Medium–High | Full admin console access |
| Inventory Manager | Medium | Catalog and stock management only |
| Support Agent | Medium | Customer, order, and return/refund management |

### 2.4 Operating Environment
- **Client-side:** Modern evergreen web browsers (Chrome, Safari, Firefox, Edge), responsive across desktop, tablet, and mobile viewport widths
- **Server-side:** Cloud-hosted, horizontally scalable application infrastructure
- **Database:** Persistent data store supporting transactional consistency for orders, payments, and inventory
- **Third-party dependencies:** Payment gateway (PCI-DSS compliant), courier/shipping tracking provider(s), transactional email delivery provider, SMS/OTP delivery provider

### 2.5 Design Constraints
- Must support guest checkout without mandatory account creation
- Must be single-currency, single-language at MVP (architecture must not block future expansion)
- Must not implement AI features in this phase; only maintain data structures compatible with future AI integration
- Must comply with PCI-DSS for any payment data handling (achieved via gateway tokenization, not direct card storage)
- No native mobile application in this phase; web must be fully responsive

### 2.6 Assumptions
- A PCI-DSS compliant third-party payment gateway will be integrated rather than building in-house payment processing
- Courier/shipping partners provide tracking references or APIs
- Initial catalog size is under 10,000 SKUs
- Single region/currency/language launch

### 2.7 Dependencies
- Payment gateway provider (external)
- Email delivery service provider (external, transactional)
- SMS/OTP delivery provider (external)
- Shipping/courier tracking provider (external)
- CDN provider for static asset and cacheable page delivery

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- Responsive web storefront: homepage, category listing, product detail, search results, cart, checkout (multi-step), order history, account management
- Admin console: dashboard, product/catalog management, order management, inventory management, coupon/CMS management, analytics/reports, staff/role management, audit log viewer
- All interfaces must meet WCAG 2.1 AA accessibility requirements (see NFR-Accessibility)

### 3.2 Hardware Interfaces
- No dedicated/proprietary hardware interfaces required at MVP
- Standard client hardware only (desktop/laptop/mobile devices with a modern browser)

### 3.3 Software Interfaces
| Interface | Purpose | Notes |
|---|---|---|
| Payment Gateway API | Process card payments, tokenized storage, refunds | PCI-DSS compliant provider required |
| Email Delivery Service API | Send transactional emails (confirmation, OTP-adjacent, status updates) | Third-party SMTP/API provider |
| SMS/OTP Provider API | Deliver OTP codes for phone verification and password reset | Third-party provider |
| Shipping/Courier API | Provide tracking numbers/status updates for shipments | One or more regional courier integrations |
| CDN | Cache and serve static/catalog assets | Edge caching for performance NFRs |

### 3.4 Communication Interfaces
- All client-server communication over HTTPS/TLS 1.2 or higher
- RESTful communication pattern assumed for System Design phase (formal API contracts out of scope for this SRS)
- Webhooks expected from payment gateway (payment status) and courier provider (shipment status updates)

---

## 4. System Features

Each module below follows: Description, Functional Requirements (reference IDs from Section 5), Preconditions, Postconditions, Main Flow, Alternate Flows, Exceptions, Business Rules (reference IDs from Section 7), Acceptance Criteria.

### 4.1 Authentication
**Description:** Enables users to register, log in, verify identity, and recover account access securely.
**Functional Requirements:** FR-001 to FR-010
**Preconditions:** User has a valid email or phone number.
**Postconditions:** Authenticated session established; user identity available to downstream modules.
**Main Flow:** User submits registration details → system validates → verification (email link / OTP) sent → user confirms → account activated → user logs in.
**Alternate Flows:** User logs in via existing verified credentials directly; user initiates "Forgot Password."
**Exceptions:** Invalid credentials; expired/invalid OTP; duplicate email/phone during registration.
**Business Rules:** BR-001, BR-012, BR-015
**Acceptance Criteria:** A user cannot access account-restricted features (order history, wishlist) until authenticated; unverified email does not block browsing or guest checkout.

### 4.2 User Profile
**Description:** Allows registered users to manage personal details, addresses, and sessions.
**Functional Requirements:** FR-011 to FR-015
**Preconditions:** User is authenticated.
**Postconditions:** Profile data updated and reflected across relevant modules (checkout address selection, order history).
**Main Flow:** User navigates to profile → edits fields or adds address → saves → confirmation shown.
**Alternate Flows:** User manages multiple saved addresses; user revokes an active session/device.
**Exceptions:** Invalid field data (see VR section); attempt to delete the last remaining saved address during active checkout.
**Business Rules:** BR-014
**Acceptance Criteria:** Updated address is immediately selectable during checkout; session revocation immediately invalidates the targeted session token.

### 4.3 Product Catalog
**Description:** Central repository of products, variants, categories, and brands available for purchase.
**Functional Requirements:** FR-016 to FR-025
**Preconditions:** Product data exists and is published (not in draft state).
**Postconditions:** Product visible on storefront with accurate price, stock, and variant data.
**Main Flow:** Admin/Inventory Manager creates product with attributes and variants → publishes → product appears on storefront.
**Alternate Flows:** Bulk CSV upload of multiple products; product archived (removed from storefront without deleting historical order references).
**Exceptions:** Duplicate SKU; missing required fields (title, price, category, image).
**Business Rules:** BR-001
**Acceptance Criteria:** A published product with zero stock displays "Out of Stock" and blocks add-to-cart; archived products remain visible in historical order records.

### 4.4 Categories & Brands
**Description:** Organizational taxonomy for the catalog.
**Functional Requirements:** FR-026 to FR-030
**Preconditions:** Admin has catalog management permission.
**Postconditions:** Category/brand hierarchy reflected in navigation and filters.
**Main Flow:** Admin creates category (optionally nested up to 3 levels) → assigns products.
**Alternate Flows:** Admin reassigns a product to a different category/brand.
**Exceptions:** Attempt to nest categories beyond the maximum supported depth (3 levels).
**Business Rules:** N/A (structural rule enforced at FR level)
**Acceptance Criteria:** Category navigation reflects only categories with at least one published product, unless admin overrides this default.

### 4.5 Search & Filters
**Description:** Enables customers to find products via keyword search and structured filters.
**Functional Requirements:** FR-031 to FR-038
**Preconditions:** Product catalog is indexed and searchable.
**Postconditions:** Relevant, correctly filtered/sorted results returned to the customer.
**Main Flow:** Customer enters keyword → autocomplete suggestions appear → customer submits search or selects suggestion → results displayed with filter/sort controls.
**Alternate Flows:** Customer applies filters (price, brand, rating, availability); customer changes sort order.
**Exceptions:** No matching results (graceful empty state with suggestions); search term contains minor typos (fuzzy-matched).
**Business Rules:** N/A
**Acceptance Criteria:** A search with a single-character typo still returns the intended product within the top results.

### 4.6 Wishlist
**Description:** Allows registered customers to save products for later consideration.
**Functional Requirements:** FR-039 to FR-043
**Preconditions:** User is authenticated.
**Postconditions:** Product persists in the user's wishlist until removed or moved to cart.
**Main Flow:** Customer clicks "Add to Wishlist" on a product → item added → visible in wishlist page.
**Alternate Flows:** Customer moves item from wishlist to cart; customer removes an item.
**Exceptions:** Guest attempts to add to wishlist (prompted to log in/register).
**Business Rules:** BR-014
**Acceptance Criteria:** Wishlist persists across sessions for registered users and is accessible from any device after login.

### 4.7 Cart
**Description:** Temporary collection of products a customer intends to purchase.
**Functional Requirements:** FR-044 to FR-050
**Preconditions:** At least one in-stock product/variant is available.
**Postconditions:** Cart accurately reflects selected products, quantities, and current subtotal.
**Main Flow:** Customer adds product/variant to cart → cart updates subtotal → customer proceeds to checkout or continues shopping.
**Alternate Flows:** Customer updates quantity; customer applies a coupon in-cart; guest cart persists locally.
**Exceptions:** Item goes out of stock while in cart (flagged, blocks checkout for that item until resolved).
**Business Rules:** BR-001, BR-008
**Acceptance Criteria:** Cart subtotal always recalculates immediately on any quantity or coupon change; out-of-stock items cannot proceed to checkout.

### 4.8 Checkout
**Description:** Multi-step flow converting a cart into a confirmed order.
**Functional Requirements:** FR-051 to FR-058
**Preconditions:** Cart contains at least one valid, in-stock item.
**Postconditions:** Order created (pending payment resolution) or payment/order fails gracefully with cart preserved.
**Main Flow:** Customer selects/enters address → selects shipping method → reviews tax/shipping/total → selects payment method → confirms → order created.
**Alternate Flows:** Guest checkout path (no account creation); customer applies/removes coupon at final review step.
**Exceptions:** Address outside supported shipping zone; stock conflict detected at final review; payment failure.
**Business Rules:** BR-002, BR-009, BR-010, BR-011
**Acceptance Criteria:** Checkout cannot be completed for an address outside supported shipping zones; final total always includes tax and shipping before payment confirmation.

### 4.9 Orders
**Description:** Represents a confirmed purchase and its full lifecycle.
**Functional Requirements:** FR-059 to FR-066
**Preconditions:** Payment confirmed or COD selected.
**Postconditions:** Order exists with an accurate, auditable status history.
**Main Flow:** Order created → Confirmed → Packed → Shipped → Out for Delivery → Delivered.
**Alternate Flows:** Customer cancels before "Packed"; admin manually overrides status for edge cases.
**Exceptions:** Cancellation attempted after "Packed" (rejected); payment not received within timeout (order abandoned).
**Business Rules:** BR-005, BR-012
**Acceptance Criteria:** Every status transition is timestamped and visible in the customer's order tracking view.

### 4.10 Payments
**Description:** Handles secure payment capture and refund processing.
**Functional Requirements:** FR-067 to FR-073
**Preconditions:** Valid payment method selected; PCI-compliant gateway available.
**Postconditions:** Payment captured (or COD flagged) and linked to the order record.
**Main Flow:** Customer submits payment details to gateway → gateway returns success/failure → order created/updated accordingly.
**Alternate Flows:** COD selected (no gateway interaction at checkout); bank transfer selected (manual confirmation workflow).
**Exceptions:** Card declined; gateway timeout; duplicate submission (must be idempotent).
**Business Rules:** BR-004, BR-012
**Acceptance Criteria:** A duplicate payment submission (e.g., double-click, network retry) never results in two charges or two orders for the same checkout attempt.

### 4.11 Shipping
**Description:** Determines shipping eligibility, cost, and delivery estimation.
**Functional Requirements:** FR-074 to FR-078
**Preconditions:** Shipping zones and rates configured by Admin.
**Postconditions:** Accurate shipping cost and estimated delivery window presented before payment.
**Main Flow:** System resolves customer address to a shipping zone → applies configured rate/method → displays cost and estimate.
**Alternate Flows:** Customer selects express vs. standard shipping.
**Exceptions:** Address falls outside all configured zones (checkout blocked with clear message).
**Business Rules:** BR-011
**Acceptance Criteria:** Shipping cost shown at checkout matches the final charged amount with no discrepancy.

### 4.12 Inventory
**Description:** Tracks and manages stock at the SKU/variant level.
**Functional Requirements:** FR-079 to FR-084
**Preconditions:** Product/variant exists in the catalog.
**Postconditions:** Stock levels accurately reflect confirmed orders, cancellations, and returns.
**Main Flow:** Inventory Manager sets/updates stock → system enforces non-negative stock → stock auto-decrements on order confirmation.
**Alternate Flows:** Bulk CSV stock update; low-stock threshold alert triggered.
**Exceptions:** Attempted stock decrement below zero (rejected); concurrent orders competing for last unit (handled via atomic stock check).
**Business Rules:** BR-001
**Acceptance Criteria:** Two simultaneous orders for the last unit of a SKU cannot both succeed; exactly one order is confirmed and the other is notified of unavailability.

### 4.13 Admin Dashboard
**Description:** Central operational view for business and fulfillment management.
**Functional Requirements:** FR-085 to FR-090
**Preconditions:** User has Admin (or scoped staff) role.
**Postconditions:** Dashboard reflects real-time or near-real-time business data.
**Main Flow:** Admin logs in → views sales/order/stock summary → drills into relevant module.
**Alternate Flows:** Filtered order search; bulk order status update.
**Exceptions:** Unauthorized role attempts restricted action (rejected with permission error).
**Business Rules:** BR-015
**Acceptance Criteria:** Inventory Manager role cannot access pricing or refund controls, even via direct URL navigation.

### 4.14 Analytics
**Description:** Reporting on sales, customers, inventory, and funnel performance.
**Functional Requirements:** FR-091 to FR-096
**Preconditions:** Sufficient transactional data exists.
**Postconditions:** Reports accurately reflect underlying order/customer/inventory data as of the report generation time.
**Main Flow:** Admin selects a report/date range → system aggregates and displays/exports data.
**Alternate Flows:** Scheduled/automatic report generation (future); manual export to CSV/PDF.
**Exceptions:** No data available for the selected range (empty state, not an error).
**Business Rules:** N/A
**Acceptance Criteria:** Exported report totals match the live dashboard totals for the same date range.

### 4.15 Reviews
**Description:** Enables verified-purchase customers to rate and review products.
**Functional Requirements:** FR-097 to FR-101
**Preconditions:** Customer has a "Delivered" order containing the specific product.
**Postconditions:** Review visible on the product page pending any moderation rules.
**Main Flow:** Customer submits rating + text → review published (or queued if moderation enabled).
**Alternate Flows:** Admin hides/removes a review violating content policy.
**Exceptions:** Customer without a qualifying delivered order attempts to review (blocked).
**Business Rules:** BR-006
**Acceptance Criteria:** A customer who has not received the product cannot submit a review for it under any UI path.

### 4.16 Notifications
**Description:** Communicates transactional status to customers and operational alerts to staff.
**Functional Requirements:** FR-102 to FR-106
**Preconditions:** Triggering event occurs (order placed, status change, etc.).
**Postconditions:** Notification delivered via the configured channel (email primary at MVP).
**Main Flow:** Event occurs → notification service triggered → message delivered to customer/staff.
**Alternate Flows:** Customer opts out of marketing (not transactional) emails.
**Exceptions:** Delivery failure (logged, retried per provider policy).
**Business Rules:** N/A
**Acceptance Criteria:** Order confirmation email is dispatched within 60 seconds of successful order creation.

### 4.17 Coupons & Promotions
**Description:** Enables discount codes and scheduled promotional banners.
**Functional Requirements:** FR-107 to FR-112
**Preconditions:** Coupon exists, is active, and applicable rules are met.
**Postconditions:** Discount correctly applied to cart/order total.
**Main Flow:** Customer enters coupon code → system validates → discount applied.
**Alternate Flows:** Admin schedules a banner/coupon with start/end dates.
**Exceptions:** Expired coupon; minimum order value not met; usage limit exceeded.
**Business Rules:** BR-003, BR-013
**Acceptance Criteria:** An expired coupon is rejected with a specific, accurate reason, never a generic error.

### 4.18 Returns & Refunds
**Description:** Manages post-delivery return requests, approvals, and refunds.
**Functional Requirements:** FR-113 to FR-119
**Preconditions:** Order status is "Delivered" and within the applicable return window.
**Postconditions:** Return request resolved (approved/rejected) and, if applicable, refund processed.
**Main Flow:** Customer requests return with reason → Support Agent reviews → approves/rejects → (if approved) item received → refund processed.
**Alternate Flows:** Partial refund issued; category is explicitly non-returnable (request blocked at initiation).
**Exceptions:** Return requested outside the eligible window (blocked); return requested for a non-returnable category (blocked).
**Business Rules:** BR-004, BR-007
**Acceptance Criteria:** A return request for a non-returnable category is blocked at the UI level and rejected at the backend if attempted directly.

### 4.19 CMS
**Description:** Manages static content: pages, FAQ, homepage banners.
**Functional Requirements:** FR-120 to FR-124
**Preconditions:** Admin has CMS management permission.
**Postconditions:** Published content visible to customers without engineering involvement.
**Main Flow:** Admin creates/edits a CMS page or banner → publishes → content live on storefront.
**Alternate Flows:** Scheduled banner with future start date.
**Exceptions:** Attempt to publish content with missing required fields (title/body).
**Business Rules:** N/A
**Acceptance Criteria:** A scheduled banner automatically appears/disappears at its configured start/end date without manual intervention.

### 4.20 Roles & Permissions
**Description:** Enforces RBAC across staff accounts.
**Functional Requirements:** FR-125 to FR-129
**Preconditions:** Admin has staff management permission.
**Postconditions:** Staff account scoped to the correct permission set.
**Main Flow:** Admin creates staff account → assigns role (Admin/Inventory Manager/Support Agent) → staff logs in with scoped access.
**Alternate Flows:** Admin modifies an existing staff member's role.
**Exceptions:** Attempt to assign a role that does not exist; attempt to self-demote the last remaining Admin account (blocked to prevent lockout).
**Business Rules:** BR-015
**Acceptance Criteria:** At least one Admin account must always exist in the system; the system prevents actions that would result in zero Admin accounts.

### 4.21 Settings
**Description:** Platform-wide configuration (tax rules, shipping zones, business info, site settings).
**Functional Requirements:** FR-130 to FR-134
**Preconditions:** Admin has settings management permission.
**Postconditions:** Configuration changes take effect platform-wide for subsequent transactions (not retroactive to existing orders).
**Main Flow:** Admin updates a setting (e.g., tax rate) → saved → applied to new orders going forward.
**Alternate Flows:** N/A
**Exceptions:** Invalid configuration value (e.g., negative tax rate) rejected at input.
**Business Rules:** BR-010
**Acceptance Criteria:** Changing a tax rate does not alter the tax amount on already-placed orders.

---

## 5. Functional Requirements

| ID | Description | Priority | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| FR-001 | System shall allow registration via email + password | High | None | Account created and pending email verification |
| FR-002 | System shall allow registration via phone number + password | High | OTP provider | Account created and pending phone verification |
| FR-003 | System shall send an email verification link on registration | High | FR-001 | Link expires after 24 hours |
| FR-004 | System shall send an OTP for phone verification | High | FR-002 | OTP expires after 5 minutes |
| FR-005 | System shall allow login via email/phone + password | High | FR-001/002 | Session token issued on success |
| FR-006 | System shall support "Forgot Password" via email link or OTP | High | FR-003/004 | All other sessions invalidated after reset |
| FR-007 | System shall support social login (Google/Facebook) | Low | Future OAuth integration | Deferred to post-MVP |
| FR-008 | System shall enforce RBAC for staff accounts | High | FR-125–129 | Unauthorized action blocked |
| FR-009 | System shall allow users to view/revoke active sessions | Medium | FR-005 | Revoked session token immediately invalid |
| FR-010 | System shall lock/backoff after repeated failed login attempts | High | Security layer | Account temporarily locked after threshold |
| FR-011 | System shall allow profile field editing (name, email, phone) | High | FR-005 | Changes reflected immediately |
| FR-012 | System shall allow multiple saved addresses per user | High | FR-005 | All addresses selectable at checkout |
| FR-013 | System shall allow profile photo upload | Low | File upload security | Image validated for type/size |
| FR-014 | System shall allow address deletion | Medium | FR-012 | Deleted address no longer selectable |
| FR-015 | System shall display active sessions/devices | Medium | FR-009 | List reflects current active sessions |
| FR-016 | System shall support product creation with title, description, images, price | High | Admin RBAC | Product visible on save if published |
| FR-017 | System shall support product variants (size, color, storage, weight) | High | FR-016 | Each variant has independent price/stock |
| FR-018 | System shall support multiple images per product | High | FR-016 | Gallery displays all images with zoom |
| FR-019 | System shall display stock status per variant | High | FR-017, FR-079 | Out-of-stock variants blocked from cart |
| FR-020 | System shall support product archiving (soft delete) | Medium | FR-016 | Archived product hidden from storefront, retained in past orders |
| FR-021 | System shall support bulk CSV product upload | Medium | Inventory RBAC | Invalid rows rejected with specific errors |
| FR-022 | System shall display related products on product page | Medium | Catalog data | Related products from same category/brand shown |
| FR-023 | System shall track and display "Recently Viewed" products | Medium | Session/account data | Last 10 items shown |
| FR-024 | System shall support "Featured/Trending/New/Best Sellers" curation | Medium | Admin config or sales data | Sections populate per configured logic |
| FR-025 | System shall expose a recommendation placeholder ("You may also like") | Low | Rule-based fallback | Populated via same-category logic at MVP |
| FR-026 | System shall support up to 3-level category nesting | High | FR-016 | Deeper nesting rejected |
| FR-027 | System shall support brand assignment to products | Medium | FR-016 | Brand filter reflects assignment |
| FR-028 | System shall allow category/brand creation and editing by Admin | High | Admin RBAC | Changes reflected in navigation |
| FR-029 | System shall allow product reassignment between categories | Medium | FR-026 | Product appears under new category immediately |
| FR-030 | System shall hide empty categories from navigation by default | Low | FR-016 | Configurable override available |
| FR-031 | System shall support keyword search across title/description/brand/category | High | Search index | Relevant results returned |
| FR-032 | System shall provide autocomplete suggestions after 2+ characters | Medium | FR-031 | Suggestions appear within 300ms |
| FR-033 | System shall support fuzzy/typo-tolerant search | Medium | FR-031 | Minor typos still return intended results |
| FR-034 | System shall support filtering by category, brand, price, rating, availability | High | FR-031 | Filters combine with AND logic |
| FR-035 | System shall support sorting (relevance, price, newest, best-selling) | High | FR-031 | Sort order reflected in result list |
| FR-036 | System shall display a graceful empty state for zero results | Medium | FR-031 | Suggestions or popular items shown |
| FR-037 | System shall allow Admin to configure filterable attributes | Low | Admin RBAC | New attribute appears in filter UI |
| FR-038 | System shall persist last-used filters within a session | Low | FR-034 | Filters retained on back navigation |
| FR-039 | System shall allow authenticated users to add products to a wishlist | High | FR-005 | Item appears in wishlist immediately |
| FR-040 | System shall allow removing items from wishlist | High | FR-039 | Item removed immediately |
| FR-041 | System shall allow moving a wishlist item to cart | High | FR-039, FR-044 | Item appears in cart, remains or removed from wishlist per config |
| FR-042 | System shall persist wishlist across sessions/devices for registered users | High | FR-039 | Wishlist available after login from any device |
| FR-043 | System shall notify users of price drops on wishlist items | Low | Notification service | Email sent on qualifying price change |
| FR-044 | System shall allow adding products/variants to cart | High | FR-017, FR-079 | Cart reflects item and subtotal updates |
| FR-045 | System shall allow updating item quantity in cart | High | FR-044 | Subtotal recalculates immediately |
| FR-046 | System shall allow removing items from cart | High | FR-044 | Item removed, subtotal updates |
| FR-047 | System shall persist guest cart locally | High | Client storage | Cart retained across page reloads |
| FR-048 | System shall persist registered user cart server-side | High | FR-005 | Cart synced across devices |
| FR-049 | System shall flag out-of-stock cart items | High | FR-079 | Checkout blocked until resolved |
| FR-050 | System shall allow coupon application within the cart | High | FR-107 | Discount reflected in subtotal before checkout |
| FR-051 | System shall provide a multi-step checkout flow | High | FR-044 | Steps: Address → Shipping → Payment → Review |
| FR-052 | System shall support guest checkout | High | FR-047 | Order created without account creation |
| FR-053 | System shall allow address selection/entry at checkout | High | FR-012 | Selected address used for shipping/tax calc |
| FR-054 | System shall calculate shipping cost based on destination/method | High | FR-074 | Cost shown before payment |
| FR-055 | System shall calculate tax based on shipping destination | High | Settings (tax rules) | Tax shown before payment |
| FR-056 | System shall display full order summary before payment confirmation | High | FR-051 | Subtotal, tax, shipping, discount, total all itemized |
| FR-057 | System shall re-validate coupon and stock at final checkout step | High | FR-050, FR-079 | Invalid coupon/stock blocks payment step with message |
| FR-058 | System shall support shipping method selection (standard/express) | Medium | FR-074 | Selected method reflected in cost and ETA |
| FR-059 | System shall create an order upon successful payment or COD selection | High | FR-067 | Order recorded with initial status |
| FR-060 | System shall track order status transitions | High | FR-059 | Each transition timestamped |
| FR-061 | System shall send order confirmation email upon creation | High | FR-102 | Delivered within 60 seconds |
| FR-062 | System shall allow order cancellation before "Packed" status | High | FR-060 | Cancellation blocked after "Packed" |
| FR-063 | System shall generate a downloadable invoice per order | Medium | FR-059 | PDF invoice available from order detail |
| FR-064 | System shall display order history to registered users | High | FR-005 | All past orders listed with status |
| FR-065 | System shall integrate courier tracking reference/status | Medium | Courier API | Tracking link/status shown on order detail |
| FR-066 | System shall allow Admin to manually override order status | Medium | Admin RBAC | Override logged in audit trail |
| FR-067 | System shall support card payment via PCI-compliant gateway | High | Gateway integration | Payment tokenized, not stored raw |
| FR-068 | System shall support Cash on Delivery (COD) | High | None | Order created without gateway interaction |
| FR-069 | System shall support bank transfer payment | Medium | Manual reconciliation workflow | Order flagged pending manual confirmation |
| FR-070 | System shall display specific payment failure reasons where safe | High | Gateway response | Customer sees actionable message |
| FR-071 | System shall allow payment retry without cart/order loss | High | FR-067 | Retry preserves cart contents |
| FR-072 | System shall ensure payment/order operations are idempotent | High | Gateway + order logic | No duplicate charge/order from retries |
| FR-073 | System shall process refunds to original payment method | High | FR-113–119 | Refund confirmation recorded on order |
| FR-074 | System shall support configurable shipping zones and rates | High | Admin RBAC | Rate applied per destination zone |
| FR-075 | System shall block checkout for unsupported shipping destinations | High | FR-074 | Clear rejection message shown |
| FR-076 | System shall display estimated delivery date | Medium | FR-074 | Estimate shown before payment |
| FR-077 | System shall support express and standard shipping methods | Medium | FR-074 | Cost/ETA differ by method |
| FR-078 | System shall recalculate shipping cost if address changes mid-checkout | High | FR-074 | Updated cost shown immediately |
| FR-079 | System shall track stock at SKU/variant level | High | FR-017 | Stock accurate per variant |
| FR-080 | System shall prevent stock from going below zero | High | FR-079 | Operation rejected if it would cause negative stock |
| FR-081 | System shall auto-decrement stock on order confirmation | High | FR-059 | Stock reduced atomically |
| FR-082 | System shall restore stock on cancellation/approved return | High | FR-062, FR-116 | Stock increased atomically |
| FR-083 | System shall support configurable low-stock thresholds | Medium | FR-079 | Alert triggered when threshold breached |
| FR-084 | System shall support bulk stock update via CSV | Medium | Inventory RBAC | Invalid rows rejected with specific errors |
| FR-085 | System shall display a sales/orders/revenue summary dashboard | High | Order/payment data | Dashboard reflects near-real-time data |
| FR-086 | System shall provide filterable/searchable order management view | High | FR-059 | Filters return accurate subsets |
| FR-087 | System shall support bulk order status updates | Medium | FR-060 | Multiple orders updated in one action |
| FR-088 | System shall provide product/catalog management UI | High | FR-016 | CRUD operations reflected immediately |
| FR-089 | System shall provide customer profile view for staff (scoped) | Medium | RBAC | Support Agent sees order/ticket history |
| FR-090 | System shall log all sensitive admin actions to an audit trail | High | Security requirement | Action, actor, timestamp, before/after recorded |
| FR-091 | System shall report top-selling products by units and revenue | Medium | Order data | Report matches underlying order totals |
| FR-092 | System shall report customer growth (new vs. returning) | Medium | Customer/order data | Trend chart reflects accurate counts |
| FR-093 | System shall report conversion rate and AOV | Medium | Order + traffic data | Calculation matches defined formula |
| FR-094 | System shall report abandoned cart data | Medium | Cart data | Count and contents viewable |
| FR-095 | System shall support exportable reports (CSV/PDF) | Medium | FR-085–094 | Export totals match dashboard totals |
| FR-096 | System shall report repeat customer rate | Medium | Order data | % of customers with 2+ orders |
| FR-097 | System shall allow review submission only for verified delivered purchases | High | FR-060 | Non-qualifying users blocked from reviewing |
| FR-098 | System shall support star rating (1–5) and text review | High | FR-097 | Rating required; text optional or required per config |
| FR-099 | System shall display average rating and review count on product page | High | FR-098 | Value recalculates as new reviews are added |
| FR-100 | System shall allow Admin to moderate (hide/remove) reviews | Medium | Admin RBAC | Hidden review no longer publicly visible |
| FR-101 | System shall prevent duplicate reviews for the same order/product | Medium | FR-097 | Second attempt blocked with message |
| FR-102 | System shall send transactional emails for key order events | High | Email provider | Delivered within 60 seconds of trigger |
| FR-103 | System shall send OTP via SMS for phone verification/reset | High | SMS provider | OTP delivered within 60 seconds |
| FR-104 | System shall allow customers to opt out of marketing emails | Medium | FR-011 | Transactional emails unaffected by opt-out |
| FR-105 | System shall alert Admin on low-stock threshold breach | Medium | FR-083 | Alert visible in dashboard/notification |
| FR-106 | System shall alert Admin on abnormal failed-payment volume | Low | Monitoring integration | Alert triggered above defined threshold |
| FR-107 | System shall support percentage and flat-value coupons | High | Admin RBAC | Discount calculated correctly per type |
| FR-108 | System shall validate coupon expiry, minimum order value, usage limits | High | FR-107 | Invalid coupon rejected with specific reason |
| FR-109 | System shall support category/product-restricted coupons | Medium | FR-107 | Coupon rejected outside restriction scope |
| FR-110 | System shall support scheduled homepage banners | Medium | FR-120–124 | Banner appears/disappears per schedule |
| FR-111 | System shall enforce per-user coupon usage limits | High | FR-107 | Usage beyond limit rejected |
| FR-112 | System shall prevent coupon stacking unless explicitly configured | High | FR-107 | Second coupon rejected unless stackable flag set |
| FR-113 | System shall allow return requests within the eligible window | High | FR-060 | Request blocked outside window |
| FR-114 | System shall require a reason selection for return requests | High | FR-113 | Request cannot submit without reason |
| FR-115 | System shall support Support Agent approval/rejection of returns | High | RBAC | Status updated and visible to customer |
| FR-116 | System shall support full or partial refund issuance | High | FR-073 | Refund amount matches agent-approved value |
| FR-117 | System shall block returns for non-returnable categories | High | FR-113 | Return option hidden and backend rejects direct attempt |
| FR-118 | System shall track return status lifecycle | High | FR-113 | Status: Requested → Approved/Rejected → Received → Refunded |
| FR-119 | System shall notify customer at each return status change | Medium | FR-102 | Email sent per transition |
| FR-120 | System shall support CMS page creation/editing (About, Terms, Privacy) | Medium | Admin RBAC | Published page live immediately |
| FR-121 | System shall support FAQ entry management | Medium | Admin RBAC | New/edited FAQ visible immediately |
| FR-122 | System shall support homepage banner management | Medium | Admin RBAC | Banner reflects configured schedule |
| FR-123 | System shall support SEO metadata configuration per page/product/category | Medium | Admin RBAC | Meta tags reflected in page source |
| FR-124 | System shall auto-generate and update sitemap.xml | Medium | Catalog changes | Sitemap reflects current published catalog |
| FR-125 | System shall support Admin, Inventory Manager, Support Agent roles | High | RBAC | Each role scoped to defined permissions |
| FR-126 | System shall allow Admin to create/edit staff accounts | High | FR-125 | New staff account has correct scoped access |
| FR-127 | System shall prevent removal of the last remaining Admin account | High | FR-125 | Action blocked with clear message |
| FR-128 | System shall log role changes to the audit trail | High | FR-090 | Change recorded with actor and timestamp |
| FR-129 | System shall enforce permission checks at both API and UI layers | High | FR-125 | Direct API call by unauthorized role rejected |
| FR-130 | System shall support configurable tax rules by region | High | Admin RBAC | New orders use updated rate; past orders unaffected |
| FR-131 | System shall support configurable shipping zones (see FR-074) | High | Admin RBAC | Reflected in checkout eligibility |
| FR-132 | System shall support global site settings (business info, display currency) | Medium | Admin RBAC | Changes reflected platform-wide |
| FR-133 | System shall support maximum order quantity per SKU configuration | Medium | Admin RBAC | Checkout blocks quantities beyond configured max |
| FR-134 | System shall support minimum order value configuration | Low | Admin RBAC | Checkout blocks orders below configured minimum, if enabled |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Product pages shall load within 2 seconds on standard broadband |
| NFR-002 | Performance | Search results shall return within 500ms (P95) |
| NFR-003 | Performance | API responses for standard reads shall complete within 300ms (P95) |
| NFR-004 | Scalability | Architecture shall support horizontal scaling of application servers |
| NFR-005 | Scalability | Catalog shall support 10,000+ SKUs without performance degradation |
| NFR-006 | Scalability | System shall support 1,000 concurrent users at MVP, scaling to 10,000+ |
| NFR-007 | Availability | Storefront shall target 99.9% uptime |
| NFR-008 | Reliability | Order and payment processing shall be idempotent under retry conditions |
| NFR-009 | Reliability | Concurrent orders for the same last-unit SKU shall resolve without overselling |
| NFR-010 | Security | See Section 10 in full |
| NFR-011 | Accessibility | Storefront and admin console shall target WCAG 2.1 AA compliance |
| NFR-012 | Maintainability | Codebase shall maintain clear module separation (catalog, cart, orders, inventory, CMS) |
| NFR-013 | Logging | All transactional events (orders, payments, refunds) shall be logged in structured format |
| NFR-014 | Monitoring | Real-time monitoring with alerting on error-rate spikes and downtime shall be implemented |
| NFR-015 | Backup & Recovery | Daily automated database backups with minimum 30-day retention |
| NFR-016 | Backup & Recovery | RPO of 24 hours and RTO of 4 hours shall be achievable |
| NFR-017 | Internationalization | Architecture shall not block future multi-language/multi-currency support |
| NFR-018 | SEO | Structured data, sitemap, canonical URLs, and friendly slugs shall be implemented (see Section 21 of PRD) |
| NFR-019 | Compliance | Payment handling shall comply with PCI-DSS via gateway tokenization |
| NFR-020 | Compliance | System shall comply with applicable regional data protection requirements for the launch market |
| NFR-021 | Caching | Non-personalized catalog/category pages shall be cacheable at CDN/edge layer |
| NFR-022 | Rate Limiting | Authentication and checkout endpoints shall enforce per-user/IP rate limiting |

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Stock can never go below zero under any operation |
| BR-002 | Guest checkout is allowed; a valid email or phone number is required for order confirmation and traceability |
| BR-003 | A coupon is valid only if unexpired, minimum order value is met, category/product restrictions are satisfied, and per-user usage limit is not exceeded |
| BR-004 | Refunds are issued to the original payment method; COD refunds are processed via manual bank transfer |
| BR-005 | Order cancellation is permitted only while status is "Order Created" or "Confirmed"; blocked once "Packed" |
| BR-006 | Product reviews may only be submitted by customers with a "Delivered" order containing that product |
| BR-007 | Return eligibility is governed by a per-category return window; certain categories are explicitly non-returnable |
| BR-008 | Maximum order quantity per SKU per order is capped (default 10 units, admin-configurable) |
| BR-009 | Minimum order value may be enforced platform-wide; if enforced, checkout blocks orders below threshold |
| BR-010 | Tax is calculated based on shipping destination's applicable rate, applied to the subtotal after discounts |
| BR-011 | Shipping is restricted to explicitly enabled regions/zones |
| BR-012 | An order's payment must be confirmed (or COD selected) before order creation completes |
| BR-013 | Discounts/coupons cannot be combined unless explicitly configured as stackable |
| BR-014 | Guest wishlist/cart data is retained locally only; registered user data syncs server-side |
| BR-015 | Inventory Manager role cannot modify pricing or process refunds |

---

## 8. Validation Rules

| ID | Field/Area | Rule |
|---|---|---|
| VR-001 | Password | Minimum 8 characters; at least 1 uppercase, 1 lowercase, 1 number |
| VR-002 | Password | Cannot match the user's email or phone number |
| VR-003 | Email | Must match standard email format (RFC 5322); unique, case-insensitive |
| VR-004 | Phone | Must match valid format for launch region; unique if used as login identifier |
| VR-005 | Address | Required fields: full name, phone, address line 1, city, region, postal code (if applicable), country |
| VR-006 | Address | Must resolve to a supported shipping zone |
| VR-007 | Product | Title, price, category, and at least one image required |
| VR-008 | Product | Price must be a positive number |
| VR-009 | Product | SKU must be unique across catalog |
| VR-010 | Product Variant | Variant combinations must be unique per product |
| VR-011 | Coupon | Code must be unique, alphanumeric, case-insensitive |
| VR-012 | Coupon | Discount value must be positive; percentage capped at 100% |
| VR-013 | Coupon | Start date must precede end date |
| VR-014 | Payment | Card data validated exclusively by the PCI-compliant gateway, never stored/validated directly by the platform |
| VR-015 | Payment | COD requires a valid delivery address and phone number |

---

## 9. Error Handling Requirements

| Error Type | Handling Requirement |
|---|---|
| Validation Errors | Field-level, specific, actionable inline message at point of input |
| Business Errors | Message must state the specific rule violated (e.g., minimum order value not met) |
| Authentication Errors | Generic "invalid credentials" message (does not reveal whether email or password was incorrect) |
| Authorization Errors | Generic "insufficient permission" message; no leakage of restricted data or functionality |
| Payment Failures | Gateway-relayed reason shown where safe; cart/order state preserved for retry |
| Inventory Conflicts | Customer notified of specific item/quantity affected before being charged |
| System Failures | Generic, safe message to user; full technical detail logged server-side only |

---

## 10. Security Requirements

| ID | Requirement |
|---|---|
| SEC-001 | Passwords stored using an industry-standard adaptive hashing algorithm; never stored in plaintext |
| SEC-002 | RBAC enforced at both API and UI layers |
| SEC-003 | All traffic served over HTTPS/TLS; sensitive data encrypted at rest |
| SEC-004 | Anti-CSRF tokens required on all state-changing requests |
| SEC-005 | All user-generated content sanitized/escaped to prevent XSS |
| SEC-006 | All database queries parameterized to prevent SQL/NoSQL injection |
| SEC-007 | Rate limiting and brute-force protection on login/OTP endpoints |
| SEC-008 | Secure headers enforced (CSP, X-Frame-Options, X-Content-Type-Options, HSTS) |
| SEC-009 | File uploads validated for type/size and scanned for malicious content |
| SEC-010 | Audit logging of all sensitive admin actions with actor, timestamp, before/after values |
| SEC-011 | Session tokens invalidated on password change; idle session timeout enforced |
| SEC-012 | Cookies marked HttpOnly, Secure, and SameSite where applicable |
| SEC-013 | JWT (if used) shall be short-lived with refresh token rotation; no sensitive PII in token payload |

---

## 11. Use Cases

### UC-01: Customer Registration
- **Actors:** Guest User
- **Preconditions:** User is not logged in
- **Trigger:** User selects "Sign Up"
- **Main Flow:** User enters email/phone and password → system validates (VR-001–004) → verification link/OTP sent → user confirms → account created
- **Alternate Flow:** User registers via phone instead of email
- **Exceptions:** Duplicate email/phone (registration blocked with message); invalid password format
- **Postconditions:** Account exists in "unverified" or "verified" state

### UC-02: Guest Checkout
- **Actors:** Guest User
- **Preconditions:** Cart contains at least one in-stock item
- **Trigger:** User selects "Checkout" without logging in
- **Main Flow:** User enters shipping address and contact info → selects shipping method → selects payment method → confirms order → order created
- **Alternate Flow:** User chooses to register mid-checkout for future convenience
- **Exceptions:** Address outside supported shipping zone; payment failure
- **Postconditions:** Order created in "Order Created" or "Confirmed" state; confirmation email sent

### UC-03: Product Search
- **Actors:** Guest User, Registered Customer
- **Preconditions:** Catalog is indexed
- **Trigger:** User enters a search term
- **Main Flow:** System returns matching, ranked results with filter/sort controls
- **Alternate Flow:** User applies filters/sorting after initial search
- **Exceptions:** No results found (empty state with suggestions shown)
- **Postconditions:** Result set displayed accurately reflecting catalog state

### UC-04: Add to Cart and Checkout
- **Actors:** Registered Customer
- **Preconditions:** User is authenticated; product is in stock
- **Trigger:** User clicks "Add to Cart" then proceeds to checkout
- **Main Flow:** Item added to cart → user reviews cart, applies coupon → proceeds through checkout → payment confirmed → order created
- **Alternate Flow:** User removes an item before checkout
- **Exceptions:** Item goes out of stock between cart addition and checkout (blocked with notice)
- **Postconditions:** Order created; stock decremented; cart cleared of purchased items

### UC-05: Payment Processing
- **Actors:** Registered Customer, Guest User, Payment Gateway
- **Preconditions:** Checkout review step completed
- **Trigger:** User confirms payment
- **Main Flow:** Payment request sent to gateway → gateway returns success → order status set to "Confirmed"
- **Alternate Flow:** COD selected (no gateway call; order directly set to "Confirmed" pending delivery-time cash collection)
- **Exceptions:** Gateway declines payment (order remains unconfirmed; customer notified with reason and retry option)
- **Postconditions:** Order in "Confirmed" status with linked payment record

### UC-06: Order Tracking
- **Actors:** Registered Customer, Guest User (via order reference)
- **Preconditions:** Order exists
- **Trigger:** User views order detail/tracking page
- **Main Flow:** System displays current status and full status history with timestamps
- **Alternate Flow:** Courier tracking link/status embedded if available
- **Exceptions:** Tracking data temporarily unavailable from courier provider (last known status shown with a "last updated" timestamp)
- **Postconditions:** User has accurate visibility into order progress

### UC-07: Return & Refund Request
- **Actors:** Registered Customer, Support Agent
- **Preconditions:** Order is "Delivered" and within return window; product category is returnable
- **Trigger:** Customer initiates return request
- **Main Flow:** Customer selects reason and submits → Support Agent reviews → approves → customer ships item back → Support Agent confirms receipt → refund processed
- **Alternate Flow:** Support Agent rejects the request with a reason
- **Exceptions:** Request submitted outside return window (blocked); non-returnable category (blocked at initiation)
- **Postconditions:** Return status updated; refund issued if approved

### UC-08: Admin Product Management
- **Actors:** Admin, Inventory Manager
- **Preconditions:** User is authenticated with appropriate role
- **Trigger:** Admin/Inventory Manager creates or edits a product
- **Main Flow:** User enters product details, variants, and stock → saves → product published (or saved as draft)
- **Alternate Flow:** Bulk upload via CSV
- **Exceptions:** Duplicate SKU; missing required fields
- **Postconditions:** Catalog updated and reflected on storefront (if published)

### UC-09: Inventory Stock Update
- **Actors:** Inventory Manager
- **Preconditions:** Product/variant exists
- **Trigger:** Stock level changes (manual update or bulk upload)
- **Main Flow:** Inventory Manager updates stock quantity → system validates non-negative constraint → stock updated
- **Alternate Flow:** Bulk CSV update across multiple SKUs
- **Exceptions:** Attempt to set negative stock (rejected)
- **Postconditions:** Stock levels accurate; low-stock alerts triggered if applicable

### UC-10: Coupon Application at Checkout
- **Actors:** Registered Customer, Guest User
- **Preconditions:** Cart contains eligible items
- **Trigger:** Customer enters a coupon code
- **Main Flow:** System validates expiry, minimum order value, category restriction, usage limit → discount applied to order total
- **Alternate Flow:** Coupon re-validated again at final checkout step in case conditions changed
- **Exceptions:** Invalid/expired/ineligible coupon (rejected with specific reason)
- **Postconditions:** Order total accurately reflects applied discount, or coupon rejected with clear feedback

### UC-11: Staff Role Assignment
- **Actors:** Admin
- **Preconditions:** Admin is authenticated with staff management permission
- **Trigger:** Admin creates or edits a staff account
- **Main Flow:** Admin assigns role (Admin/Inventory Manager/Support Agent) → account scoped accordingly
- **Alternate Flow:** Admin edits an existing staff member's role
- **Exceptions:** Attempt to remove the last Admin account (blocked)
- **Postconditions:** Staff account has correctly scoped access; change logged to audit trail

---

## 12. Requirements Traceability Matrix (RTM)

| Business Goal (PRD Sec. 3) | Feature (Sec. 4) | Functional Requirement(s) | Acceptance Criteria Reference |
|---|---|---|---|
| Launch MVP with full shopping experience | Product Catalog, Cart, Checkout | FR-016–025, FR-044–058 | Sec. 4.3, 4.7, 4.8 |
| Achieve 99.9% checkout reliability | Payments, Orders | FR-067–073, FR-059–066 | Sec. 4.9, 4.10 / NFR-008, NFR-009 |
| Build repeat purchase behavior | Wishlist, Reviews, Notifications, Coupons | FR-039–043, FR-097–101, FR-102–106, FR-107–112 | Sec. 4.6, 4.15, 4.16, 4.17 |
| Reduce manual order-processing overhead | Inventory, Admin Dashboard | FR-079–084, FR-085–090 | Sec. 4.12, 4.13 |
| Prepare for future AI features | Search & Filters, Product Catalog | FR-025, FR-031–038 | Sec. 4.3, 4.5 |
| Scale catalog to 10,000+ SKUs | Product Catalog, Inventory | FR-016–025, FR-079–084 | NFR-005 |
| Ensure secure transactions | Payments, Authentication, Security | FR-067–073, FR-001–010, SEC-001–013 | Sec. 10 |
| Provide operational visibility | Admin Dashboard, Analytics | FR-085–096 | Sec. 4.13, 4.14 |
| Enforce return/refund policy consistently | Returns & Refunds | FR-113–119, BR-004, BR-007 | Sec. 4.18 |
| Maintain accountable staff access control | Roles & Permissions | FR-125–129, BR-015, SEC-002 | Sec. 4.20 |

---

## 13. Glossary

| Term | Definition |
|---|---|
| Cart | A temporary, pre-purchase collection of products a customer intends to buy |
| Checkout | The multi-step process converting a cart into a confirmed order |
| Coupon | A code providing a percentage or flat-value discount, subject to validation rules |
| Guest Checkout | Order placement without requiring account registration |
| Order Lifecycle | The full sequence of statuses an order passes through from creation to delivery/refund |
| RBAC | A permission model where access is granted based on assigned roles rather than individual users |
| Return Window | The configurable time period after delivery during which a customer may request a return |
| SKU | A unique identifier representing a specific sellable product variant |
| Variant | A distinct purchasable version of a product differentiated by attributes such as size or color |
| Wishlist | A saved list of products a registered customer intends to consider or purchase later |

---

*End of Document. This SRS is considered complete and ready for handoff to the System Design phase.*
