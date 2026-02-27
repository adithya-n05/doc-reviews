import { NextResponse } from "next/server";
import { toggleHelpfulVoteForReply } from "@/lib/services/reply-helpful-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const replyId =
    typeof (payload as { replyId?: unknown }).replyId === "string"
      ? (payload as { replyId: string }).replyId.trim()
      : "";
  if (!replyId) {
    return NextResponse.json({ error: "Reply id is required." }, { status: 400 });
  }

  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await toggleHelpfulVoteForReply(
    {
      async hasVote(input) {
        const { data } = await client
          .from("reply_helpful_votes")
          .select("id")
          .eq("reply_id", input.replyId)
          .eq("user_id", input.userId)
          .maybeSingle();
        return Boolean(data);
      },
      async addVote(input) {
        const { error } = await client.from("reply_helpful_votes").insert({
          reply_id: input.replyId,
          user_id: input.userId,
        });
        return {
          error: error?.message ?? null,
        };
      },
      async removeVote(input) {
        const { error } = await client
          .from("reply_helpful_votes")
          .delete()
          .eq("reply_id", input.replyId)
          .eq("user_id", input.userId);
        return {
          error: error?.message ?? null,
        };
      },
    },
    {
      userId: user.id,
      replyId,
    },
  );

  if (!result.ok) {
    const status = result.type === "validation" ? 400 : 500;
    return NextResponse.json({ error: result.message }, { status });
  }

  const { count } = await client
    .from("reply_helpful_votes")
    .select("reply_id", { count: "exact", head: true })
    .eq("reply_id", replyId);

  return NextResponse.json({
    ok: true,
    voted: result.voted,
    count: count ?? 0,
  });
}
