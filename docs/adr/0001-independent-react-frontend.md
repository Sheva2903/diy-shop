# Keep the React frontend independently buildable

The customer storefront and future seller dashboard will be a React, TypeScript, and Vite application under `/frontend`, independently built from the Spring Boot backend. During development Vite proxies API and media requests to Spring Boot; the frontend will not be built by Maven or packaged into the backend JAR. This preserves a simple local workflow while matching the intended AWS boundary where static frontend assets can be deployed through S3 and CloudFront separately from the backend.

## Considered Options

- Continue extending the static HTML, CSS, and JavaScript served by Spring Boot.
- Have Maven run the frontend build and package its output into the Spring Boot JAR.
- Keep the frontend independently buildable and deployable.

## Consequences

The existing static storefront remains temporarily available while the React storefront is built on a separate development port. A later cutover will remove the duplicate static customer UI once the React customer flow reaches feature parity.
