import type { ValidationResult } from "./types";

type FeedbackInput = {
  message: string;
  pagePath?: string;
  feedbackType?: string;
  context?: Record<string, unknown> | null;
};

type FeedbackOutput = {
  message: string;
  pagePath: string;
  feedbackType: FeedbackType;
  context: Record<string, unknown> | null;
};

type FeedbackErrors = {
  message?: string;
  feedbackType?: string;
};

const MAX_MESSAGE_LENGTH = 4000;
const FEEDBACK_TYPES = [
  "general",
  "bug",
  "feature",
  "ui",
  "data",
  "other",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export function validateFeedbackInput(
  input: FeedbackInput,
): ValidationResult<FeedbackOutput, FeedbackErrors> {
  const message = input.message.trim();
  const pagePathRaw = (input.pagePath ?? "/").trim();
  const pagePath = pagePathRaw.startsWith("/") ? pagePathRaw : "/";
  const feedbackType = (input.feedbackType ?? "general").trim().toLowerCase();
  const errors: FeedbackErrors = {};

  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) {
    errors.message = "Feedback must be between 1 and 4000 characters.";
  }

  if (!FEEDBACK_TYPES.includes(feedbackType as FeedbackType)) {
    errors.feedbackType = "Invalid feedback type.";
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
      message,
      pagePath,
      feedbackType: feedbackType as FeedbackType,
      context: input.context ?? null,
    },
  };
}
