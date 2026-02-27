type HelpfulVotePersistence = {
  hasVote: (input: { userId: string; reviewId: string }) => Promise<boolean>;
  addVote: (input: { userId: string; reviewId: string }) => Promise<{ error: string | null }>;
  removeVote: (input: { userId: string; reviewId: string }) => Promise<{ error: string | null }>;
};

type HelpfulVoteInput = {
  userId: string;
  reviewId: string;
};

type ValidationFailure = {
  ok: false;
  type: "validation";
  message: string;
};

type DbFailure = {
  ok: false;
  type: "db";
  message: string;
};

type Success = {
  ok: true;
  voted: boolean;
};

export async function toggleHelpfulVoteForReview(
  persistence: HelpfulVotePersistence,
  input: HelpfulVoteInput,
): Promise<Success | ValidationFailure | DbFailure> {
  try {
    const reviewId = input.reviewId.trim();
    if (!reviewId) {
      return {
        ok: false,
        type: "validation",
        message: "Review id is required.",
      };
    }

    const alreadyVoted = await persistence.hasVote({
      userId: input.userId,
      reviewId,
    });

    if (alreadyVoted) {
      const { error } = await persistence.removeVote({
        userId: input.userId,
        reviewId,
      });
      if (error) {
        return {
          ok: false,
          type: "db",
          message: error,
        };
      }
      return {
        ok: true,
        voted: false,
      };
    }

    const { error } = await persistence.addVote({
      userId: input.userId,
      reviewId,
    });
    if (error) {
      return {
        ok: false,
        type: "db",
        message: error,
      };
    }
    return {
      ok: true,
      voted: true,
    };
  } catch (error) {
    return {
      ok: false,
      type: "db",
      message: error instanceof Error ? error.message : "Unable to update helpful vote.",
    };
  }
}
