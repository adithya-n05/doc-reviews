import type { ValidationResult } from "./types";

type FeedbackInput = {
  message: string;
  pagePath?: string;
};

type FeedbackOutput = {
  message: string;
  pagePath: string;
};

type FeedbackErrors = {
  message?: string;
};

const MAX_MESSAGE_LENGTH = 4000;

export function validateFeedbackInput(
  input: FeedbackInput,
): ValidationResult<FeedbackOutput, FeedbackErrors> {
  const message = input.message.trim();
  const pagePathRaw = (input.pagePath ?? "/").trim();
  const pagePath = pagePathRaw.startsWith("/") ? pagePathRaw : "/";
  const errors: FeedbackErrors = {};

  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) {
    errors.message = "Feedback must be between 1 and 4000 characters.";
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
    },
  };
}
