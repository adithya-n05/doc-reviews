import { describe, expect, it } from "vitest";
import {
  applyModuleListQuery,
  difficultyLabel,
  difficultyPipCount,
  normalizeYearFilter,
  paginateModules,
  sortModules,
  type ModuleListItem,
} from "@/lib/modules/catalog";

const FIXTURES: ModuleListItem[] = [
  {
    id: "1",
    code: "40008",
    title: "Graphs and Algorithms",
    studyYears: [1],
    reviewCount: 42,
    avgOverall: 4.3,
    avgDifficulty: 3.4,
  },
  {
    id: "2",
    code: "50001",
    title: "Algorithm Design",
    studyYears: [2],
    reviewCount: 38,
    avgOverall: 4.1,
    avgDifficulty: 4,
  },
  {
    id: "3",
    code: "50003",
    title: "Models of Computation",
    studyYears: [2],
    reviewCount: 44,
    avgOverall: 3.5,
    avgDifficulty: 4.8,
  },
  {
    id: "4",
    code: "70011",
    title: "Machine Learning for Vision",
    studyYears: [4],
    reviewCount: 11,
    avgOverall: 4.7,
    avgDifficulty: 3.7,
  },
  {
    id: "5",
    code: "70007",
    title: "Advanced Distributed Systems",
    studyYears: [4],
    reviewCount: 27,
    avgOverall: 4.7,
    avgDifficulty: 4.6,
  },
];

describe("normalizeYearFilter", () => {
  it("returns all for missing, all, and invalid values", () => {
    expect(normalizeYearFilter(undefined)).toBe("all");
    expect(normalizeYearFilter(null)).toBe("all");
    expect(normalizeYearFilter("all")).toBe("all");
    expect(normalizeYearFilter("year-1")).toBe("all");
    expect(normalizeYearFilter("0")).toBe("all");
    expect(normalizeYearFilter("9")).toBe("all");
  });

  it("returns numeric year for valid 1-4 input", () => {
    expect(normalizeYearFilter("1")).toBe(1);
    expect(normalizeYearFilter("4")).toBe(4);
    expect(normalizeYearFilter(2)).toBe(2);
  });
});

describe("sortModules", () => {
  it("sorts by rating high-to-low with code tie-break", () => {
    const sorted = sortModules(FIXTURES, "rating_desc");
    expect(sorted.map((item) => item.code)).toEqual([
      "70007",
      "70011",
      "40008",
      "50001",
      "50003",
    ]);
  });

  it("sorts by rating low-to-high", () => {
    const sorted = sortModules(FIXTURES, "rating_asc");
    expect(sorted.map((item) => item.code)).toEqual([
      "50003",
      "50001",
      "40008",
      "70007",
      "70011",
    ]);
  });

  it("sorts by most reviewed", () => {
    const sorted = sortModules(FIXTURES, "most_reviewed");
    expect(sorted.map((item) => item.code)).toEqual([
      "50003",
      "40008",
      "50001",
      "70007",
      "70011",
    ]);
  });

  it("sorts by difficulty high-to-low", () => {
    const sorted = sortModules(FIXTURES, "difficulty_desc");
    expect(sorted.map((item) => item.code)).toEqual([
      "50003",
      "70007",
      "50001",
      "70011",
      "40008",
    ]);
  });

  it("sorts alphabetically by title", () => {
    const sorted = sortModules(FIXTURES, "alphabetical");
    expect(sorted.map((item) => item.title)).toEqual([
      "Advanced Distributed Systems",
      "Algorithm Design",
      "Graphs and Algorithms",
      "Machine Learning for Vision",
      "Models of Computation",
    ]);
  });
});

describe("applyModuleListQuery", () => {
  it("filters by year and search string across code and title", () => {
    const output = applyModuleListQuery(FIXTURES, {
      search: "algo",
      year: "1",
      sort: "rating_desc",
    });
    expect(output.map((item) => item.code)).toEqual(["40008"]);
  });

  it("returns all records when search and year are empty", () => {
    const output = applyModuleListQuery(FIXTURES, {
      search: "  ",
      year: "all",
      sort: "rating_desc",
    });
    expect(output).toHaveLength(5);
  });

  it("does case-insensitive search by module code", () => {
    const output = applyModuleListQuery(FIXTURES, {
      search: "70011",
      year: "all",
      sort: "rating_desc",
    });
    expect(output.map((item) => item.code)).toEqual(["70011"]);
  });

  it("ignores invalid year values rather than dropping all data", () => {
    const output = applyModuleListQuery(FIXTURES, {
      search: "",
      year: "9",
      sort: "rating_desc",
    });
    expect(output).toHaveLength(5);
  });
});

describe("difficulty metadata", () => {
  it("maps difficulty score to label bands", () => {
    expect(difficultyLabel(1.2)).toBe("Easy");
    expect(difficultyLabel(2.5)).toBe("Med.");
    expect(difficultyLabel(3.7)).toBe("Hard");
    expect(difficultyLabel(4.4)).toBe("V. Hard");
  });

  it("maps difficulty score to 1..5 filled pips", () => {
    expect(difficultyPipCount(-2)).toBe(1);
    expect(difficultyPipCount(0)).toBe(1);
    expect(difficultyPipCount(2.1)).toBe(2);
    expect(difficultyPipCount(3.8)).toBe(4);
    expect(difficultyPipCount(5.7)).toBe(5);
  });
});

describe("paginateModules", () => {
  it("slices items for the requested page and computes pageCount", () => {
    const out = paginateModules(FIXTURES, { page: 2, pageSize: 2 });
    expect(out.page).toBe(2);
    expect(out.pageCount).toBe(3);
    expect(out.items.map((item) => item.code)).toEqual(["50003", "70011"]);
  });

  it("clamps out-of-range page requests", () => {
    const low = paginateModules(FIXTURES, { page: 0, pageSize: 2 });
    expect(low.page).toBe(1);
    expect(low.items.map((item) => item.code)).toEqual(["40008", "50001"]);

    const high = paginateModules(FIXTURES, { page: 99, pageSize: 2 });
    expect(high.page).toBe(3);
    expect(high.items.map((item) => item.code)).toEqual(["70007"]);
  });
});
