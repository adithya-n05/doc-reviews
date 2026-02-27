import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("review/reply editorial v3 spacing parity", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("keeps helpful counts and action spacing aligned with mockup rhythm", () => {
    const helpfulCountBlock = css.match(/\.helpful-count\s*\{[^}]*\}/)?.[0] ?? "";
    const replyActionsBlock = css.match(/\.reply-actions\s*\{[^}]*\}/)?.[0] ?? "";
    const reviewActionsLeftBlock = css.match(/\.review-actions-left\s*\{[^}]*\}/)?.[0] ?? "";

    expect(helpfulCountBlock).toContain("min-width: 20px;");
    expect(replyActionsBlock).toContain("gap: 12px;");
    expect(reviewActionsLeftBlock).not.toContain("flex-wrap");
  });

  it("uses compact reply-toggle spacing before expanded thread content", () => {
    const replyToggleBlock = css.match(/\.reply-toggle\s*\{[^}]*\}/)?.[0] ?? "";
    const threadShellBlock = css.match(/\.review-thread-shell\s*\{[^}]*\}/)?.[0] ?? "";

    expect(replyToggleBlock).toContain("margin: 0;");
    expect(threadShellBlock).toContain("padding: 10px 20px 0;");
    expect(threadShellBlock).toContain("background: var(--cream);");
  });
});
