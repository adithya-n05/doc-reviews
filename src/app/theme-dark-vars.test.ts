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
    expect(css).toContain("--inverse-bg:");
    expect(css).toContain("--inverse-text:");
  });

  it("styles nav theme toggle control", () => {
    expect(css).toContain(".theme-toggle");
    expect(css).toContain(".theme-toggle:hover");
    expect(css).toContain(".nav-divider");
    expect(css).toContain(".theme-toggle svg");
    expect(css).toContain(".theme-toggle .sun");
    expect(css).toContain(".theme-toggle .moon");
  });

  it("toggles icon visibility for dark mode", () => {
    expect(css).toContain(':root[data-theme="dark"] .theme-toggle .sun');
    expect(css).toContain(':root[data-theme="dark"] .theme-toggle .moon');
  });

  it("styles editorial v3 reply thread controls for readability", () => {
    expect(css).toContain(".review-thread-shell");
    expect(css).toContain(".reply-toggle");
    expect(css).toContain(".replies-section");
    expect(css).toContain(".reply-item");
    expect(css).toContain(".reply-composer");
  });

  it("styles success/error banners with theme tokens instead of raw light-only colors", () => {
    const successBlock = css.match(/\.form-banner\.success\s*\{[^}]*\}/)?.[0] ?? "";
    const errorBlock = css.match(/\.form-banner\.error\s*\{[^}]*\}/)?.[0] ?? "";

    expect(successBlock).toContain("var(--success-border)");
    expect(successBlock).toContain("var(--success-bg)");
    expect(successBlock).toContain("var(--success-text)");
    expect(successBlock).not.toContain("#");

    expect(errorBlock).toContain("var(--error-border)");
    expect(errorBlock).toContain("var(--error-bg)");
    expect(errorBlock).toContain("var(--error-text)");
    expect(errorBlock).not.toContain("#");
  });
});
