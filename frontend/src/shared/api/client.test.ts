import { afterEach, describe, expect, it, vi } from "vitest";

import { getJson } from "./client";

describe("getJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves the Spring Boot API error message and status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 404,
            message: "Product not found",
            path: "/api/products/99"
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    await expect(getJson("/api/products/99")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Product not found",
      path: "/api/products/99"
    });
  });
});
