import type { ModuleListSort } from "@/lib/modules/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_VALUES: ModuleListSort[] = [
  "rating_desc",
  "rating_asc",
  "most_reviewed",
  "difficulty_desc",
  "alphabetical",
];

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export function parseModuleCatalogueSearchParams(params: SearchParams): {
  search: string;
  year: "all" | "1" | "2" | "3" | "4";
  sort: ModuleListSort;
  page: number;
} {
  const rawYear = toSingle(params.year).trim();
  const year =
    rawYear === "1" || rawYear === "2" || rawYear === "3" || rawYear === "4"
      ? rawYear
      : "all";

  const rawSort = toSingle(params.sort).trim() as ModuleListSort;
  const sort = SORT_VALUES.includes(rawSort) ? rawSort : "rating_desc";

  return {
    search: toSingle(params.q).trim(),
    year,
    sort,
    page: parsePage(toSingle(params.page).trim()),
  };
}
