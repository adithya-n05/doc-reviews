import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("global theme toggle wiring", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const homeSource = readFileSync("src/app/page.tsx", "utf8");
  const navSource = readFileSync("src/components/site-nav.tsx", "utf8");
  const toggleSource = readFileSync("src/components/theme-toggle.tsx", "utf8");

  it("renders theme toggle in authenticated nav instead of footer shells", () => {
    expect(layoutSource).not.toContain("FooterThemeToggle");
    expect(layoutSource).not.toContain('className="theme-toggle-footer"');
    expect(homeSource).not.toContain('import { ThemeToggle } from "@/components/theme-toggle";');
    expect(homeSource).not.toContain('className="footer-theme-toggle"');
    expect(navSource).toContain('import { ThemeToggle } from "@/components/theme-toggle";');
    expect(navSource).toContain('<div className="nav-divider" />');
    expect(navSource).toContain("<ThemeToggle />");
  });

  it("persists user theme preference in localStorage", () => {
    expect(toggleSource).toContain("doc_reviews_theme");
    expect(toggleSource).toContain("localStorage.getItem");
    expect(toggleSource).toContain("localStorage.setItem");
    expect(toggleSource).toContain("document.documentElement.setAttribute(\"data-theme\"");
  });

  it("uses a mockup-v3 icon label toggle with light/dark text swap", () => {
    expect(toggleSource).toContain('className="theme-toggle"');
    expect(toggleSource).toContain('className="sun"');
    expect(toggleSource).toContain('className="moon"');
    expect(toggleSource).toContain("{theme === \"dark\" ? \"Dark\" : \"Light\"}");
  });
});
