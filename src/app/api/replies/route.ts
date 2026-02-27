import { NextResponse } from "next/server";
import {
  createReviewReplyForUser,
  deleteReviewReplyForUser,
  updateReviewReplyForUser,
} from "@/lib/services/review-reply-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

type ReplyRow = {
  id: string;
  review_id: string;
  parent_reply_id: string | null;
  body: string;
  created_at: string;
};

function toNonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalString(value: unknown): string | null {
  const normalized = toNonEmptyString(value);
  return normalized.length > 0 ? normalized : null;
}

function buildInitials(value: string): string {
  return (
    value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

async function parseJsonBody(request: Request): Promise<JsonRecord | null> {
  try {
    const payload = await request.json();
    return payload && typeof payload === "object" ? (payload as JsonRecord) : null;
  } catch {
    return null;
  }
}

async function getAuthedContext() {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("full_name,email,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    client,
    user,
    profile,
  };
}

function mapReplyRow(row: ReplyRow, userId: string, profile: {
  full_name: string;
  email: string;
  avatar_url: string | null;
} | null) {
  const authorName = profile?.full_name ?? "Unknown Student";
  return {
    id: row.id,
    userId,
    reviewId: row.review_id,
    parentReplyId: row.parent_reply_id,
    body: row.body,
    createdAt: row.created_at,
    authorName,
    authorInitials: buildInitials(authorName),
    authorEmail: profile?.email ?? "",
    authorAvatarUrl: profile?.avatar_url ?? null,
  };
}

export async function POST(request: Request) {
  const payload = await parseJsonBody(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const reviewId = toNonEmptyString(payload.reviewId);
  const body = toNonEmptyString(payload.body);
  const parentReplyId = toOptionalString(payload.parentReplyId);

  if (!reviewId) {
    return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  }

  const context = await getAuthedContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let insertedReply: ReplyRow | null = null;
  const result = await createReviewReplyForUser(
    {
      userId: context.user.id,
      reviewId,
      parentReplyId,
      body,
    },
    {
      async insertReply(input) {
        const { data, error } = await context.client
          .from("review_replies")
          .insert({
            review_id: input.reviewId,
            user_id: input.userId,
            parent_reply_id: input.parentReplyId,
            body: input.body,
          })
          .select("id,review_id,parent_reply_id,body,created_at")
          .single();
        insertedReply = (data as ReplyRow | null) ?? null;
        return { error };
      },
    },
  );

  if (!result.ok) {
    const message = result.type === "validation" ? result.errors?.body ?? result.message : result.message;
    return NextResponse.json({ error: message ?? "Unable to post reply." }, { status: result.type === "validation" ? 400 : 500 });
  }

  if (!insertedReply) {
    return NextResponse.json({ error: "Unable to load created reply." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    reply: mapReplyRow(insertedReply, context.user.id, context.profile),
  });
}

export async function PATCH(request: Request) {
  const payload = await parseJsonBody(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const replyId = toNonEmptyString(payload.replyId);
  const body = toNonEmptyString(payload.body);
  if (!replyId) {
    return NextResponse.json({ error: "Reply id is required." }, { status: 400 });
  }

  const context = await getAuthedContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let updatedReply: ReplyRow | null = null;
  const result = await updateReviewReplyForUser(
    {
      userId: context.user.id,
      replyId,
      body,
    },
    {
      async updateReply(input) {
        const { data, error } = await context.client
          .from("review_replies")
          .update({
            body: input.body,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.replyId)
          .eq("user_id", input.userId)
          .select("id,review_id,parent_reply_id,body,created_at")
          .single();
        updatedReply = (data as ReplyRow | null) ?? null;
        return { error };
      },
    },
  );

  if (!result.ok) {
    const message = result.type === "validation" ? result.errors?.body ?? result.message : result.message;
    return NextResponse.json({ error: message ?? "Unable to update reply." }, { status: result.type === "validation" ? 400 : 500 });
  }

  if (!updatedReply) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    reply: mapReplyRow(updatedReply, context.user.id, context.profile),
  });
}

export async function DELETE(request: Request) {
  const payload = await parseJsonBody(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const replyId = toNonEmptyString(payload.replyId);
  if (!replyId) {
    return NextResponse.json({ error: "Reply id is required." }, { status: 400 });
  }

  const context = await getAuthedContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await deleteReviewReplyForUser(
    {
      userId: context.user.id,
      replyId,
    },
    {
      async deleteReply(input) {
        const { error } = await context.client
          .from("review_replies")
          .delete()
          .eq("id", input.replyId)
          .eq("user_id", input.userId);
        return { error };
      },
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message ?? "Unable to delete reply." },
      { status: result.type === "validation" ? 400 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
