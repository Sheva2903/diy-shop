# DIY Shop

A web shop for handmade goods. The first release serves one real seller and real customers, while leaving room to expand into a marketplace later.

## Language

**Storefront**:
The customer-facing web shop for browsing products and placing orders from a single shop.
_Avoid_: Marketplace, platform

**Seller**:
The person who owns the shop and manages products and orders.
_Avoid_: Merchant, vendor, shop owner

**Customer**:
A person who browses the storefront and places orders.
_Avoid_: User, buyer, client

**Marketplace**:
A multi-seller model where multiple sellers manage their own products and orders in the same system.
_Avoid_: Storefront

**Cash on Delivery**:
A payment method where the customer pays when the order is delivered.
_Avoid_: Online payment

**Bank Transfer**:
A payment method where the customer transfers money directly to the shop's bank account before the order is confirmed.
_Avoid_: Card payment

**VietQR**:
A QR code that helps the customer initiate a bank transfer to the shop's bank account.
_Avoid_: Payment gateway

**Inventory Quantity**:
The number of units of a product that are currently available to sell.
_Avoid_: Availability only, warehouse stock system

**Order Code**:
A customer-facing unique code used to identify and track an order without a customer account.
_Avoid_: Database ID, invoice number

**Order Status**:
The fulfillment progress of an order: `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, or `CANCELLED`.
_Avoid_: Payment state

**Payment Status**:
The payment progress of an order: `UNPAID`, `PAID`, or `FAILED`.
_Avoid_: Order fulfillment state

**Bilingual Storefront**:
A storefront that presents customer-facing content in both Vietnamese and English.
_Avoid_: Vietnamese-only storefront

**Seller Dashboard**:
The internal interface the seller uses to manage products, categories, orders, and operational summaries. For the first release, its default language is English.
_Avoid_: Admin panel
