import { describe, expect, it, vi } from "vitest";
import {
  createReviewReplyForUser,
  deleteReviewReplyForUser,
  updateReviewReplyForUser,
} from "./review-reply-service";

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

  it("returns db failure when persistence throws", async () => {
    const persistence = {
      insertReply: vi.fn(async () => {
        throw new Error("timeout");
      }),
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

    expect(result).toEqual({
      ok: false,
      type: "db",
      message: "timeout",
    });
  });
});

describe("updateReviewReplyForUser", () => {
  it("validates non-empty reply id", async () => {
    const persistence = {
      updateReply: vi.fn(),
    };

    const result = await updateReviewReplyForUser(
      {
        userId: "user-1",
        replyId: "   ",
        body: "Updated body",
      },
      persistence,
    );

    expect(result).toEqual({
      ok: false,
      type: "validation",
      message: "Reply id is required.",
    });
    expect(persistence.updateReply).not.toHaveBeenCalled();
  });

  it("updates reply body for valid input", async () => {
    const persistence = {
      updateReply: vi.fn().mockResolvedValue({ error: null }),
    };

    const result = await updateReviewReplyForUser(
      {
        userId: "user-1",
        replyId: "reply-1",
        body: "  Updated body text  ",
      },
      persistence,
    );

    expect(result).toEqual({ ok: true });
    expect(persistence.updateReply).toHaveBeenCalledWith({
      userId: "user-1",
      replyId: "reply-1",
      body: "Updated body text",
    });
  });
});

describe("deleteReviewReplyForUser", () => {
  it("validates non-empty reply id", async () => {
    const persistence = {
      deleteReply: vi.fn(),
    };

    const result = await deleteReviewReplyForUser(
      {
        userId: "user-1",
        replyId: "",
      },
      persistence,
    );

    expect(result).toEqual({
      ok: false,
      type: "validation",
      message: "Reply id is required.",
    });
    expect(persistence.deleteReply).not.toHaveBeenCalled();
  });

  it("deletes owner reply for valid input", async () => {
    const persistence = {
      deleteReply: vi.fn().mockResolvedValue({ error: null }),
    };

    const result = await deleteReviewReplyForUser(
      {
        userId: "user-1",
        replyId: "reply-1",
      },
      persistence,
    );

    expect(result).toEqual({ ok: true });
    expect(persistence.deleteReply).toHaveBeenCalledWith({
      userId: "user-1",
      replyId: "reply-1",
    });
  });
});
