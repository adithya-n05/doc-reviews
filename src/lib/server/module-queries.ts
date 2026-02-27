import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ModuleCataloguePresentationRow,
  ModulePresentationRow,
  ReviewPresentationRow,
} from "@/lib/modules/presenter";

type ModuleOfferingSummary = Pick<
  Tables<"module_offerings">,
  "study_year"
>;

type ModuleLeaderSummary = Pick<Tables<"module_leaders">, "leader_name" | "profile_url" | "photo_url">;

type ModuleAggregateSummary = Tables<"module_review_aggregates">;
type ModuleReviewInsightsSummary = Pick<
  Tables<"module_review_insights">,
  "module_id" | "reviews_fingerprint" | "summary" | "top_keywords" | "sentiment" | "source" | "generated_at" | "updated_at"
>;
type ReviewReplySummary = Pick<
  Tables<"review_replies">,
  "id" | "review_id" | "user_id" | "parent_reply_id" | "body" | "created_at" | "updated_at"
>;

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

const fetchModuleCatalogueRowsCachedInternal = unstable_cache(
  async (): Promise<ModuleCatalogueWithRelations[]> => {
    const adminClient = createSupabaseAdminClient();
    return fetchModuleCatalogueRows(adminClient);
  },
  ["module-catalogue-rows"],
  { revalidate: 60 },
);

export async function fetchModuleCatalogueRowsCached(): Promise<ModuleCatalogueWithRelations[]> {
  return fetchModuleCatalogueRowsCachedInternal();
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
        module_offerings(study_year),
        module_leaders(leader_name,profile_url,photo_url),
        module_review_aggregates(review_count,avg_overall,avg_difficulty,avg_teaching,avg_workload,avg_assessment,module_id)
      `,
    )
    .eq("code", code)
    .maybeSingle();

  return (data as ModuleWithRelations | null) ?? null;
}

const fetchModuleByCodeCachedInternal = unstable_cache(
  async (code: string): Promise<ModuleWithRelations | null> => {
    const adminClient = createSupabaseAdminClient();
    return fetchModuleByCode(adminClient, code);
  },
  ["module-by-code"],
  { revalidate: 60 },
);

export async function fetchModuleByCodeCached(code: string): Promise<ModuleWithRelations | null> {
  return fetchModuleByCodeCachedInternal(code);
}

export async function fetchModuleReviews(
  client: SupabaseClient,
  moduleId: string,
  options: { limit?: number } = {},
): Promise<ReviewPresentationRow[]> {
  let query = client
    .from("reviews")
    .select(
      "id,user_id,module_id,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment,tips,created_at,updated_at",
    )
    .eq("module_id", moduleId);

  query = query.order("created_at", { ascending: false });
  if (typeof options.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data } = await query;

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

export async function fetchHelpfulVoteRowsForReviews(
  client: SupabaseClient,
  reviewIds: string[],
): Promise<Array<{ review_id: string; user_id: string }>> {
  if (reviewIds.length === 0) {
    return [];
  }

  const { data } = await client
    .from("review_helpful_votes")
    .select("review_id,user_id")
    .in("review_id", reviewIds);

  return (data ?? []) as Array<{ review_id: string; user_id: string }>;
}

export async function fetchModuleReviewInsightsRow(
  client: SupabaseClient,
  moduleId: string,
): Promise<ModuleReviewInsightsSummary | null> {
  const { data } = await client
    .from("module_review_insights")
    .select("module_id,reviews_fingerprint,summary,top_keywords,sentiment,source,generated_at,updated_at")
    .eq("module_id", moduleId)
    .maybeSingle();

  return (data as ModuleReviewInsightsSummary | null) ?? null;
}

export async function fetchReviewRepliesForReviews(
  client: SupabaseClient,
  reviewIds: string[],
): Promise<ReviewReplySummary[]> {
  if (reviewIds.length === 0) {
    return [];
  }

  const { data } = await client
    .from("review_replies")
    .select("id,review_id,user_id,parent_reply_id,body,created_at,updated_at")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });

  return (data ?? []) as ReviewReplySummary[];
}
