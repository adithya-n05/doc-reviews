"use client";

import { useMemo, useState } from "react";

type ModuleOption = {
  code: string;
  title: string;
  studyYears: number[];
};

type ModuleChecklistProps = {
  modules: ModuleOption[];
  initialSelected: string[];
};

export function ModuleChecklist({
  modules,
  initialSelected,
}: ModuleChecklistProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected.map((code) => code.toUpperCase())),
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return modules;
    }

    return modules.filter((module) => {
      return (
        module.code.toLowerCase().includes(normalized) ||
        module.title.toLowerCase().includes(normalized)
      );
    });
  }, [modules, query]);

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
      </div>
      <p className="form-note" style={{ textAlign: "right" }}>
        {selected.size} modules selected
      </p>
    </div>
  );
}
