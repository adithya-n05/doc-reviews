import { describe, expect, it, vi } from "vitest";
import { submitFeedback } from "./feedback-submit";

function jsonResponse(
  status: number,
  body: Record<string, unknown> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("submitFeedback", () => {
  it("returns ok true on first successful submission", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(201, { ok: true }));

    const result = await submitFeedback(
      { message: "Improve module search ranking", pagePath: "/modules" },
      fetchMock,
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once on transient 500 failure and then succeeds", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(500, { error: "temporary outage" }))
      .mockResolvedValueOnce(jsonResponse(201, { ok: true }));

    const result = await submitFeedback(
      { message: "Feedback message", pagePath: "/profile" },
      fetchMock,
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry on validation failures from the server", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(400, { error: "Invalid payload." }));

    const result = await submitFeedback(
      { message: " ", pagePath: "/modules" },
      fetchMock,
    );

    expect(result).toEqual({ ok: false, error: "Invalid payload." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns fallback error when network request throws repeatedly", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockRejectedValueOnce(new Error("socket hang up"));

    const result = await submitFeedback(
      { message: "Feedback", pagePath: "/modules/40001" },
      fetchMock,
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/unable to submit feedback/i);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
