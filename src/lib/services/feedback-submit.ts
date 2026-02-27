type SubmitFeedbackInput = {
  message: string;
  pagePath: string;
  feedbackType: string;
  context: Record<string, unknown> | null;
};

type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; error: string };

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 2;
const FALLBACK_ERROR_MESSAGE = "Unable to submit feedback right now.";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    // Ignore parse errors and return fallback.
  }

  return FALLBACK_ERROR_MESSAGE;
}

export async function submitFeedback(
  input: SubmitFeedbackInput,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitFeedbackResult> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        return { ok: true };
      }

      const error = await parseErrorMessage(response);
      if (!RETRYABLE_STATUSES.has(response.status) || attempt >= MAX_ATTEMPTS) {
        return { ok: false, error };
      }
    } catch {
      if (attempt >= MAX_ATTEMPTS) {
        return { ok: false, error: FALLBACK_ERROR_MESSAGE };
      }
    }
  }

  return { ok: false, error: FALLBACK_ERROR_MESSAGE };
}
