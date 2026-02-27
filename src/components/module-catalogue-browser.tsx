"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  applyModuleListQuery,
  difficultyLabel,
  difficultyPipCount,
  paginateModules,
  type ModuleListItem,
  type ModuleListSort,
} from "@/lib/modules/catalog";

type ModuleCatalogueBrowserProps = {
  modules: ModuleListItem[];
  initialYear: string;
  initialSearch: string;
  initialSort: ModuleListSort;
  initialPage: number;
  profileYear: number | null;
};

function renderStars(value: number) {
  const rounded = Math.round(value);
  const stars: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    stars.push(index < rounded ? "★" : "☆");
  }
  return stars.join("");
}

function buildModulesQuery(params: {
  search: string;
  year: string;
  sort: ModuleListSort;
  page: number;
}) {
  const query = new URLSearchParams();
  if (params.search.trim()) {
    query.set("q", params.search.trim());
  }
  query.set("year", params.year);
  query.set("sort", params.sort);
  query.set("page", String(params.page));
  return query.toString();
}

export function ModuleCatalogueBrowser({
  modules,
  initialYear,
  initialSearch,
  initialSort,
  initialPage,
  profileYear,
}: ModuleCatalogueBrowserProps) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sort, setSort] = useState<ModuleListSort>(initialSort);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const filtered = useMemo(
    () =>
      applyModuleListQuery(modules, {
        search: debouncedSearch,
        year,
        sort,
      }),
    [modules, debouncedSearch, year, sort],
  );

  const paginated = useMemo(
    () =>
      paginateModules(filtered, {
        page,
        pageSize: 12,
      }),
    [filtered, page],
  );

  useEffect(() => {
    const query = buildModulesQuery({
      search,
      year,
      sort,
      page: paginated.page,
    });
    window.history.replaceState(null, "", `/modules?${query}`);
  }, [search, year, sort, paginated.page]);

  return (
    <>
      <div className="section-header">
        <div>
          <div className="label-caps" style={{ marginBottom: "8px" }}>
            Department of Computing
          </div>
          <h1 className="section-title">Module Catalogue</h1>
        </div>
        <div className="search-row" style={{ margin: 0, gap: "10px" }}>
          <div
            className="search-bar"
            style={{ margin: 0, minWidth: "220px", borderColor: "var(--border)" }}
          >
            <span className="search-icon" style={{ fontSize: "13px" }}>
              ⌖
            </span>
            <input
              className="search-input"
              type="search"
              name="q"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              style={{ fontSize: "13px" }}
              placeholder="Search modules..."
            />
          </div>
          <select
            name="sort"
            className="form-select"
            style={{ height: "40px" }}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as ModuleListSort);
              setPage(1);
            }}
          >
            <option value="rating_desc">Sort: Rating (High-Low)</option>
            <option value="rating_asc">Sort: Rating (Low-High)</option>
            <option value="most_reviewed">Sort: Most Reviewed</option>
            <option value="difficulty_desc">Sort: Difficulty</option>
            <option value="alphabetical">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${year === "all" ? "active" : ""}`}
          onClick={() => {
            setYear("all");
            setPage(1);
          }}
        >
          All Modules
        </button>
        <button
          type="button"
          className={`tab ${year === "1" ? "active" : ""}`}
          onClick={() => {
            setYear("1");
            setPage(1);
          }}
        >
          Year 1
        </button>
        <button
          type="button"
          className={`tab ${year === "2" ? "active" : ""}`}
          onClick={() => {
            setYear("2");
            setPage(1);
          }}
        >
          Year 2
        </button>
        <button
          type="button"
          className={`tab ${year === "3" ? "active" : ""}`}
          onClick={() => {
            setYear("3");
            setPage(1);
          }}
        >
          Year 3
        </button>
        <button
          type="button"
          className={`tab ${year === "4" ? "active" : ""}`}
          onClick={() => {
            setYear("4");
            setPage(1);
          }}
        >
          Year 4 / MEng
        </button>
      </div>

      <div className="module-grid">
        {paginated.items.map((module) => (
          <Link
            key={module.code}
            href={`/modules/${module.code}`}
            className="module-card"
            onMouseEnter={() => router.prefetch(`/modules/${module.code}`)}
            onFocus={() => router.prefetch(`/modules/${module.code}`)}
          >
            <span className="module-code">{module.code}</span>
            <div className="module-name">{module.title}</div>
            <div className="module-meta">
              <span className="year-badge">Year {module.studyYears[0] ?? profileYear ?? "?"}</span>
              <div className="difficulty-pip">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`pip ${
                      index < difficultyPipCount(module.avgDifficulty) ? "filled" : ""
                    }`}
                  />
                ))}
              </div>
              <span style={{ fontSize: "11px", color: "var(--ink-light)" }}>
                {difficultyLabel(module.avgDifficulty)}
              </span>
            </div>
            <hr className="rule" style={{ margin: "10px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", color: "var(--accent)" }}>
                  {renderStars(module.avgOverall)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink-light)", marginTop: "2px" }}>
                  {module.avgOverall.toFixed(1)} · {module.reviewCount} reviews
                </div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                View →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "36px" }}>
        <p className="form-note">
          Showing {paginated.items.length} of {filtered.length} matching modules
        </p>
        <div className="inline-row" style={{ justifyContent: "center" }}>
          {paginated.page > 1 ? (
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPage((value) => value - 1)}>
              Previous
            </button>
          ) : null}
          {paginated.page < paginated.pageCount ? (
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
