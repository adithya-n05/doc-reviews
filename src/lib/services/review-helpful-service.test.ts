import { describe, expect, it, vi } from "vitest";
import { toggleHelpfulVoteForReview } from "@/lib/services/review-helpful-service";

describe("toggleHelpfulVoteForReview", () => {
  it("rejects empty review ids", async () => {
    const persistence = {
      hasVote: vi.fn(async () => false),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReview(persistence, {
      userId: "u1",
      reviewId: "   ",
    });

    expect(result).toEqual({
      ok: false,
      type: "validation",
      message: "Review id is required.",
    });
    expect(persistence.hasVote).not.toHaveBeenCalled();
  });

  it("adds helpful vote when user has not voted yet", async () => {
    const persistence = {
      hasVote: vi.fn(async () => false),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReview(persistence, {
      userId: "u1",
      reviewId: "r1",
    });

    expect(result).toEqual({ ok: true, voted: true });
    expect(persistence.addVote).toHaveBeenCalledWith({
      userId: "u1",
      reviewId: "r1",
    });
    expect(persistence.removeVote).not.toHaveBeenCalled();
  });

  it("removes helpful vote when user already voted", async () => {
    const persistence = {
      hasVote: vi.fn(async () => true),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReview(persistence, {
      userId: "u1",
      reviewId: "r1",
    });

    expect(result).toEqual({ ok: true, voted: false });
    expect(persistence.removeVote).toHaveBeenCalledWith({
      userId: "u1",
      reviewId: "r1",
    });
    expect(persistence.addVote).not.toHaveBeenCalled();
  });

  it("returns db failure when persistence lookup throws", async () => {
    const persistence = {
      hasVote: vi.fn(async () => {
        throw new Error("connection dropped");
      }),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReview(persistence, {
      userId: "u1",
      reviewId: "r1",
    });

    expect(result).toEqual({
      ok: false,
      type: "db",
      message: "connection dropped",
    });
  });
});
