# DIY Shop Project Specification

DIY Shop is a web-based storefront for handmade goods and artwork. The first release is built for one real seller and real customers, with AWS integration included as a core project requirement. The long-term vision can expand toward a broader multi-seller marketplace, but the initial product is a single-seller shop.

## 1. Product Vision

The product exists to help a seller present handmade products online, receive orders, manage stock, and fulfill purchases through a simple operational workflow.

The project also serves as an AWS-focused application project. AWS is not a side demo. It is part of the intended deployment and operations model for the first complete release.

## 2. Product Scope Model

### Initial product shape
- Single-seller storefront
- Real customer orders
- Real product catalog
- Real shipping flow
- Real seller operations dashboard
- AWS-based deployment and supporting services

### Long-term expansion path
- Possible move to multi-seller marketplace later
- Possible future migration away from AWS if cost becomes a concern
- Marketplace-specific roles and workflows are part of the full project vision, not the MVP build order

## 3. Business Context

### Primary business use
- A real friend will use the system to sell products
- The product must be usable as an actual storefront, not only as a prototype

### Platform constraint
- AWS integration is required in the first completed version
- Current target services are based on the project draft sheets:
  - AWS Elastic Beanstalk
  - AWS RDS PostgreSQL
  - AWS S3
  - AWS CloudWatch
  - GitHub Actions

## 4. Users and Roles

### Guest Customer
A visitor can browse the storefront, search products, filter by category, add items to cart, and place an order without creating an account.

### Seller
The seller manages:
- products
- product images
- categories
- inventory quantity
- orders
- payment confirmation for bank transfer orders
- shipping progress
- basic operational summaries

### Admin
Admin remains part of the full-project vision, but not as a separate MVP UI. In the first release, seller acts as the primary operator.

## 5. Language and Localization

### Storefront
- Customer-facing storefront supports **Vietnamese and English**
- Product content must support both languages

### Seller Dashboard
- Seller dashboard is **English-first** in the first release

### Product content requirements
Each product must support:
- product name (Vietnamese)
- product name (English)
- product description (Vietnamese)
- product description (English)

## 6. Whole-Project Functional Scope

The full project vision includes:
- account registration and login
- product browsing
- product search
- category browsing
- cart
- checkout
- order tracking
- order management
- payment handling
- product image upload
- seller operations dashboard
- admin capabilities
- reviews
- statistics
- CloudWatch monitoring
- CI/CD deployment

Not all of these belong in MVP.

## 7. MVP Definition

The MVP is a **single-seller bilingual storefront with guest checkout**, inventory-aware ordering, manual bank transfer confirmation, COD support, and a seller dashboard for daily operations.

### MVP goals
- let customers browse and order products
- let the seller manage products and stock
- let the seller confirm transfer payments and update order progress
- let the system run on AWS-backed infrastructure

## 8. MVP Functional Requirements

### 8.1 Storefront browsing
Customers can:
- view product list
- view product detail
- browse by category
- search by keyword
- see product images
- see stock availability
- see bilingual content

### 8.2 Product catalog
Products in MVP are:
- physical goods only
- ready-made goods only
- inventory-based
- not digital products
- not custom commissions
- not made-to-order products

Each product includes at minimum:
- Vietnamese name
- English name
- Vietnamese description
- English description
- price
- inventory quantity
- category
- visibility status
- one primary image
- optional additional images

### 8.3 Categories
Categories are included in MVP.

Rules:
- categories are flat, not hierarchical
- seller can manage categories directly in dashboard
- each product belongs to one category in MVP

### 8.4 Product visibility
Products use a simple visibility model:
- visible
- hidden

Rules:
- hidden products remain in the system
- hidden products do not appear in the storefront
- product removal for MVP is handled as hide/archive, not hard delete
- a product can be created before image upload, but cannot be visible until it has at least one image

### 8.5 Inventory
Inventory quantity is part of MVP.

Rules:
- seller manages quantity manually
- quantity can be greater than 1
- quantity 0 means out of stock
- out-of-stock products remain visible
- out-of-stock products cannot be added to cart

### 8.6 Cart
Cart is included in MVP.

Rules:
- guest users can add products to cart
- customers can buy multiple units of a product when stock allows
- cart does not require account creation
- cart persistence is intentionally lightweight for MVP

### 8.7 Checkout
Checkout is guest-first.

Customers do **not** need an account to purchase.

Required checkout information:
- recipient full name
- phone number
- email
- province/city
- district
- ward
- street/detail address
- optional note

### 8.8 Shipping fee
Shipping fee is part of the checkout total.

MVP rule:
- one flat national shipping fee

### 8.9 Payment methods
MVP supports exactly these two customer payment methods:
- Cash on Delivery (COD)
- Bank Transfer via VietQR

Rules:
- VietQR supports bank transfer initiation
- VietQR is not treated as a separate payment method from bank transfer
- MoMo and VNPay are not included in MVP

### 8.10 Order creation
Orders are created automatically after checkout.

Rules:
- seller does not manually approve every order before creation
- order creation reserves stock immediately
- if an order is cancelled later, stock returns to inventory

### 8.11 Order structure
In MVP:
- one order belongs to this one shop only
- one order has one shipping address
- one order has one payment method
- one order contains one or more order items

### 8.12 Order tracking without customer accounts
Because checkout is guest-first, order tracking is required.

MVP tracking rule:
- customer can track order using **order code + phone number**

Each order must therefore include:
- unique order code
- customer contact information
- shipping information
- ordered items
- payment method
- order status
- payment status

### 8.13 Order lifecycle
MVP order statuses:
- `PENDING`
- `CONFIRMED`
- `SHIPPING`
- `DELIVERED`
- `CANCELLED`

Interpretation:
- `PENDING`: newly created order awaiting seller handling or payment confirmation
- `CONFIRMED`: accepted for fulfillment
- `SHIPPING`: handed off for delivery
- `DELIVERED`: completed delivery
- `CANCELLED`: not fulfilled

### 8.14 Payment lifecycle
Payment status is a separate concept from order status.

MVP payment statuses:
- `UNPAID`
- `PAID`
- `FAILED`

Future project may add:
- `REFUNDED`

Rules:
- COD orders can progress while still unpaid
- bank transfer orders remain unpaid until seller verifies transfer

### 8.15 Bank transfer handling
For bank transfer orders:
- customer places order
- system creates order and reserves stock immediately
- customer sees bank transfer instructions and VietQR
- seller verifies incoming transfer manually outside the app
- seller marks payment as received in dashboard

Expiry rule for MVP:
- unpaid bank transfer orders are expected to be paid within 24 hours
- seller manually cancels expired unpaid orders in MVP
- cancelled unpaid orders restore stock

### 8.16 Cancellation
Customer self-service cancellation is not part of MVP.

Rule:
- cancellation is handled by seller only

### 8.17 Seller dashboard
Seller dashboard is part of MVP.

The seller can:
- manage products
- manage categories
- upload/remove product images
- update inventory quantity
- see orders
- view order detail
- confirm bank transfer payments
- update order status
- cancel orders when needed
- view customer contact and shipping information

Default seller order view:
- active orders first
- active means `PENDING`, `CONFIRMED`, `SHIPPING`
- `DELIVERED` and `CANCELLED` available through filters/history

### 8.18 Seller operational summary
MVP seller dashboard includes a small operational summary, not a full analytics suite.

Recommended summary scope:
- number of pending bank-transfer orders
- number of active orders
- number of low-stock products
- total products

### 8.19 Customer notifications
MVP includes basic email notifications.

Mandatory emails:
- order confirmation to customer
- new order notification to seller

Later-notification candidates:
- payment confirmed
- shipping update
- cancellation notice
- unpaid transfer reminder

### 8.20 Contact channels
Storefront should expose direct seller contact links, such as:
- phone
- Zalo
- optional Facebook or Instagram

Internal chat/messaging is not part of MVP.

## 9. AWS and Platform Scope

AWS is part of the planned first complete release.

### Required services
#### AWS RDS PostgreSQL
Used for core relational business data, including products, categories, orders, order items, and related records.

#### AWS S3
Used for product image storage. The database stores references, not image binaries.

#### AWS Elastic Beanstalk
Used to deploy and host the backend application.

#### AWS CloudWatch
Used for logs and monitoring.

#### GitHub Actions
Used for CI/CD and deployment automation.

### MVP platform expectation
The project should be completed in a way that can run with these services, not as a local-only demonstration.

## 10. Out of MVP Scope

The following are part of the broader project vision or future phases, but not MVP requirements:
- multi-seller marketplace workflows
- seller onboarding and public seller registration
- separate admin dashboard UI
- customer accounts required for checkout
- customer order-history account area
- reviews and review moderation
- vouchers and promo codes
- advanced analytics dashboards
- deep category trees
- advanced inventory or warehouse management
- automated bank transfer reconciliation
- automatic order expiry jobs
- in-app messaging/chat
- digital product delivery
- made-to-order workflow
- custom commission workflow
- MoMo integration
- VNPay integration

## 11. Full-Project Future Direction

After MVP, the project can expand in these directions:
- optional customer accounts
- order history for registered customers
- marketplace expansion to multiple sellers
- admin operations UI
- reviews
- promotions and vouchers
- richer shipping logic
- online payment gateway integration
- automated unpaid-order expiration
- more advanced analytics
- possible post-internship migration away from AWS if cost becomes too high

## 12. Key Product Principles

The spec is guided by these principles:
- build for one real seller first
- keep storefront practical and shippable
- use AWS where it supports the real product and the internship requirement
- do not overbuild marketplace complexity into MVP
- keep payment and order concepts separate
- prefer operational clarity over automation when the shop is still small

## 13. Summary of MVP in One Sentence

A bilingual single-seller handmade-goods storefront on AWS where guests can browse and order products, pay by COD or VietQR-guided bank transfer, and the seller can manage catalog, stock, payments, and orders through an English-first dashboard.
