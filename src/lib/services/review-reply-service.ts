type CreateReplyInput = {
  userId: string;
  reviewId: string;
  parentReplyId: string | null;
  body: string;
};

type Persistence = {
  insertReply(input: CreateReplyInput): Promise<{ error: { message?: string } | null }>;
};

type UpdateReplyInput = {
  userId: string;
  replyId: string;
  body: string;
};

type UpdatePersistence = {
  updateReply(input: UpdateReplyInput): Promise<{ error: { message?: string } | null }>;
};

type DeleteReplyInput = {
  userId: string;
  replyId: string;
};

type DeletePersistence = {
  deleteReply(input: DeleteReplyInput): Promise<{ error: { message?: string } | null }>;
};

type Success = { ok: true };
type ValidationFailure = {
  ok: false;
  type: "validation";
  message?: string;
  errors?: {
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
  try {
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
  } catch (error) {
    return {
      ok: false,
      type: "db",
      message: error instanceof Error ? error.message : "Failed to post reply.",
    };
  }
}

export async function updateReviewReplyForUser(
  input: UpdateReplyInput,
  persistence: UpdatePersistence,
): Promise<Success | ValidationFailure | DbFailure> {
  try {
    const replyId = input.replyId.trim();
    if (!replyId) {
      return {
        ok: false,
        type: "validation",
        message: "Reply id is required.",
      };
    }

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

    const { error } = await persistence.updateReply({
      userId: input.userId,
      replyId,
      body,
    });

    if (error) {
      return {
        ok: false,
        type: "db",
        message: error.message ?? "Failed to update reply.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      type: "db",
      message: error instanceof Error ? error.message : "Failed to update reply.",
    };
  }
}

export async function deleteReviewReplyForUser(
  input: DeleteReplyInput,
  persistence: DeletePersistence,
): Promise<Success | ValidationFailure | DbFailure> {
  try {
    const replyId = input.replyId.trim();
    if (!replyId) {
      return {
        ok: false,
        type: "validation",
        message: "Reply id is required.",
      };
    }

    const { error } = await persistence.deleteReply({
      userId: input.userId,
      replyId,
    });

    if (error) {
      return {
        ok: false,
        type: "db",
        message: error.message ?? "Failed to delete reply.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      type: "db",
      message: error instanceof Error ? error.message : "Failed to delete reply.",
    };
  }
}
