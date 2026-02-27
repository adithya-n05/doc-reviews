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

  const filtered = useMemo(
    () => filterOnboardingModules(modules, selectedYear, query),
    [modules, query, selectedYear],
  );

  return (
    <div>
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
                name="moduleCodes"
                value={module.code}
                checked={checked}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.target.checked) {
                    next.add(module.code);
                  } else {
                    next.delete(module.code);
                  }
                  setSelected(next);
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
      <p className="form-note" style={{ textAlign: "right" }}>
        {selected.size} modules selected
      </p>
    </div>
  );
}
