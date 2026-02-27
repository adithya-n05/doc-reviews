import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("module catalogue performance wiring", () => {
  const source = readFileSync("src/app/modules/page.tsx", "utf8");

  it("maps list rows with a catalogue-specific presenter", () => {
    expect(source).toContain(
      'import { toModuleCatalogueItem } from "@/lib/modules/presenter";',
    );
    expect(source).toContain("rows.map((row) => toModuleCatalogueItem(row))");
  });

  it("does not depend on detail presenter in list page", () => {
    expect(source).not.toContain("toModuleListItem");
  });

  it("uses shared cached catalogue fetch path", () => {
    expect(source).toContain('import { fetchModuleCatalogueRowsCached } from "@/lib/server/module-queries";');
    expect(source).toContain("fetchModuleCatalogueRowsCached()");
    expect(source).not.toContain("fetchModuleCatalogueRows(client)");
  });
});
