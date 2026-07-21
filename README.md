# DIY Shop

Spring Boot application for a DIY & handmade goods storefront.

## Repository scope

This repository currently contains the Spring Boot backend, local development setup, and a lightweight static customer UI.
Project scope and MVP requirements are documented in [`docs/project-spec.md`](docs/project-spec.md).

## Current progress

Implemented:

- Customer storefront APIs for categories, products, search, product detail, and product images
- Guest checkout with direct order creation
- Order code generation and guest order tracking by order code + phone number
- Inventory reservation on checkout and inventory restore on seller cancellation
- Seller order APIs for list, detail, payment confirmation, status updates, and cancellation
- Lightweight static customer UI served by Spring Boot
- Seller session authentication and seller-only category/product management APIs
- Multipart product image upload with local storage and an AWS S3 storage adapter
- Bank transfer instructions with VietQR public image URLs for bank-transfer orders

Not implemented yet:

- Seller dashboard UI
- Email notifications
- AWS deployment configuration

## Stack

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Flyway
- PostgreSQL
- Docker
- Static HTML/CSS/JavaScript for the simple customer UI
- AWS SDK for Java 2.x

## Prerequisites

- Java 17
- Docker

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure the seller account

Seller APIs require these environment variables. The password value must be a BCrypt hash, never a plain-text password.

```bash
export DIY_SHOP_SELLER_USERNAME='seller'
export DIY_SHOP_SELLER_PASSWORD_HASH='<bcrypt-password-hash>'
```

For the fixed local development seller (`seller` / `seller123`), generate an ignored environment file from the frontend directory:

```bash
cd frontend
npm run generate:seller
cd ..
source .seller-dev.env
```

These credentials are only for local development. Do not reuse them in a deployed environment or commit `.seller-dev.env`.

### 3. Configure bank transfer details

Bank transfer checkout requires these environment variables. The backend fails at startup if they are missing because bank transfer is part of the MVP payment flow.

```bash
export BANK_TRANSFER_BANK_NAME='Vietcombank'
export BANK_TRANSFER_BANK_CODE='vietcombank'
export BANK_TRANSFER_BANK_BIN='970436'
export BANK_TRANSFER_ACCOUNT_NUMBER='<account-number>'
export BANK_TRANSFER_ACCOUNT_NAME='<account-name>'
```

Optional values:

```bash
export BANK_TRANSFER_TEMPLATE='compact'
export BANK_TRANSFER_PAYMENT_DUE_HOURS='24'
```

`BANK_TRANSFER_BANK_CODE` is the bank identifier used in the public VietQR image URL. `BANK_TRANSFER_BANK_BIN` is the six-digit Vietnamese bank BIN shown in API responses.

### 4. Run tests

macOS / Linux:

```bash
./mvnw test
```

Windows:

```bat
mvnw.cmd test
```

### 5. Run the application

macOS / Linux:

```bash
./mvnw spring-boot:run
```

Windows:

```bat
mvnw.cmd spring-boot:run
```

The app runs at:

```text
http://localhost:8081
```

The customer UI is served at the root URL.

## React storefront development

The in-progress React storefront lives in [`frontend`](frontend). It currently includes the customer catalog, category and keyword filters, product details, and Vietnamese/English switching.

Start the Spring Boot API first, then in another terminal run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Vite proxies `/api/**` and `/media/**` requests to Spring Boot at `http://localhost:8081`, so the frontend uses relative API URLs in development and production.

Useful frontend checks:

```bash
npm run test
npm run build
npm run lint
```

The existing files under `src/main/resources/static` remain as the legacy customer UI until the React storefront replaces their complete customer flow.

## API snapshot

Customer-facing endpoints:

```text
GET  /api/categories
GET  /api/categories/{id}
GET  /api/products
GET  /api/products/{id}
POST /api/orders
GET  /api/orders/track?orderCode=...&phoneNumber=...
```

Seller order endpoints:

```text
GET   /api/seller/orders
GET   /api/seller/orders/{orderCode}
PATCH /api/seller/orders/{orderCode}/payment
PATCH /api/seller/orders/{orderCode}/status
```

Seller catalog endpoints:

```text
GET   /api/seller/categories
POST  /api/seller/categories
PUT   /api/seller/categories/{id}
PATCH /api/seller/categories/{id}/visibility

GET   /api/seller/products
POST  /api/seller/products
PUT   /api/seller/products/{id}
PATCH /api/seller/products/{id}/visibility
PATCH /api/seller/products/{id}/inventory

GET    /api/seller/products/{id}/images
POST   /api/seller/products/{id}/images
PATCH  /api/seller/products/{id}/images/{imageId}/primary
DELETE /api/seller/products/{id}/images/{imageId}
```

All `/api/seller/**` endpoints require an authenticated seller session. Obtain a CSRF token from `GET /api/seller/auth/csrf`, submit credentials to `POST /api/seller/auth/login`, and end the session with `POST /api/seller/auth/logout`.

The image upload endpoint consumes `multipart/form-data`. Send the file in an `image` part, with optional `primaryImage` and `sortOrder` fields. JPEG, PNG, and WebP files up to 5 MB are accepted.

For `BANK_TRANSFER` orders, `OrderResponse` includes a `bankTransfer` object with bank details, transfer content, QR image URL, amount, and payment due time. For `COD` orders, `bankTransfer` is `null`.

## Product image storage

Local development stores uploaded images under `./uploads/product-images` and serves them from `/media/product-images/**`. The directory is ignored by Git.

The default local configuration requires no additional values:

```text
IMAGE_STORAGE_PROVIDER=local
```

For AWS S3, configure:

```text
IMAGE_STORAGE_PROVIDER=s3
IMAGE_STORAGE_S3_BUCKET=<bucket-name>
AWS_REGION=ap-southeast-1
```

The S3 adapter uses the AWS SDK default credential chain. On AWS, give the application an IAM role with access to the bucket instead of storing access keys in this repository. S3 objects remain private; API responses contain temporary presigned display URLs.

## Local database

The local PostgreSQL container is defined in [`docker-compose.yaml`](docker-compose.yaml).
The application uses these local development values:

- database: `diyshop`
- username: `diyshop`
- password: `diyshop123`
- host: `localhost`
- port: `5432`

These credentials are for local development only.

## Flyway

Migrations live in:

```text
src/main/resources/db/migration
```

Current bootstrap migration:

```text
V1__create_categories.sql
```

Flyway runs automatically during application startup.
If a local development database reports a Flyway checksum mismatch after migration files change, reset the local Docker volume with `docker compose down -v` and start PostgreSQL again.

Latest migration:

```text
V6__add_product_image_storage.sql
```

## Useful commands

Start database:

```bash
docker compose up -d
```

Check container status:

```bash
docker compose ps
```

View database logs:

```bash
docker compose logs postgres
```

Stop database:

```bash
docker compose down
```

Reset local database volume:

```bash
docker compose down -v
```

## Project docs

- Project specification: [`docs/project-spec.md`](docs/project-spec.md)
- Domain glossary: [`CONTEXT.md`](CONTEXT.md)

## Troubleshooting

- If port `5432` is already in use, stop the local PostgreSQL service using that port before starting Docker Compose.
- If you need a clean local database, run `docker compose down -v` and start again.
