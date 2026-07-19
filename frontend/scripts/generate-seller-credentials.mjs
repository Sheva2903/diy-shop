import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const username = "seller";
const password = "seller123";
const passwordHash = "$2b$10$J.XYJaQvsNAdE8PRylrLm.sISTaJmqajyVeqxfWx/itA9osZMJJEW";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "../..");
const environmentFile = resolve(projectRoot, ".seller-dev.env");
const contents = [
  "# Development-only seller credentials. This file is ignored by Git.",
  `export DIY_SHOP_SELLER_USERNAME='${username}'`,
  `export DIY_SHOP_SELLER_PASSWORD_HASH='${passwordHash}'`,
  ""
].join("\n");

await writeFile(environmentFile, contents, { encoding: "utf8", mode: 0o600 });

console.log(`Created ${environmentFile}`);
console.log(`Seller username: ${username}`);
console.log(`Seller password: ${password}`);
console.log("Start Spring Boot with: source .seller-dev.env && ./mvnw spring-boot:run");
