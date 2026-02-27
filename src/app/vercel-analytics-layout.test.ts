import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("vercel analytics wiring", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");

  it("renders Analytics component in root layout", () => {
    expect(layoutSource).toContain('import { Analytics } from "@vercel/analytics/react";');
    expect(layoutSource).toContain("<Analytics />");
  });
});
