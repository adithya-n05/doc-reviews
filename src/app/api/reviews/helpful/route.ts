import { NextResponse } from "next/server";
import { toggleHelpfulVoteForReview } from "@/lib/services/review-helpful-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const reviewId =
    typeof (payload as { reviewId?: unknown }).reviewId === "string"
      ? (payload as { reviewId: string }).reviewId.trim()
      : "";
  if (!reviewId) {
    return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  }

  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await toggleHelpfulVoteForReview(
    {
      async hasVote(input) {
        const { data } = await client
          .from("review_helpful_votes")
          .select("id")
          .eq("review_id", input.reviewId)
          .eq("user_id", input.userId)
          .maybeSingle();
        return Boolean(data);
      },
      async addVote(input) {
        const { error } = await client.from("review_helpful_votes").insert({
          review_id: input.reviewId,
          user_id: input.userId,
        });
        return {
          error: error?.message ?? null,
        };
      },
      async removeVote(input) {
        const { error } = await client
          .from("review_helpful_votes")
          .delete()
          .eq("review_id", input.reviewId)
          .eq("user_id", input.userId);
        return {
          error: error?.message ?? null,
        };
      },
    },
    {
      userId: user.id,
      reviewId,
    },
  );

  if (!result.ok) {
    const status = result.type === "validation" ? 400 : 500;
    return NextResponse.json({ error: result.message }, { status });
  }

  const { count } = await client
    .from("review_helpful_votes")
    .select("review_id", { count: "exact", head: true })
    .eq("review_id", reviewId);

  return NextResponse.json({
    ok: true,
    voted: result.voted,
    count: count ?? 0,
  });
}
