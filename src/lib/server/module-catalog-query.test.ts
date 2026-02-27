import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue query payload", () => {
  const source = readFileSync("src/lib/server/module-queries.ts", "utf8");
  const start = source.indexOf("export async function fetchModuleCatalogueRows");
  const end = source.indexOf("export async function fetchModuleByCode");
  const block = source.slice(start, end);

  it("fetches list-only fields for catalogue view", () => {
    expect(block).toContain("id,code,title");
    expect(block).toContain("module_offerings(study_year)");
    expect(block).toContain("module_review_aggregates(");
  });

  it("does not fetch detail-only description/leaders for catalogue view", () => {
    expect(block).not.toContain("description");
    expect(block).not.toContain("module_leaders(");
  });
});
