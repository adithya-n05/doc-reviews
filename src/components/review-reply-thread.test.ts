import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("review reply thread optimistic client", () => {
  const source = readFileSync("src/components/review-reply-thread.tsx", "utf8");

  it("uses local state for immediate reply updates", () => {
    expect(source).toContain("useState");
    expect(source).toContain("setReplies");
    expect(source).toContain("optimistic");
  });

  it("persists create/edit/delete via lightweight replies api", () => {
    expect(source).toContain('fetch("/api/replies"');
    expect(source).toContain('method: "POST"');
    expect(source).toContain('method: "PATCH"');
    expect(source).toContain('method: "DELETE"');
  });

  it("persists reply helpful votes via dedicated replies helpful api", () => {
    expect(source).toContain('fetch("/api/replies/helpful"');
    expect(source).toContain('className={`reply-helpful-btn ${reply.viewerHasHelpfulVote ? "voted" : ""}`}');
    expect(source).toContain("reply.helpfulCount");
  });

  it("does not render syncing status text for reply mutations", () => {
    expect(source).not.toContain("Syncing replies...");
  });

  it("uses editorial v3 reply section classes and chevron toggle", () => {
    expect(source).toContain('className={`reply-toggle ${threadOpen ? "expanded" : ""}`}');
    expect(source).toContain('className={`replies-section ${threadOpen ? "open" : ""}`}');
    expect(source).toContain('className="replies-list"');
    expect(source).toContain('className="reply-item"');
    expect(source).toContain('className="reply-composer"');
    expect(source).toContain('className="reply-composer-input"');
  });
});
