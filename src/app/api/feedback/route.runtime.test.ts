import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClientMock } = vi.hoisted(() => ({
  createSupabaseServerClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}));

import { POST } from "./route";

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    createSupabaseServerClientMock.mockReset();
  });

  it("returns 201 when feedback is persisted", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const getUser = vi
      .fn()
      .mockResolvedValue({ data: { user: { id: "a7d7a6de-39f0-45cb-a4f3-b0a17ef9c780" } } });

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser },
      from,
    });

    const response = await POST(
      buildRequest({
        message: "Please add profile photos in settings.",
        pagePath: "/profile",
        feedbackType: "ui",
        context: { userAgent: "vitest" },
      }),
    );

    expect(response.status).toBe(201);
    expect(from).toHaveBeenCalledWith("feedback_submissions");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        feedback_type: "ui",
        context: { userAgent: "vitest" },
      }),
    );
  });

  it("returns 500 when Supabase client creation throws", async () => {
    createSupabaseServerClientMock.mockRejectedValue(new Error("cookies unavailable"));

    const response = await POST(
      buildRequest({
        message: "Feedback",
        pagePath: "/",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/unable to submit feedback/i),
    });
  });
});
