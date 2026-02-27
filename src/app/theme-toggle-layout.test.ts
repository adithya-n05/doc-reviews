import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("global theme toggle wiring", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const toggleSource = readFileSync("src/components/theme-toggle.tsx", "utf8");

  it("renders global theme toggle from root layout", () => {
    expect(layoutSource).toContain('import { ThemeToggle } from "@/components/theme-toggle";');
    expect(layoutSource).toContain('className="theme-toggle-footer"');
    expect(layoutSource).toContain("<ThemeToggle />");
  });

  it("persists user theme preference in localStorage", () => {
    expect(toggleSource).toContain("doc_reviews_theme");
    expect(toggleSource).toContain("localStorage.getItem");
    expect(toggleSource).toContain("localStorage.setItem");
    expect(toggleSource).toContain("document.documentElement.setAttribute(\"data-theme\"");
  });

  it("uses a switch-style control integrated with editorial footer treatment", () => {
    expect(toggleSource).toContain('className="theme-toggle-track"');
    expect(toggleSource).toContain("theme-toggle-thumb");
    expect(toggleSource).toContain('className="theme-toggle-state"');
    expect(toggleSource).toContain("theme === \"dark\" ? \"Dark\" : \"Light\"");
  });
});
