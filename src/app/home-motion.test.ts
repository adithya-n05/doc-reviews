import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home page motion enhancements", () => {
  const page = readFileSync("src/app/page.tsx", "utf8");
  const css = readFileSync("src/app/globals.css", "utf8");

  it("uses count-up component for animated landing metrics", () => {
    expect(page).toContain('import { CountUpValue } from "@/components/count-up-value";');
    expect(page).toContain("<CountUpValue");
  });

  it("adds subtle section reveal animation with reduced-motion fallback", () => {
    expect(page).toContain("reveal-up");
    expect(css).toContain("@keyframes revealUp");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
