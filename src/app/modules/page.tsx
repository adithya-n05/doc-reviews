import { ModuleCatalogueBrowser } from "@/components/module-catalogue-browser";
import { SiteNav } from "@/components/site-nav";
import { toModuleCatalogueItem } from "@/lib/modules/presenter";
import { parseModuleCatalogueSearchParams } from "@/lib/modules/query-params";
import { requireUserContext } from "@/lib/server/auth-context";
import { fetchModuleCatalogueRows } from "@/lib/server/module-queries";

type ModulesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ModulesPage({ searchParams }: ModulesPageProps) {
  const { client, profile } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const parsed = parseModuleCatalogueSearchParams((await searchParams) ?? {});
  const activeYear = parsed.year;

  const rows = await fetchModuleCatalogueRows(client);
  const modules = rows.map((row) => toModuleCatalogueItem(row));

  return (
    <div className="site-shell">
      <SiteNav authed active="modules" displayName={profile.full_name} />

      <main className="page" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <ModuleCatalogueBrowser
          modules={modules}
          initialYear={activeYear}
          initialSearch={parsed.search}
          initialSort={parsed.sort}
          initialPage={parsed.page}
          profileYear={profile.year ?? null}
        />
      </main>
    </div>
  );
}
