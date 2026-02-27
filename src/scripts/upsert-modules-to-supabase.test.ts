import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module upsert staff profile enrichment", () => {
  const source = readFileSync("scripts/upsert-modules-to-supabase.ts", "utf8");

  it("builds a computing staff directory index from Imperial people pages", () => {
    expect(source).toContain("STAFF_DIRECTORY_URLS");
    expect(source).toContain("parseStaffDirectoryHtml");
    expect(source).toContain("buildStaffDirectoryIndex");
  });

  it("populates leader profile_url and photo_url when inserting module leaders", () => {
    expect(source).toContain("const matchedProfile = matchLeaderProfile(leaderName, staffIndex);");
    expect(source).toContain("leader_name: matchedProfile?.canonicalName ?? leaderName");
    expect(source).toContain("profile_url: matchedProfile?.profileUrl ?? null");
    expect(source).toContain("photo_url: matchedProfile?.photoUrl ?? null");
  });
});
