import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("write review rating UI", () => {
  const source = readFileSync("src/app/modules/[code]/review/page.tsx", "utf8");

  it("uses star rating fields component instead of select dropdowns", () => {
    expect(source).toContain('import { ReviewRatingFields } from "@/components/review-rating-fields";');
    expect(source).toContain("<ReviewRatingFields");
    expect(source).not.toContain("function ratingSelect");
  });
});
