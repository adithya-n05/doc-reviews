import type { SupabaseClient } from "@supabase/supabase-js";
import { buildLandingMetrics } from "@/lib/metrics/landing-metrics";

type AggregateRow = {
  review_count: number | null;
  avg_overall: number | null;
  avg_workload: number | null;
};

type ReviewRow = {
  teaching_rating: number;
  assessment_rating: number;
};

export async function fetchLandingMetrics(client: SupabaseClient) {
  const [{ count: moduleCount }, { data: aggregateRows }, { data: reviewRows }] =
    await Promise.all([
      client.from("modules").select("*", { count: "exact", head: true }),
      client
        .from("module_review_aggregates")
        .select("review_count,avg_overall,avg_workload"),
      client.from("reviews").select("teaching_rating,assessment_rating"),
    ]);

  return buildLandingMetrics({
    modulesCount: moduleCount ?? 0,
    aggregates: ((aggregateRows ?? []) as AggregateRow[]).map((row) => ({
      reviewCount: row.review_count ?? 0,
      avgOverall: row.avg_overall ?? 0,
      avgWorkload: row.avg_workload ?? 0,
    })),
    reviews: ((reviewRows ?? []) as ReviewRow[]).map((row) => ({
      teachingRating: row.teaching_rating,
      assessmentRating: row.assessment_rating,
    })),
  });
}
