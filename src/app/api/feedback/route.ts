import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message =
    typeof (payload as { message?: unknown }).message === "string"
      ? (payload as { message: string }).message.trim()
      : "";
  const pagePathRaw =
    typeof (payload as { pagePath?: unknown }).pagePath === "string"
      ? (payload as { pagePath: string }).pagePath.trim()
      : "/";
  const pagePath = pagePathRaw.startsWith("/") ? pagePathRaw : "/";

  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Feedback must be between 1 and 4000 characters." },
      { status: 400 },
    );
  }

  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  const { error } = await client.from("feedback_submissions").insert({
    message,
    page_path: pagePath,
    user_id: user?.id ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to submit feedback right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
