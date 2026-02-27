import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("landing ticker readability", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("uses inverse-surface tokens for ticker background and text", () => {
    const tickerBlock = css.match(/\.landing-ticker\s*\{[^}]*\}/)?.[0] ?? "";
    const labelBlock = css.match(/\.ticker-label\s*\{[^}]*\}/)?.[0] ?? "";
    const statBlock = css.match(/\.ticker-stat\s*\{[^}]*\}/)?.[0] ?? "";
    const separatorBlock = css.match(/\.ticker-separator\s*\{[^}]*\}/)?.[0] ?? "";

    expect(tickerBlock).toContain("background: var(--inverse-bg);");
    expect(tickerBlock).toContain("color: var(--inverse-text);");
    expect(labelBlock).toContain("color: var(--inverse-text);");
    expect(labelBlock).toContain("font-size: 12px;");
    expect(labelBlock).toContain("background: rgba(255, 255, 255, 0.22);");
    expect(labelBlock).toContain("border: 1px solid rgba(255, 255, 255, 0.38);");
    expect(statBlock).toContain("color: var(--inverse-text-muted);");
    expect(separatorBlock).toContain("color: var(--inverse-divider);");
  });
});
