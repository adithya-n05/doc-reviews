import { describe, expect, it } from "vitest";
import { parseModuleCatalogueSearchParams } from "@/lib/modules/query-params";

describe("parseModuleCatalogueSearchParams", () => {
  it("parses valid filter/sort/page values", () => {
    expect(
      parseModuleCatalogueSearchParams({
        q: "algorithms",
        year: "2",
        sort: "most_reviewed",
        page: "3",
      }),
    ).toEqual({
      search: "algorithms",
      year: "2",
      sort: "most_reviewed",
      page: 3,
    });
  });

  it("falls back to defaults for invalid values", () => {
    expect(
      parseModuleCatalogueSearchParams({
        q: "",
        year: "year-1",
        sort: "unknown",
        page: "-1",
      }),
    ).toEqual({
      search: "",
      year: "all",
      sort: "rating_desc",
      page: 1,
    });
  });

  it("handles missing params", () => {
    expect(parseModuleCatalogueSearchParams({})).toEqual({
      search: "",
      year: "all",
      sort: "rating_desc",
      page: 1,
    });
  });
});
