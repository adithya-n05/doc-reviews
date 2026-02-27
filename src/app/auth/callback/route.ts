import { NextResponse } from "next/server";
import { logError } from "@/lib/logging";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    logError("auth_callback_missing_code", {
      path: "/auth/callback",
    });
    return NextResponse.redirect(
      new URL("/auth/verify?error=Missing%20verification%20code.", origin),
    );
  }

  const client = await createSupabaseServerClient();
  const { error } = await client.auth.exchangeCodeForSession(code);

  if (error) {
    logError("auth_callback_exchange_failed", {
      path: "/auth/callback",
      message: error.message,
    });
    return NextResponse.redirect(
      new URL(
        `/auth/verify?error=${encodeURIComponent(error.message)}`,
        origin,
      ),
    );
  }

  return NextResponse.redirect(new URL("/onboarding", origin));
}
