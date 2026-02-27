import { validateReviewInput } from "@/lib/validation/review";

type ReviewPersistence = {
  upsertReview: (payload: {
    userId: string;
    moduleId: string;
    teachingRating: number;
    workloadRating: number;
    difficultyRating: number;
    assessmentRating: number;
    comment: string;
  }) => Promise<{ error: string | null }>;
};

type ReviewContext = {
  userId: string;
  moduleId: string;
  moduleCode: string;
};

type ReviewInput = {
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
};

type ValidationFailure = {
  ok: false;
  type: "validation";
  errors: Record<string, string | undefined>;
};

type DbFailure = {
  ok: false;
  type: "db";
  message: string;
};

type Success = {
  ok: true;
};

export async function upsertReviewForUser(
  persistence: ReviewPersistence,
  context: ReviewContext,
  input: ReviewInput,
): Promise<Success | ValidationFailure | DbFailure> {
  const validated = validateReviewInput({
    moduleCode: context.moduleCode,
    teachingRating: input.teachingRating,
    workloadRating: input.workloadRating,
    difficultyRating: input.difficultyRating,
    assessmentRating: input.assessmentRating,
    comment: input.comment,
  });

  if (!validated.ok) {
    return {
      ok: false,
      type: "validation",
      errors: validated.errors,
    };
  }

  const { value } = validated;
  const { error } = await persistence.upsertReview({
    userId: context.userId,
    moduleId: context.moduleId,
    teachingRating: value.teachingRating,
    workloadRating: value.workloadRating,
    difficultyRating: value.difficultyRating,
    assessmentRating: value.assessmentRating,
    comment: value.comment,
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
  };
}
