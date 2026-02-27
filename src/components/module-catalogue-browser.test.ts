import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue browser performance wiring", () => {
  const source = readFileSync("src/components/module-catalogue-browser.tsx", "utf8");

  it("filters and paginates locally on the client", () => {
    expect(source).toContain("applyModuleListQuery(");
    expect(source).toContain("paginateModules(");
  });

  it("debounces search updates before applying client filtering", () => {
    expect(source).toContain("window.setTimeout");
    expect(source).toContain("setDebouncedSearch(search)");
    expect(source).toContain("250");
  });

  it("syncs URL query state without router navigation", () => {
    expect(source).toContain("window.history.replaceState");
    expect(source).not.toContain("router.replace(");
  });
});
