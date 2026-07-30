# DIY Shop

A DIY & handmade goods storefront: Spring Boot API + React storefront + PostgreSQL.

This README covers running the project locally. For scope and MVP requirements see [`docs/project-spec.md`](docs/project-spec.md).

## Prerequisites

| Tool | Version | Used for |
| --- | --- | --- |
| Java | 17 | Backend (`./mvnw` downloads Maven itself) |
| Docker | any recent | Local PostgreSQL |
| Node.js | 20+ | React storefront |

## Run it locally

Four steps, in this order. The backend refuses to start without step 2.

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts `diy-shop-postgres` on `localhost:5432` with database/user/password `diyshop` / `diyshop` / `diyshop123`, matching the defaults in [`src/main/resources/application.properties`](src/main/resources/application.properties). Data persists in a Docker volume.

### 2. Set the required environment variables

The backend reads seller credentials and bank transfer details from the environment and **fails at startup if they are missing** — there is no default.

Generate the local seller account (`seller` / `seller123`) into the Git-ignored `.seller-dev.env`:

```bash
npm --prefix frontend run generate:seller
```

Then copy [`.env.example`](.env.example) for the bank transfer values and fill in the account number and name (`.env.local` is Git-ignored):

```bash
cp .env.example .env.local
```

Load both into your shell:

```bash
source .seller-dev.env
source .env.local
```

Keep these in two files: `npm run generate:seller` overwrites `.seller-dev.env` every time it runs.

> The `seller` / `seller123` credentials are for local development only. Never reuse them in a deployed environment, and never commit either file.

### 3. Start the backend

```bash
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

Runs on `http://localhost:8081`. Flyway applies the migrations in [`src/main/resources/db/migration`](src/main/resources/db/migration) automatically on startup, including the seed catalog in `V4__seed_initial_catalog.sql`.

Check it is up:

```bash
curl http://localhost:8081/api/health
# {"status":"ok","app":"diy-shop"}
```

Run this in the same terminal where you sourced the env files, otherwise the variables are not visible to the process.

### 4. Start the React storefront

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Vite proxies `/api/**` and `/media/**` to the backend on port 8081 (see [`frontend/vite.config.ts`](frontend/vite.config.ts)), so the frontend calls the API with relative paths and needs no environment variables of its own. [`frontend/.env.example`](frontend/.env.example) documents that.

## Where things are

| URL | What |
| --- | --- |
| `http://localhost:5173` | React storefront (catalog, product detail, VI/EN switch) |
| `http://localhost:8081` | Legacy static customer UI — still the only place with checkout + order tracking |
| `http://localhost:8081/api/health` | Health check |
| `localhost:5432` | PostgreSQL |

The React app does not cover checkout or order tracking yet; those flows live in [`src/main/resources/static`](src/main/resources/static) until it does.

## Environment variables

Required — startup fails without them:

| Variable | Notes |
| --- | --- |
| `DIY_SHOP_SELLER_USERNAME` | Seller login name |
| `DIY_SHOP_SELLER_PASSWORD_HASH` | BCrypt hash, never a plain-text password |
| `BANK_TRANSFER_BANK_NAME` | Display name of the receiving bank |
| `BANK_TRANSFER_BANK_CODE` | Bank identifier used in the public VietQR image URL |
| `BANK_TRANSFER_BANK_BIN` | Six-digit Vietnamese bank BIN returned in API responses |
| `BANK_TRANSFER_ACCOUNT_NUMBER` | Receiving account number |
| `BANK_TRANSFER_ACCOUNT_NAME` | Receiving account holder |

Optional — sensible defaults for local development:

| Variable | Default | Notes |
| --- | --- | --- |
| `BANK_TRANSFER_TEMPLATE` | `compact` | VietQR image template |
| `BANK_TRANSFER_PAYMENT_DUE_HOURS` | `24` | Payment window for bank transfer orders |
| `IMAGE_STORAGE_PROVIDER` | `local` | `local` or `s3` |
| `IMAGE_STORAGE_LOCAL_DIRECTORY` | `./uploads/product-images` | Served at `/media/product-images/**`, Git-ignored |
| `IMAGE_STORAGE_MAX_FILE_SIZE` | `5MB` | JPEG, PNG, and WebP are accepted |
| `IMAGE_STORAGE_S3_BUCKET` | — | Required when the provider is `s3` |
| `AWS_REGION` | `ap-southeast-1` | S3 region |
| `IMAGE_STORAGE_S3_URL_DURATION_MINUTES` | `60` | Lifetime of presigned display URLs |

The S3 adapter uses the AWS SDK default credential chain — use an IAM role rather than putting access keys in this repository. S3 objects stay private and API responses carry temporary presigned URLs.

## Common commands

Backend:

```bash
./mvnw test                 # run tests
./mvnw spring-boot:run      # run the API
./mvnw clean package        # build the jar into target/
```

Frontend (from `frontend/`):

```bash
npm run dev                 # dev server on :5173
npm run test                # vitest
npm run lint                # eslint
npm run build               # type-check + production build into dist/
```

Database:

```bash
docker compose up -d        # start
docker compose ps           # status
docker compose logs postgres
docker compose down         # stop, keep data
docker compose down -v      # stop and wipe the volume
```

## API snapshot

Customer:

```text
GET  /api/categories
GET  /api/categories/{id}
GET  /api/products
GET  /api/products/{id}
POST /api/orders
GET  /api/orders/track?orderCode=...&phoneNumber=...
```

Seller orders:

```text
GET   /api/seller/orders
GET   /api/seller/orders/{orderCode}
PATCH /api/seller/orders/{orderCode}/payment
PATCH /api/seller/orders/{orderCode}/status
```

Seller catalog:

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

Every `/api/seller/**` endpoint needs an authenticated session: fetch a CSRF token from `GET /api/seller/auth/csrf`, post credentials to `POST /api/seller/auth/login`, end with `POST /api/seller/auth/logout`.

Image upload consumes `multipart/form-data` — file in an `image` part, plus optional `primaryImage` and `sortOrder` fields.

`BANK_TRANSFER` orders return a `bankTransfer` object (bank details, transfer content, QR image URL, amount, due time). `COD` orders return `null` there.

## Troubleshooting

**Backend exits immediately with a property placeholder error.** One of the required variables from step 2 is missing. Re-run `source .seller-dev.env && source .env.local` in the terminal you start Maven from.

**Flyway reports a checksum mismatch.** A migration file changed after it had already been applied locally. Reset the volume:

```bash
docker compose down -v && docker compose up -d
```

**Port 5432 already in use.** Another PostgreSQL is running — stop it, or change the host-side port mapping in [`docker-compose.yaml`](docker-compose.yaml).

**Frontend loads but every request 404s or hangs.** The backend is not running on 8081; Vite only proxies, it does not serve the API.

**Seller login returns 401.** Password is `seller123` and the hash in the environment must be the one written by `npm run generate:seller`. If you exported `DIY_SHOP_SELLER_PASSWORD_HASH` by hand, make sure it is a BCrypt hash and not the plain password.

## Project docs

- Specification: [`docs/project-spec.md`](docs/project-spec.md)
- Notes: [`docs/notes.md`](docs/notes.md)
- ADR — independent React frontend: [`docs/adr/0001-independent-react-frontend.md`](docs/adr/0001-independent-react-frontend.md)
