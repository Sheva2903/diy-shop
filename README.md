# DIY Shop

Spring Boot backend for a DIY & handmade goods storefront.

## Repository scope

This repository currently contains the backend foundation and local development setup.
Project scope and MVP requirements are documented in [`docs/project-spec.md`](docs/project-spec.md).

## Stack

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Flyway
- PostgreSQL
- Docker

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
http://localhost:8080
```

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
V1__init.sql
```

Flyway runs automatically during application startup.

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
