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
      <span className="theme-toggle-label">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
