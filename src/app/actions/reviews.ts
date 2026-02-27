"use server";

import { redirect } from "next/navigation";
import {
  deleteReviewForUser,
  upsertReviewForUser,
} from "@/lib/services/review-service";
import { toggleHelpfulVoteForReview } from "@/lib/services/review-helpful-service";
import { createReviewReplyForUser } from "@/lib/services/review-reply-service";
import { requireUserContext } from "@/lib/server/auth-context";

function firstError(errors: Record<string, string | undefined>): string {
  for (const value of Object.values(errors)) {
    if (value) return value;
  }
  return "Please check your review details.";
}

function toInt(value: FormDataEntryValue | null): number {
  return Number.parseInt(String(value ?? ""), 10);
}

export async function saveReviewAction(formData: FormData): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const moduleCode = String(formData.get("moduleCode") ?? "").trim().toUpperCase();
  const { data: moduleRow } = await client
    .from("modules")
    .select("id,code")
    .eq("code", moduleCode)
    .maybeSingle();

  if (!moduleRow) {
    redirect("/modules?error=Unknown%20module");
  }

  const result = await upsertReviewForUser(
    {
      async upsertReview(payload) {
        const { error } = await client.from("reviews").upsert(
          {
            user_id: payload.userId,
            module_id: payload.moduleId,
            teaching_rating: payload.teachingRating,
            workload_rating: payload.workloadRating,
            difficulty_rating: payload.difficultyRating,
            assessment_rating: payload.assessmentRating,
            comment: payload.comment,
            tips: payload.tips,
          },
          {
            onConflict: "module_id,user_id",
          },
        );

        return {
          error: error?.message ?? null,
        };
      },
    },
    {
      userId: user.id,
      moduleId: moduleRow.id,
      moduleCode,
    },
    {
      teachingRating: toInt(formData.get("teachingRating")),
      workloadRating: toInt(formData.get("workloadRating")),
      difficultyRating: toInt(formData.get("difficultyRating")),
      assessmentRating: toInt(formData.get("assessmentRating")),
      comment: String(formData.get("comment") ?? ""),
      tips: String(formData.get("tips") ?? ""),
    },
  );

  if (!result.ok) {
    if (result.type === "validation") {
      redirect(
        `/modules/${moduleCode}/review?error=${encodeURIComponent(firstError(result.errors))}`,
      );
    }
    redirect(`/modules/${moduleCode}/review?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/modules/${moduleCode}?success=review_saved`);
}

export async function deleteReviewAction(formData: FormData): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const moduleCode = String(formData.get("moduleCode") ?? "").trim().toUpperCase();
  const reviewId = String(formData.get("reviewId") ?? "");

  const result = await deleteReviewForUser(
    {
      async deleteReview(payload) {
        const { error } = await client
          .from("reviews")
          .delete()
          .eq("id", payload.reviewId)
          .eq("user_id", payload.userId);

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
    if (result.type === "validation") {
      redirect(`/modules/${moduleCode}?error=${encodeURIComponent(result.message)}`);
    }
    redirect(`/modules/${moduleCode}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/modules/${moduleCode}?success=review_deleted`);
}

export async function toggleHelpfulReviewAction(formData: FormData): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const moduleCode = String(formData.get("moduleCode") ?? "").trim().toUpperCase();
  const reviewId = String(formData.get("reviewId") ?? "");

  const result = await toggleHelpfulVoteForReview(
    {
      async hasVote(payload) {
        const { data } = await client
          .from("review_helpful_votes")
          .select("id")
          .eq("review_id", payload.reviewId)
          .eq("user_id", payload.userId)
          .maybeSingle();

        return Boolean(data);
      },
      async addVote(payload) {
        const { error } = await client.from("review_helpful_votes").insert({
          review_id: payload.reviewId,
          user_id: payload.userId,
        });
        return {
          error: error?.message ?? null,
        };
      },
      async removeVote(payload) {
        const { error } = await client
          .from("review_helpful_votes")
          .delete()
          .eq("review_id", payload.reviewId)
          .eq("user_id", payload.userId);

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
    redirect(`/modules/${moduleCode}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/modules/${moduleCode}#review-${reviewId}`);
}

export async function postReviewReplyAction(formData: FormData): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const moduleCode = String(formData.get("moduleCode") ?? "").trim().toUpperCase();
  const reviewId = String(formData.get("reviewId") ?? "");
  const parentReplyRaw = String(formData.get("parentReplyId") ?? "").trim();
  const parentReplyId = parentReplyRaw.length > 0 ? parentReplyRaw : null;

  const result = await createReviewReplyForUser(
    {
      userId: user.id,
      reviewId,
      parentReplyId,
      body: String(formData.get("body") ?? ""),
    },
    {
      async insertReply(payload) {
        const { error } = await client.from("review_replies").insert({
          review_id: payload.reviewId,
          user_id: payload.userId,
          parent_reply_id: payload.parentReplyId,
          body: payload.body,
        });
        return { error };
      },
    },
  );

  if (!result.ok) {
    if (result.type === "validation") {
      redirect(
        `/modules/${moduleCode}?error=${encodeURIComponent(firstError(result.errors))}#review-${reviewId}`,
      );
    }
    redirect(`/modules/${moduleCode}?error=${encodeURIComponent(result.message)}#review-${reviewId}`);
  }

  redirect(`/modules/${moduleCode}#review-${reviewId}`);
}
