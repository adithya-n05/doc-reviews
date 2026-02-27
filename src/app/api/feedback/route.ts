import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateFeedbackInput } from "@/lib/validation/feedback";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateFeedbackInput({
    message:
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "",
    pagePath:
      typeof (payload as { pagePath?: unknown }).pagePath === "string"
        ? (payload as { pagePath: string }).pagePath
        : "/",
    feedbackType:
      typeof (payload as { feedbackType?: unknown }).feedbackType === "string"
        ? (payload as { feedbackType: string }).feedbackType
        : "general",
    context:
      payload !== null &&
      typeof payload === "object" &&
      "context" in payload &&
      (typeof (payload as { context?: unknown }).context === "object" ||
        (payload as { context?: unknown }).context === null)
        ? ((payload as { context?: unknown }).context as Record<string, unknown> | null)
        : null,
  });

  if (!validation.ok) {
    return NextResponse.json(
      {
        error:
          validation.errors.message ??
          validation.errors.feedbackType ??
          "Invalid feedback payload.",
      },
      { status: 400 },
    );
  }

  try {
    const client = await createSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    const { error } = await client.from("feedback_submissions").insert({
      message: validation.value.message,
      page_path: validation.value.pagePath,
      feedback_type: validation.value.feedbackType,
      context: validation.value.context,
      user_id: user?.id ?? null,
    });

    if (error) {
      return NextResponse.json(
        { error: "Unable to submit feedback right now." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to submit feedback right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
