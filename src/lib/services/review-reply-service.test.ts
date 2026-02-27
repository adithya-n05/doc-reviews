import { describe, expect, it, vi } from "vitest";
import { createReviewReplyForUser } from "./review-reply-service";

describe("createReviewReplyForUser", () => {
  it("validates non-empty reply body", async () => {
    const persistence = {
      insertReply: vi.fn(),
    };

    const result = await createReviewReplyForUser(
      {
        userId: "user-1",
        reviewId: "review-1",
        parentReplyId: null,
        body: "   ",
      },
      persistence,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.body).toMatch(/required/i);
    }
    expect(persistence.insertReply).not.toHaveBeenCalled();
  });

  it("persists reply for valid input", async () => {
    const persistence = {
      insertReply: vi.fn().mockResolvedValue({ error: null }),
    };

    const result = await createReviewReplyForUser(
      {
        userId: "user-1",
        reviewId: "review-1",
        parentReplyId: "reply-0",
        body: "I agree with this take.",
      },
      persistence,
    );

    expect(result).toEqual({ ok: true });
    expect(persistence.insertReply).toHaveBeenCalledWith({
      userId: "user-1",
      reviewId: "review-1",
      parentReplyId: "reply-0",
      body: "I agree with this take.",
    });
  });

  it("returns db failure when persistence fails", async () => {
    const persistence = {
      insertReply: vi.fn().mockResolvedValue({ error: { message: "db failure" } }),
    };

    const result = await createReviewReplyForUser(
      {
        userId: "user-1",
        reviewId: "review-1",
        parentReplyId: null,
        body: "Looks useful",
      },
      persistence,
    );

    expect(result.ok).toBe(false);
    if (!result.ok && result.type === "db") {
      expect(result.message).toMatch(/db failure/i);
    }
  });
});
