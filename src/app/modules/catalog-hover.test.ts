import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue hover behavior", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("keeps module-card hover subtle without text underline", () => {
    const hoverBlock = css.match(/\.module-card:hover\s*\{[^}]*\}/)?.[0] ?? "";

    expect(hoverBlock).toContain("background: var(--cream-dark);");
    expect(hoverBlock).toContain("text-decoration: none;");
  });
});
