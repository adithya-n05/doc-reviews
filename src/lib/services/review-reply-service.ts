type CreateReplyInput = {
  userId: string;
  reviewId: string;
  parentReplyId: string | null;
  body: string;
};

type Persistence = {
  insertReply(input: CreateReplyInput): Promise<{ error: { message?: string } | null }>;
};

type Success = { ok: true };
type ValidationFailure = {
  ok: false;
  type: "validation";
  errors: {
    body?: string;
  };
};
type DbFailure = {
  ok: false;
  type: "db";
  message: string;
};

export async function createReviewReplyForUser(
  input: CreateReplyInput,
  persistence: Persistence,
): Promise<Success | ValidationFailure | DbFailure> {
  const body = input.body.trim();
  if (!body) {
    return {
      ok: false,
      type: "validation",
      errors: {
        body: "Reply text is required.",
      },
    };
  }

  if (body.length > 2000) {
    return {
      ok: false,
      type: "validation",
      errors: {
        body: "Reply must be 2000 characters or fewer.",
      },
    };
  }

  const { error } = await persistence.insertReply({
    userId: input.userId,
    reviewId: input.reviewId,
    parentReplyId: input.parentReplyId,
    body,
  });
  if (error) {
    return {
      ok: false,
      type: "db",
      message: error.message ?? "Failed to post reply.",
    };
  }

  return { ok: true };
}
