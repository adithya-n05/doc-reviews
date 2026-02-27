import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("feedback widget wiring", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");

  it("renders feedback widget from root layout", () => {
    expect(layoutSource).toContain('import { FeedbackWidget } from "@/components/feedback-widget";');
    expect(layoutSource).toContain("<FeedbackWidget />");
  });
});
