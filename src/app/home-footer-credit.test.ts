import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("home page footer credit", () => {
  const source = readFileSync("src/app/page.tsx", "utf8");

  it("shows the requested maker credit under the DoC Reviews mark", () => {
    expect(source).toContain("Made by Adithya");
  });
});
