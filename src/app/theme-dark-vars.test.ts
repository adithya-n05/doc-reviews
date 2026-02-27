import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dark theme css variables", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("defines dark-mode token overrides behind data-theme selector", () => {
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain("--cream:");
    expect(css).toContain("--ink:");
    expect(css).toContain("--border:");
    expect(css).toContain("--accent-bg:");
  });

  it("styles floating theme toggle control", () => {
    expect(css).toContain(".theme-toggle");
    expect(css).toContain(".theme-toggle:hover");
    expect(css).toContain(".theme-toggle-icon");
    expect(css).toContain(".sr-only");
  });
});
