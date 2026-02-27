export type ModuleListSort =
  | "rating_desc"
  | "rating_asc"
  | "most_reviewed"
  | "difficulty_desc"
  | "alphabetical";

export type ModuleListItem = {
  id: string;
  code: string;
  title: string;
  studyYears: number[];
  reviewCount: number;
  avgOverall: number;
  avgDifficulty: number;
};

type ModuleQuery = {
  search?: string | null;
  year?: string | number | null;
  sort?: ModuleListSort | null;
};

type PaginateOptions = {
  page: number;
  pageSize: number;
};

type PaginatedModules = {
  items: ModuleListItem[];
  page: number;
  pageCount: number;
};

function normalizeSearchTerm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeYearFilter(
  value: string | number | null | undefined,
): number | "all" {
  if (value === undefined || value === null) {
    return "all";
  }

  if (value === "all") {
    return "all";
  }

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
    return "all";
  }

  return parsed;
}

export function sortModules(
  modules: ModuleListItem[],
  sort: ModuleListSort,
): ModuleListItem[] {
  const sorted = [...modules];

  sorted.sort((a, b) => {
    if (sort === "rating_desc") {
      return b.avgOverall - a.avgOverall || a.code.localeCompare(b.code);
    }
    if (sort === "rating_asc") {
      return a.avgOverall - b.avgOverall || a.code.localeCompare(b.code);
    }
    if (sort === "most_reviewed") {
      return b.reviewCount - a.reviewCount || a.code.localeCompare(b.code);
    }
    if (sort === "difficulty_desc") {
      return b.avgDifficulty - a.avgDifficulty || a.code.localeCompare(b.code);
    }

    return a.title.localeCompare(b.title);
  });

  return sorted;
}

export function applyModuleListQuery(
  modules: ModuleListItem[],
  query: ModuleQuery,
): ModuleListItem[] {
  const normalizedYear = normalizeYearFilter(query.year);
  const search = normalizeSearchTerm(query.search);
  const sort = query.sort ?? "rating_desc";

  const filtered = modules.filter((module) => {
    if (normalizedYear !== "all" && !module.studyYears.includes(normalizedYear)) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      module.code.toLowerCase().includes(search) ||
      module.title.toLowerCase().includes(search)
    );
  });

  return sortModules(filtered, sort);
}

export function difficultyPipCount(value: number): number {
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded;
}

export function difficultyLabel(value: number): string {
  if (value <= 1.8) return "Easy";
  if (value <= 2.8) return "Med.";
  if (value <= 3.8) return "Hard";
  return "V. Hard";
}

export function paginateModules(
  modules: ModuleListItem[],
  options: PaginateOptions,
): PaginatedModules {
  const pageSize = options.pageSize > 0 ? options.pageSize : 1;
  const pageCount = Math.max(1, Math.ceil(modules.length / pageSize));
  const page = Math.min(Math.max(options.page, 1), pageCount);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: modules.slice(start, end),
    page,
    pageCount,
  };
}
