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

Not implemented yet:

- Seller product/category management APIs
- Seller dashboard UI
- Authentication for seller endpoints
- Email notifications
- VietQR generation
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

## Prerequisites

- Java 17
- Docker

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Run tests

macOS / Linux:

```bash
./mvnw test
```

Windows:

```bat
mvnw.cmd test
```

### 3. Run the application

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

Seller endpoints are not authenticated yet and are for local development only.

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
V5__create_orders.sql
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
