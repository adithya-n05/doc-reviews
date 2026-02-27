import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase/database.types";
import type {
  ModuleCataloguePresentationRow,
  ModulePresentationRow,
  ReviewPresentationRow,
} from "@/lib/modules/presenter";

type ModuleOfferingSummary = Pick<
  Tables<"module_offerings">,
  "study_year" | "term" | "offering_type" | "degree_path" | "academic_year_label"
>;

type ModuleLeaderSummary = Pick<Tables<"module_leaders">, "leader_name" | "profile_url" | "photo_url">;

type ModuleAggregateSummary = Tables<"module_review_aggregates">;

type ModuleWithRelations = Omit<ModulePresentationRow, "module_offerings"> & {
  module_offerings: ModuleOfferingSummary[] | null;
  module_leaders: ModuleLeaderSummary[] | null;
  module_review_aggregates: ModuleAggregateSummary | ModuleAggregateSummary[] | null;
};

type ModuleCatalogueOfferingSummary = Pick<Tables<"module_offerings">, "study_year">;

type ModuleCatalogueWithRelations = Omit<
  ModuleCataloguePresentationRow,
  "module_offerings"
> & {
  module_offerings: ModuleCatalogueOfferingSummary[] | null;
  module_review_aggregates: ModuleAggregateSummary | ModuleAggregateSummary[] | null;
};

export async function fetchModuleCatalogueRows(
  client: SupabaseClient,
): Promise<ModuleCatalogueWithRelations[]> {
  const { data } = await client
    .from("modules")
    .select(
      `
        id,code,title,
        module_offerings(study_year),
        module_review_aggregates(review_count,avg_overall,avg_difficulty,avg_teaching,avg_workload,avg_assessment,module_id)
      `,
    )
    .order("code", { ascending: true });

  return (data ?? []) as ModuleCatalogueWithRelations[];
}

export async function fetchModuleByCode(
  client: SupabaseClient,
  code: string,
): Promise<ModuleWithRelations | null> {
  const { data } = await client
    .from("modules")
    .select(
      `
        id,code,title,description,
        module_offerings(study_year,term,offering_type,degree_path,academic_year_label),
        module_leaders(leader_name,profile_url,photo_url),
        module_review_aggregates(review_count,avg_overall,avg_difficulty,avg_teaching,avg_workload,avg_assessment,module_id)
      `,
    )
    .eq("code", code)
    .maybeSingle();

  return (data as ModuleWithRelations | null) ?? null;
}

export async function fetchModuleReviews(
  client: SupabaseClient,
  moduleId: string,
): Promise<ReviewPresentationRow[]> {
  const { data } = await client
    .from("reviews")
    .select(
      "id,user_id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment,tips,created_at,updated_at",
    )
    .eq("module_id", moduleId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ReviewPresentationRow[];
}

export async function fetchProfilesByIds(
  client: SupabaseClient,
  userIds: string[],
): Promise<Record<string, { fullName: string; email: string; year: number | null }>> {
  if (userIds.length === 0) {
    return {};
  }

  const { data } = await client
    .from("profiles")
    .select("id,full_name,email,year")
    .in("id", userIds);

  const map: Record<string, { fullName: string; email: string; year: number | null }> = {};
  for (const row of data ?? []) {
    map[row.id] = {
      fullName: row.full_name,
      email: row.email,
      year: row.year,
    };
  }
  return map;
}

export async function fetchUserReviewForModule(
  client: SupabaseClient,
  userId: string,
  moduleId: string,
) {
  const { data } = await client
    .from("reviews")
    .select(
      "id,user_id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment,tips,created_at,updated_at",
    )
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  return (data as ReviewPresentationRow | null) ?? null;
}
