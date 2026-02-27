import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("teaching staff layout", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("uses a wrapping grid for staff cards instead of a single flex row", () => {
    expect(css).toContain(".staff-grid");
    expect(css).toContain("grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));");
    expect(css).not.toContain(".staff-grid { flex-direction: column; }");
  });

  it("styles linked staff cards as full-surface interactive blocks", () => {
    expect(css).toContain(".staff-card-link");
    expect(css).toContain("width: 100%;");
    expect(css).toContain("background: var(--cream-dark);");
    expect(css).not.toContain("box-shadow: inset 0 0 0 1px var(--accent);");
  });
});
