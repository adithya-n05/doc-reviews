import { describe, expect, it, vi } from "vitest";
import { toggleHelpfulVoteForReply } from "@/lib/services/reply-helpful-service";

describe("toggleHelpfulVoteForReply", () => {
  it("rejects empty reply ids", async () => {
    const persistence = {
      hasVote: vi.fn(async () => false),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReply(persistence, {
      userId: "u1",
      replyId: "   ",
    });

    expect(result).toEqual({
      ok: false,
      type: "validation",
      message: "Reply id is required.",
    });
    expect(persistence.hasVote).not.toHaveBeenCalled();
  });

  it("adds helpful vote when user has not voted yet", async () => {
    const persistence = {
      hasVote: vi.fn(async () => false),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReply(persistence, {
      userId: "u1",
      replyId: "reply-1",
    });

    expect(result).toEqual({ ok: true, voted: true });
    expect(persistence.addVote).toHaveBeenCalledWith({
      userId: "u1",
      replyId: "reply-1",
    });
  });

  it("removes helpful vote when user already voted", async () => {
    const persistence = {
      hasVote: vi.fn(async () => true),
      addVote: vi.fn(async () => ({ error: null })),
      removeVote: vi.fn(async () => ({ error: null })),
    };

    const result = await toggleHelpfulVoteForReply(persistence, {
      userId: "u1",
      replyId: "reply-1",
    });

    expect(result).toEqual({ ok: true, voted: false });
    expect(persistence.removeVote).toHaveBeenCalledWith({
      userId: "u1",
      replyId: "reply-1",
    });
  });
});
