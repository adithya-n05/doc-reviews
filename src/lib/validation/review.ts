import type { ValidationResult } from "./types";

type ReviewInput = {
  moduleCode: string;
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
  tips?: string;
};

type ReviewOutput = {
  moduleCode: string;
  teachingRating: number;
  workloadRating: number;
  difficultyRating: number;
  assessmentRating: number;
  comment: string;
  tips: string | null;
};

type ReviewErrors = {
  moduleCode?: string;
  teachingRating?: string;
  workloadRating?: string;
  difficultyRating?: string;
  assessmentRating?: string;
  comment?: string;
};

const isValidRating = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 5;

export function validateReviewInput(
  input: ReviewInput,
): ValidationResult<ReviewOutput, ReviewErrors> {
  const errors: ReviewErrors = {};
  const moduleCode = input.moduleCode.trim().toUpperCase();
  const comment = input.comment.trim();
  const tips = (input.tips ?? "").trim();

  if (!moduleCode) {
    errors.moduleCode = "Module code is required.";
  }

  if (!isValidRating(input.teachingRating)) {
    errors.teachingRating = "Teaching rating must be between 1 and 5.";
  }

  if (!isValidRating(input.workloadRating)) {
    errors.workloadRating = "Workload rating must be between 1 and 5.";
  }

  if (!isValidRating(input.difficultyRating)) {
    errors.difficultyRating = "Difficulty rating must be between 1 and 5.";
  }

  if (!isValidRating(input.assessmentRating)) {
    errors.assessmentRating = "Assessment rating must be between 1 and 5.";
  }

  if (comment.length < 80) {
    errors.comment = "Comment must be at least 80 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    value: {
      moduleCode,
      teachingRating: input.teachingRating,
      workloadRating: input.workloadRating,
      difficultyRating: input.difficultyRating,
      assessmentRating: input.assessmentRating,
      comment,
      tips: tips.length > 0 ? tips : null,
    },
  };
}
