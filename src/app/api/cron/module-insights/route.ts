import { NextResponse } from "next/server";
import { createModuleReviewFingerprint, upsertModuleReviewInsightsCacheRow } from "@/lib/services/module-review-insights-cache-service";
import { generateModuleReviewInsightPayload } from "@/lib/services/module-review-insights-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReviewRow = {
  module_id: string;
  id: string;
  updated_at: string;
  teaching_rating: number;
  workload_rating: number;
  difficulty_rating: number;
  assessment_rating: number;
  comment: string;
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!cronSecret || bearer !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("reviews")
    .select("module_id,id,updated_at,teaching_rating,workload_rating,difficulty_rating,assessment_rating,comment");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = (data ?? []) as ReviewRow[];
  const reviewsByModule = new Map<string, ReviewRow[]>();
  for (const review of reviews) {
    const rows = reviewsByModule.get(review.module_id) ?? [];
    rows.push(review);
    reviewsByModule.set(review.module_id, rows);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  for (const [moduleId, moduleReviews] of reviewsByModule.entries()) {
    const insights = await generateModuleReviewInsightPayload(
      moduleReviews.map((row) => ({
        teachingRating: row.teaching_rating,
        workloadRating: row.workload_rating,
        difficultyRating: row.difficulty_rating,
        assessmentRating: row.assessment_rating,
        comment: row.comment,
      })),
      {
        apiKey,
        model,
      },
    );

    await upsertModuleReviewInsightsCacheRow(adminClient, {
      moduleId,
      reviewsFingerprint: createModuleReviewFingerprint(
        moduleReviews.map((row) => ({
          id: row.id,
          updatedAt: row.updated_at,
        })),
      ),
      summary: insights.summary,
      topKeywords: insights.topKeywords,
      sentiment: insights.sentiment,
      source: insights.source,
    });
  }

  return NextResponse.json({
    refreshedModules: reviewsByModule.size,
  });
}
