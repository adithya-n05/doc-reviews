import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type ModuleCatalog = {
  modules: Array<{
    code: string;
    description: string;
  }>;
};

function loadCatalog(): ModuleCatalog {
  const source = readFileSync("data/module-catalog.json", "utf8");
  return JSON.parse(source) as ModuleCatalog;
}

describe("module description quality", () => {
  it("does not contain known truncated boilerplate-only descriptions", () => {
    const catalog = loadCatalog();
    const truncatedCodes = catalog.modules
      .filter((module) =>
        /^In this module you will have the opportunity to:?$/i.test(module.description.trim()),
      )
      .map((module) => module.code);

    expect(truncatedCodes).toEqual([]);
  });

  it("does not leave HTML quote entities in descriptions", () => {
    const catalog = loadCatalog();
    const encodedCodes = catalog.modules
      .filter((module) => module.description.includes("&quot;"))
      .map((module) => module.code);

    expect(encodedCodes).toEqual([]);
  });
});
