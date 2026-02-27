import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("feedback api route", () => {
  const source = readFileSync("src/app/api/feedback/route.ts", "utf8");

  it("exports POST handler", () => {
    expect(source).toContain("export async function POST");
  });

  it("writes submissions to feedback_submissions", () => {
    expect(source).toContain("createSupabaseServerClient");
    expect(source).toContain('.from("feedback_submissions")');
    expect(source).toContain("message");
    expect(source).toContain("page_path");
  });
});
