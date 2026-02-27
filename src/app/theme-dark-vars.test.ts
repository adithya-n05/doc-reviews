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

  it("styles floating theme toggle control", () => {
    expect(css).toContain(".theme-toggle-footer");
    expect(css).toContain(".theme-toggle");
    expect(css).toContain(".theme-toggle:hover");
    expect(css).toContain(".theme-toggle-track");
    expect(css).toContain(".theme-toggle-thumb");
    expect(css).toContain(".theme-toggle-state");
    expect(css).toContain(".sr-only");
  });

  it("anchors footer theme toggle area to the left edge", () => {
    expect(css).toContain(".theme-toggle-footer");
    expect(css).toContain("justify-content: flex-start;");
  });

  it("styles collapsible review thread controls for reply readability", () => {
    expect(css).toContain(".review-thread");
    expect(css).toContain(".reply-thread-btn");
    expect(css).toContain(".review-reply");
    expect(css).toContain(".reply-open-label");
    expect(css).toContain(".reply-close-label");
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
