import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import {
  applyModuleListQuery,
  difficultyLabel,
  difficultyPipCount,
  paginateModules,
} from "@/lib/modules/catalog";
import { toModuleCatalogueItem } from "@/lib/modules/presenter";
import { parseModuleCatalogueSearchParams } from "@/lib/modules/query-params";
import { requireUserContext } from "@/lib/server/auth-context";
import { fetchModuleCatalogueRows } from "@/lib/server/module-queries";

type ModulesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(params: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value.trim().length > 0) {
      query.set(key, value);
    }
  }
  const output = query.toString();
  return output ? `?${output}` : "";
}

function renderStars(value: number) {
  const rounded = Math.round(value);
  const stars: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    stars.push(index < rounded ? "★" : "☆");
  }
  return stars.join("");
}

export default async function ModulesPage({ searchParams }: ModulesPageProps) {
  const { client, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const parsed = parseModuleCatalogueSearchParams((await searchParams) ?? {});
  const activeYear = parsed.year;

  const rows = await fetchModuleCatalogueRows(client);
  const modules = rows.map((row) => toModuleCatalogueItem(row));
  const filtered = applyModuleListQuery(modules, {
    search: parsed.search,
    year: activeYear,
    sort: parsed.sort,
  });
  const paginated = paginateModules(filtered, {
    page: parsed.page,
    pageSize: 12,
  });

  const buildFilterHref = (year: string) =>
    buildQueryString({
      q: parsed.search,
      year,
      sort: parsed.sort,
      page: "1",
    });

  return (
    <div className="site-shell">
      <SiteNav authed active="modules" displayName={profile.full_name} />

      <main className="page" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div className="section-header">
          <div>
            <div className="label-caps" style={{ marginBottom: "8px" }}>
              Department of Computing
            </div>
            <h1 className="section-title">Module Catalogue</h1>
          </div>
          <form method="get" className="search-row" style={{ margin: 0, gap: "10px" }}>
            <input type="hidden" name="year" value={activeYear} />
            <div className="search-bar" style={{ margin: 0, minWidth: "220px", borderColor: "var(--border)" }}>
              <span className="search-icon" style={{ fontSize: "13px" }}>
                ⌖
              </span>
              <input
                className="search-input"
                type="search"
                name="q"
                defaultValue={parsed.search}
                style={{ fontSize: "13px" }}
                placeholder="Search modules..."
              />
            </div>
            <select name="sort" className="form-select" style={{ height: "40px" }} defaultValue={parsed.sort}>
              <option value="rating_desc">Sort: Rating (High-Low)</option>
              <option value="rating_asc">Sort: Rating (Low-High)</option>
              <option value="most_reviewed">Sort: Most Reviewed</option>
              <option value="difficulty_desc">Sort: Difficulty</option>
              <option value="alphabetical">Sort: Alphabetical</option>
            </select>
          </form>
        </div>

        <div className="tabs">
          <Link className={`tab ${activeYear === "all" ? "active" : ""}`} href={buildFilterHref("all")}>
            All Modules
          </Link>
          <Link className={`tab ${activeYear === "1" ? "active" : ""}`} href={buildFilterHref("1")}>
            Year 1
          </Link>
          <Link className={`tab ${activeYear === "2" ? "active" : ""}`} href={buildFilterHref("2")}>
            Year 2
          </Link>
          <Link className={`tab ${activeYear === "3" ? "active" : ""}`} href={buildFilterHref("3")}>
            Year 3
          </Link>
          <Link className={`tab ${activeYear === "4" ? "active" : ""}`} href={buildFilterHref("4")}>
            Year 4 / MEng
          </Link>
        </div>

        <div className="module-grid">
          {paginated.items.map((module) => (
            <Link key={module.code} href={`/modules/${module.code}`} className="module-card">
              <span className="module-code">{module.code}</span>
              <div className="module-name">{module.title}</div>
              <div className="module-meta">
                <span className="year-badge">
                  Year {module.studyYears[0] ?? profile.year ?? "?"}
                </span>
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
              <Link
                className="btn btn-ghost btn-sm"
                href={buildQueryString({
                  q: parsed.search,
                  year: activeYear,
                  sort: parsed.sort,
                  page: String(paginated.page - 1),
                })}
              >
                Previous
              </Link>
            ) : null}
            {paginated.page < paginated.pageCount ? (
              <Link
                className="btn btn-ghost btn-sm"
                href={buildQueryString({
                  q: parsed.search,
                  year: activeYear,
                  sort: parsed.sort,
                  page: String(paginated.page + 1),
                })}
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
