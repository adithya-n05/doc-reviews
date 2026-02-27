type HelpfulVotePersistence = {
  hasVote: (input: { userId: string; replyId: string }) => Promise<boolean>;
  addVote: (input: { userId: string; replyId: string }) => Promise<{ error: string | null }>;
  removeVote: (input: { userId: string; replyId: string }) => Promise<{ error: string | null }>;
};

type HelpfulVoteInput = {
  userId: string;
  replyId: string;
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

export async function toggleHelpfulVoteForReply(
  persistence: HelpfulVotePersistence,
  input: HelpfulVoteInput,
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

    const alreadyVoted = await persistence.hasVote({
      userId: input.userId,
      replyId,
    });

    if (alreadyVoted) {
      const { error } = await persistence.removeVote({
        userId: input.userId,
        replyId,
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
      replyId,
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
