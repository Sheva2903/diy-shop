# Personal Notes

This file is for learning and personal understanding.

## What We Built

The project now has a first complete customer order flow:

1. Customer browses products.
2. Customer adds products to a browser cart.
3. Customer submits checkout details.
4. Backend creates an order.
5. Backend immediately decreases product inventory.
6. Customer receives an order code.
7. Customer can track the order with order code + phone number.
8. Seller can list orders, view details, mark payment paid, update status, and cancel orders.
9. Cancelling an order restores inventory.

The important idea is that the project now has a real vertical slice. It is not the whole MVP yet, but the core customer-to-seller order loop exists.

## Database Migration

File:

```text
src/main/resources/db/migration/V5__create_orders.sql
```

This migration creates two tables:

```text
orders
order_items
```

`orders` stores one checkout/order:

- order code
- customer contact info
- shipping address
- payment method
- order status
- payment status
- subtotal
- shipping fee
- total amount
- timestamps

`order_items` stores the products inside the order:

- order id
- product id
- product name snapshot
- unit price snapshot
- quantity
- line total

The important design choice is that order item names and prices are snapshotted. If the seller changes a product name or price later, old orders still show what the customer bought at checkout time.

## Order Statuses

File:

```text
src/main/java/com/diyshop/order/OrderStatus.java
```

Statuses:

```text
PENDING
CONFIRMED
SHIPPING
DELIVERED
CANCELLED
```

These describe fulfillment progress, not payment.

Allowed seller transitions:

```text
PENDING -> CONFIRMED
CONFIRMED -> SHIPPING
SHIPPING -> DELIVERED
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
```

`DELIVERED` and `CANCELLED` are terminal. Once an order reaches either, seller cannot move it again.

## Payment Statuses

File:

```text
src/main/java/com/diyshop/order/PaymentStatus.java
```

Statuses:

```text
UNPAID
PAID
FAILED
```

Payment status is separate from order status. This matters because a COD order can be fulfilled while still unpaid, and a bank transfer order can stay `PENDING` until seller confirms payment.

## Payment Methods

File:

```text
src/main/java/com/diyshop/order/PaymentMethod.java
```

Methods:

```text
COD
BANK_TRANSFER
```

For `BANK_TRANSFER` orders, the backend now returns bank transfer instructions and a VietQR public image URL in the order response. Payment confirmation is still manual: the seller checks the bank transfer outside the app, then marks the payment as paid through the seller order API.

## CustomerOrder Entity

File:

```text
src/main/java/com/diyshop/order/CustomerOrder.java
```

This is the JPA entity mapped to the `orders` table.

It stores the whole order header:

- customer fields
- address fields
- payment method
- order status
- payment status
- money totals
- timestamps
- list of order items

The class is named `CustomerOrder`, not `Order`, because `Order` is a common word and can be confusing with SQL/order-by language.

Important mapping:

```java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items = new ArrayList<>();
```

This means when a `CustomerOrder` is saved, its `OrderItem` children are saved too. We create the order and add items to it, then save the order once.

Important method:

```java
public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
}
```

This keeps both sides of the relationship consistent:

- the order knows about the item
- the item knows which order it belongs to

## OrderItem Entity

File:

```text
src/main/java/com/diyshop/order/OrderItem.java
```

This is mapped to `order_items`.

It links back to:

- `CustomerOrder`
- `Product`

But it also stores snapshots:

- product name Vietnamese
- product name English
- unit price
- quantity
- line total

The product link lets us know which product was ordered. The snapshots preserve order history even if the product later changes.

## Order Repository

File:

```text
src/main/java/com/diyshop/order/CustomerOrderRepository.java
```

Important methods:

```java
boolean existsByOrderCode(String orderCode);
```

Used while generating a unique order code.

```java
Optional<CustomerOrder> findByOrderCodeAndPhoneNumberWithItems(...)
```

Used by customer tracking. It requires both order code and phone number because customers do not have accounts.

```java
List<CustomerOrder> findAllForSellerOrderByActiveFirst();
```

Used by seller order list. It sorts active orders first:

1. `PENDING`
2. `CONFIRMED`
3. `SHIPPING`
4. everything else

```java
Optional<CustomerOrder> findByOrderCodeWithItems(String orderCode);
```

Used by seller order detail and updates.

The `left join fetch` parts are there so order items are loaded together with the order, avoiding lazy-loading surprises when converting to response DTOs.

## Customer Order DTOs

Folder:

```text
src/main/java/com/diyshop/order/dto
```

### CreateOrderRequest

Used by:

```text
POST /api/orders
```

It contains:

- recipient name
- phone
- email
- address fields
- optional note
- payment method
- items

Validation annotations like `@NotBlank`, `@Email`, `@Size`, and `@NotEmpty` let Spring reject bad requests before service logic runs.

### CreateOrderItemRequest

One requested line item:

```text
productId
quantity
```

`quantity` must be positive.

### OrderResponse

Returned to customers and seller detail endpoints.

It includes:

- order code
- customer info
- statuses
- totals
- items
- created time

### OrderItemResponse

Returned inside `OrderResponse`.

It exposes the snapshotted item name, price, quantity, and total.

### SellerOrderListResponse

Compact response for seller order list. It avoids returning full shipping detail and item detail for every row.

### UpdateOrderStatusRequest

Used by:

```text
PATCH /api/seller/orders/{orderCode}/status
```

It contains the target `orderStatus`.

## Customer Order Service

File:

```text
src/main/java/com/diyshop/order/OrderService.java
```

This class handles customer checkout and customer tracking.

### createOrder

This is the main checkout transaction.

High-level flow:

1. Merge duplicate product IDs from the request.
2. Create a new `CustomerOrder`.
3. Generate an order code.
4. Copy customer/shipping fields from the request.
5. Set order status to `PENDING`.
6. Set payment status to `UNPAID`.
7. For each requested product:
   - load visible product with a write lock
   - check stock
   - decrease inventory
   - create an order item with snapshotted name and price
   - add line total to subtotal
8. Add flat shipping fee.
9. Save the order.
10. Return `OrderResponse`.

The method is annotated:

```java
@Transactional
```

This means all database changes succeed or fail together. If one product is out of stock, the order is not saved and inventory is not partially changed.

### Product locking

Checkout uses:

```java
findVisibleProductByIdForUpdate
```

That repository method uses:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
```

This is to reduce overselling. If two customers try to buy the same low-stock product at the same time, one transaction should lock the product row while it checks and decreases inventory.

### Order code generation

Order codes look like:

```text
DS20260710-ABC123
```

Parts:

- `DS`: shop prefix
- date in Vietnam timezone
- random uppercase suffix

The service checks if the generated code already exists and retries a few times.

### trackOrder

Used by:

```text
GET /api/orders/track?orderCode=...&phoneNumber=...
```

It trims inputs, requires both fields, and finds the order only when order code and phone number match.

## Customer Order Controller

File:

```text
src/main/java/com/diyshop/order/OrderController.java
```

This exposes the public customer order endpoints:

```text
POST /api/orders
GET  /api/orders/track
```

The controller is thin. It does not contain business logic. It receives HTTP requests and delegates to `OrderService`.

## Seller Order Service

File:

```text
src/main/java/com/diyshop/order/SellerOrderService.java
```

This class handles seller operations on orders.

### getOrders

Returns seller list rows, active orders first.

### getOrder

Returns full order detail by order code.

### markPaymentPaid

Marks payment as `PAID`.

It rejects cancelled orders because cancelled orders should not be paid.

### updateOrderStatus

Applies order status changes.

It first validates transition rules, then changes status.

If the next status is `CANCELLED`, it restores inventory before setting the order to cancelled.

### validateTransition

This protects the order lifecycle from bad jumps.

Allowed:

```text
PENDING -> CONFIRMED
PENDING -> CANCELLED
CONFIRMED -> SHIPPING
CONFIRMED -> CANCELLED
SHIPPING -> DELIVERED
```

Rejected examples:

```text
PENDING -> SHIPPING
CONFIRMED -> DELIVERED
SHIPPING -> CANCELLED
CANCELLED -> CONFIRMED
DELIVERED -> CANCELLED
```

### restoreInventory

When an order is cancelled, each order item is used to restore product stock.

It loads each product with a write lock:

```java
findByIdForUpdate
```

Then calls:

```java
product.increaseInventory(item.getQuantity());
```

Because `CANCELLED` is terminal and repeated cancellation is rejected, inventory should not be restored twice.

## Seller Order Controller

File:

```text
src/main/java/com/diyshop/order/SellerOrderController.java
```

Endpoints:

```text
GET   /api/seller/orders
GET   /api/seller/orders/{orderCode}
PATCH /api/seller/orders/{orderCode}/payment
PATCH /api/seller/orders/{orderCode}/status
```

These are not authenticated yet. They are deliberately under `/api/seller/...` so security can be added later without changing the URL shape.

## Product Changes

Files:

```text
src/main/java/com/diyshop/product/Product.java
src/main/java/com/diyshop/product/ProductRepository.java
src/main/java/com/diyshop/product/ProductService.java
```

### Product.decreaseInventory

Used during checkout.

It prevents subtracting more than available stock.

### Product.increaseInventory

Used when seller cancels an order.

It adds stock back.

### ProductRepository.findVisibleProductByIdForUpdate

Used during checkout to lock a visible product row before stock is checked/decreased.

### ProductRepository.findByIdForUpdate

Used during cancellation to lock a product row before stock is restored.

### Product search fix

The original query passed `null` for empty keyword. PostgreSQL and Hibernate produced a `lower(bytea)` error when calling `/api/products` without keyword.

Fix:

- service passes empty string instead of `null`
- query checks `:keyword = ''`

This makes `/api/products` work without search text.

## Application Config

File:

```text
src/main/resources/application.properties
```

Added:

```properties
shop.shipping.flat-fee=30000
```

`OrderService` reads this with:

```java
@Value("${shop.shipping.flat-fee}") BigDecimal flatShippingFee
```

This keeps the shipping fee configurable instead of hardcoding it in the checkout logic.

## Static Customer UI

Folder:

```text
src/main/resources/static
```

Files:

```text
index.html
styles.css
app.js
```

Spring Boot automatically serves `index.html` at:

```text
http://localhost:8081/
```

### index.html

Defines the page structure:

- top navigation tabs
- shop view
- checkout view
- tracking view
- product card template

It is intentionally simple and lives inside Spring Boot so there is no frontend build tool yet.

### styles.css

Styles the customer UI.

Design goal:

- simple storefront
- not corporate
- not overbuilt
- responsive enough for desktop and mobile

### app.js

Handles browser behavior:

- fetch categories
- fetch products
- search/filter products
- add to cart
- store cart in `localStorage`
- submit checkout to `POST /api/orders`
- show order success
- track order through `GET /api/orders/track`

The cart is not stored in the backend. This was intentional. For MVP, checkout can send product IDs and quantities directly.

## Error Handling

Existing file:

```text
src/main/java/com/diyshop/common/exception/GlobalExceptionHandler.java
```

Our order services throw:

```java
BadRequestException
ResourceNotFoundException
```

These become JSON error responses with proper HTTP status codes.

Examples:

- invalid order transition -> `400`
- missing order -> `404`
- insufficient stock -> `400`

## Current Gaps

Still missing:

- seller product management
- seller category management
- seller UI
- authentication for seller APIs
- email notifications
- AWS deployment setup
- focused tests for order rules

The project is still intentionally lightweight. The current structure is:

```text
controller -> service -> repository -> entity
```

That is enough for now. Avoid adding interfaces, factories, event systems, or deep architecture until the project actually needs them.
