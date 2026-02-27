import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("auth brand", () => {
  const source = readFileSync("src/components/auth-brand.tsx", "utf8");

  it("links logo title back to the landing page", () => {
    expect(source).toContain("import Link from \"next/link\";");
    expect(source).toContain("<Link href=\"/\" className=\"auth-brand-title\">");
  });
});
