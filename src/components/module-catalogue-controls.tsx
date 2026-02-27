"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ModuleListSort } from "@/lib/modules/catalog";

type ModuleCatalogueControlsProps = {
  year: string;
  initialSearch: string;
  initialSort: ModuleListSort;
};

function buildModulesHref(params: {
  year: string;
  search: string;
  sort: ModuleListSort;
}): string {
  const query = new URLSearchParams();

  if (params.search.trim().length > 0) {
    query.set("q", params.search.trim());
  }
  query.set("year", params.year);
  query.set("sort", params.sort);
  query.set("page", "1");

  return `/modules?${query.toString()}`;
}

export function ModuleCatalogueControls({
  year,
  initialSearch,
  initialSort,
}: ModuleCatalogueControlsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sort, setSort] = useState<ModuleListSort>(initialSort);
  const [isPending, startTransition] = useTransition();
  const initializedRef = useRef(false);

  const navigateToFilters = useCallback(
    (nextSort: ModuleListSort, nextSearch: string) => {
      startTransition(() => {
        router.replace(
          buildModulesHref({
            year,
            search: nextSearch,
            sort: nextSort,
          }),
        );
      });
    },
    [router, year, startTransition],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    navigateToFilters(sort, debouncedSearch);
  }, [debouncedSearch, sort, navigateToFilters]);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value as ModuleListSort;
    setSort(nextSort);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToFilters(sort, search);
  };

  return (
    <form
      className="search-row"
      style={{ margin: 0, gap: "10px" }}
      onSubmit={handleSubmit}
      aria-busy={isPending}
    >
      <div className="search-bar" style={{ margin: 0, minWidth: "220px", borderColor: "var(--border)" }}>
        <span className="search-icon" style={{ fontSize: "13px" }}>
          ⌖
        </span>
        <input
          className="search-input"
          type="search"
          name="q"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ fontSize: "13px" }}
          placeholder="Search modules..."
        />
      </div>
      <select
        name="sort"
        className="form-select"
        style={{ height: "40px" }}
        value={sort}
        onChange={handleSortChange}
      >
        <option value="rating_desc">Sort: Rating (High-Low)</option>
        <option value="rating_asc">Sort: Rating (Low-High)</option>
        <option value="most_reviewed">Sort: Most Reviewed</option>
        <option value="difficulty_desc">Sort: Difficulty</option>
        <option value="alphabetical">Sort: Alphabetical</option>
      </select>
      <button type="submit" className="btn btn-ghost btn-sm">
        Apply
      </button>
    </form>
  );
}
