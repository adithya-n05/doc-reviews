import { describe, expect, it, vi } from "vitest";
import { elapsedMs, startTiming } from "@/lib/server/timing";

describe("server timing helpers", () => {
  it("captures a numeric start timestamp", () => {
    const start = startTiming();
    expect(typeof start).toBe("number");
    expect(Number.isFinite(start)).toBe(true);
  });

  it("computes elapsed milliseconds from a start timestamp", () => {
    const dateNowSpy = vi.spyOn(Date, "now");
    dateNowSpy.mockReturnValueOnce(1500);
    dateNowSpy.mockReturnValueOnce(1525);

    const start = startTiming();
    expect(elapsedMs(start)).toBe(25);

    dateNowSpy.mockRestore();
  });
});
