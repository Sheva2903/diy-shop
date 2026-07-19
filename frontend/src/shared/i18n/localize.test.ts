import { describe, expect, it } from "vitest";

import { localizeDescription, localizeName } from "./localize";

describe("bilingual content localization", () => {
  it("falls back to the other product language when the requested value is absent", () => {
    const product = {
      nameVi: "Nến đậu nành",
      nameEn: "",
      descriptionVi: "Mùi hương dịu nhẹ.",
      descriptionEn: ""
    };

    expect(localizeName(product, "en")).toBe("Nến đậu nành");
    expect(localizeDescription(product, "en")).toBe("Mùi hương dịu nhẹ.");
  });
});
