import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("replies api route", () => {
  const source = readFileSync("src/app/api/replies/route.ts", "utf8");

  it("supports create, update, and delete handlers", () => {
    expect(source).toContain("export async function POST");
    expect(source).toContain("export async function PATCH");
    expect(source).toContain("export async function DELETE");
  });

  it("uses reply services with authenticated supabase context", () => {
    expect(source).toContain("createSupabaseServerClient");
    expect(source).toContain("createReviewReplyForUser");
    expect(source).toContain("updateReviewReplyForUser");
    expect(source).toContain("deleteReviewReplyForUser");
  });
});
