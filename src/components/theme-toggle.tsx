"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "doc_reviews_theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <svg className="sun" aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.5V5.25M12 18.75V21.5M2.5 12H5.25M18.75 12H21.5M5.28 5.28l1.95 1.95M16.77 16.77l1.95 1.95M18.72 5.28l-1.95 1.95M7.23 16.77l-1.95 1.95"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <svg className="moon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M15.73 3.14a8.99 8.99 0 1 0 5.13 15.48A9 9 0 0 1 15.73 3.14Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="theme-toggle-label" aria-hidden="true">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
      <span className="sr-only">{theme === "dark" ? "Dark mode active" : "Light mode active"}</span>
    </button>
  );
}
