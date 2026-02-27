import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  buildStaffDirectoryIndex,
  matchLeaderProfile,
  parseStaffDirectoryHtml,
  type StaffDirectoryEntry,
} from "../src/lib/ingest/staff-profile-resolver";

type ModuleCatalog = {
  generatedAt: string;
  moduleCount: number;
  modules: Array<{
    code: string;
    title: string;
    description: string;
    moduleLeaders: string[];
    sourceUrl: string;
    offerings: Array<{
      studyYear: number;
      term: string;
      offeringType: string;
      degreePath: string;
      academicYearLabel: string;
    }>;
  }>;
};

const STAFF_DIRECTORY_URLS = [
  "https://www.imperial.ac.uk/engineering/departments/computing/people/academic-staff/",
  "https://www.imperial.ac.uk/engineering/departments/computing/people/teaching-fellows/",
  "https://www.imperial.ac.uk/engineering/departments/computing/people/research/",
  "https://www.imperial.ac.uk/engineering/departments/computing/people/professional--technical-support-staff/",
] as const;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function loadCatalog(filePath: string): Promise<ModuleCatalog> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as ModuleCatalog;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; doc-reviews-staff-enrichment/1.0)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return await response.text();
}

async function buildComputingStaffIndex() {
  const entries: StaffDirectoryEntry[] = [];

  for (const url of STAFF_DIRECTORY_URLS) {
    try {
      const html = await fetchText(url);
      entries.push(...parseStaffDirectoryHtml(html, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Staff directory fetch skipped for ${url}: ${message}`);
    }
  }

  return buildStaffDirectoryIndex(entries);
}

async function main() {
  const catalogPath = process.argv[2] ?? path.join(process.cwd(), "data/module-catalog.json");
  const catalog = await loadCatalog(catalogPath);
  const staffIndex = await buildComputingStaffIndex();

  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const moduleUpserts = catalog.modules.map((module) => ({
    code: module.code,
    title: module.title,
    description: module.description,
    source_url: module.sourceUrl,
  }));

  const { error: upsertModulesError } = await client
    .from("modules")
    .upsert(moduleUpserts, { onConflict: "code" });
  if (upsertModulesError) {
    throw new Error(`Failed to upsert modules: ${upsertModulesError.message}`);
  }

  const { data: moduleRows, error: moduleRowsError } = await client
    .from("modules")
    .select("id,code")
    .in(
      "code",
      catalog.modules.map((module) => module.code),
    );
  if (moduleRowsError || !moduleRows) {
    throw new Error(`Failed to read module ids: ${moduleRowsError?.message ?? "unknown"}`);
  }

  const moduleIdByCode = new Map(moduleRows.map((row) => [row.code, row.id]));
  const moduleIds = moduleRows.map((row) => row.id);

  const { error: deleteLeadersError } = await client
    .from("module_leaders")
    .delete()
    .in("module_id", moduleIds);
  if (deleteLeadersError) {
    throw new Error(`Failed to clear module leaders: ${deleteLeadersError.message}`);
  }

  const { error: deleteOfferingsError } = await client
    .from("module_offerings")
    .delete()
    .in("module_id", moduleIds);
  if (deleteOfferingsError) {
    throw new Error(`Failed to clear module offerings: ${deleteOfferingsError.message}`);
  }

  const leaderRows = catalog.modules.flatMap((module) => {
    const moduleId = moduleIdByCode.get(module.code);
    if (!moduleId) {
      return [];
    }

    return module.moduleLeaders.map((leaderName) => {
      const matchedProfile = matchLeaderProfile(leaderName, staffIndex);
      return {
        module_id: moduleId,
        leader_name: matchedProfile?.canonicalName ?? leaderName,
        profile_url: matchedProfile?.profileUrl ?? null,
        photo_url: matchedProfile?.photoUrl ?? null,
      };
    });
  });

  if (leaderRows.length > 0) {
    const { error: insertLeadersError } = await client
      .from("module_leaders")
      .insert(leaderRows);
    if (insertLeadersError) {
      throw new Error(`Failed to insert module leaders: ${insertLeadersError.message}`);
    }
  }

  const offeringRows = catalog.modules.flatMap((module) => {
    const moduleId = moduleIdByCode.get(module.code);
    if (!moduleId) {
      return [];
    }

    return module.offerings.map((offering) => ({
      module_id: moduleId,
      study_year: offering.studyYear,
      term: offering.term,
      offering_type: offering.offeringType,
      degree_path: offering.degreePath,
      academic_year_label: offering.academicYearLabel,
    }));
  });

  if (offeringRows.length > 0) {
    const { error: insertOfferingsError } = await client
      .from("module_offerings")
      .insert(offeringRows);
    if (insertOfferingsError) {
      throw new Error(`Failed to insert module offerings: ${insertOfferingsError.message}`);
    }
  }

  console.log(
    `Upserted ${catalog.modules.length} modules, ${leaderRows.length} leaders, ${offeringRows.length} offerings.`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
