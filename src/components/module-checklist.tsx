"use client";

import { useEffect, useMemo, useState } from "react";
import {
  filterOnboardingModules,
  type OnboardingModuleOption,
} from "@/lib/modules/onboarding-filter";

type ModuleChecklistProps = {
  modules: OnboardingModuleOption[];
  initialSelected: string[];
  yearSelectId?: string;
};

export function ModuleChecklist({
  modules,
  initialSelected,
  yearSelectId = "onboarding-year",
}: ModuleChecklistProps) {
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected.map((code) => code.toUpperCase())),
  );

  useEffect(() => {
    const element = document.getElementById(yearSelectId);
    if (!(element instanceof HTMLSelectElement)) {
      return;
    }

    const updateSelectedYear = () => {
      const next = Number.parseInt(element.value, 10);
      setSelectedYear(Number.isNaN(next) ? null : next);
    };

    updateSelectedYear();
    element.addEventListener("change", updateSelectedYear);

    return () => {
      element.removeEventListener("change", updateSelectedYear);
    };
  }, [yearSelectId]);

  const modulesByYear = useMemo(() => {
    const buckets: Record<number | "all", OnboardingModuleOption[]> = {
      all: modules,
      1: [],
      2: [],
      3: [],
      4: [],
    };

    for (const module of modules) {
      for (const year of module.studyYears) {
        if (year >= 1 && year <= 4) {
          buckets[year].push(module);
        }
      }
    }

    return buckets;
  }, [modules]);

  const baseModules = selectedYear
    ? modulesByYear[selectedYear]
    : modulesByYear.all;

  const filtered = useMemo(
    () => filterOnboardingModules(baseModules, null, query),
    [baseModules, query],
  );

  return (
    <div>
      <div className="inline-row" style={{ justifyContent: "space-between", marginBottom: "10px" }}>
        <div className="inline-row">
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() =>
              setSelected((previous) => {
                const next = new Set(previous);
                for (const module of filtered) {
                  next.add(module.code);
                }
                return next;
              })
            }
          >
            Select All Shown
          </button>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() =>
              setSelected((previous) => {
                const next = new Set(previous);
                for (const module of filtered) {
                  next.delete(module.code);
                }
                return next;
              })
            }
          >
            Clear Shown
          </button>
        </div>
      </div>
      <div className="search-row">
        <input
          className="search-input"
          type="search"
          placeholder="Search modules..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div style={{ border: "1px solid var(--border)", background: "#fff" }}>
        {filtered.map((module) => {
          const checked = selected.has(module.code);
          return (
            <label
              key={module.code}
              className="module-check-item"
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                borderBottom: "1px solid var(--border)",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                value={module.code}
                checked={checked}
                onChange={(event) => {
                  setSelected((previous) => {
                    const next = new Set(previous);
                    if (event.target.checked) {
                      next.add(module.code);
                    } else {
                      next.delete(module.code);
                    }
                    return next;
                  });
                }}
              />
              <div style={{ flex: 1 }}>
                <div className="module-code">{module.code}</div>
                <div style={{ fontWeight: 600 }}>{module.title}</div>
                <div className="module-meta">
                  Year {module.studyYears.join(", ") || "Unspecified"}
                </div>
              </div>
            </label>
          );
        })}
        {filtered.length === 0 ? (
          <p className="form-note" style={{ margin: 0, padding: "14px" }}>
            No modules match your selected year/search.
          </p>
        ) : null}
      </div>
      <div aria-hidden style={{ display: "none" }}>
        {Array.from(selected).map((code) => (
          <input key={code} type="hidden" name="moduleCodes" value={code} />
        ))}
      </div>
      <p className="form-note" style={{ textAlign: "right" }}>
        {selected.size} modules selected
      </p>
    </div>
  );
}
