"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { needsOnboarding } from "@/lib/auth/user-access";
import {
  loginWithPassword,
  resendSignupVerification,
  signOutCurrentUser,
  signupWithPassword,
} from "@/lib/services/auth-service";
import { checkSignupEmailAvailability } from "@/lib/services/signup-availability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildAbsoluteUrl } from "@/lib/supabase/urls";

function firstError(errors: Record<string, string | undefined>): string {
  for (const value of Object.values(errors)) {
    if (value) return value;
  }
  return "Please check the form and try again.";
}

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function resolveSignupCallbackUrl(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");

  if (host) {
    const proto =
      forwardedProto ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}/auth/callback`;
  }

  return buildAbsoluteUrl("/auth/callback");
}

export async function signupAction(formData: FormData): Promise<never> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const callbackUrl = await resolveSignupCallbackUrl();

  const adminClient = createSupabaseAdminClient();
  const availability = await checkSignupEmailAvailability(adminClient, email);
  if (!availability.ok) {
    if (availability.status === "unverified") {
      const client = await createSupabaseServerClient();
      const resendResult = await resendSignupVerification(
        client,
        { email },
        callbackUrl,
      );
      if (resendResult.ok) {
        redirect("/auth/verify?resent=1");
      }
      if (resendResult.type === "validation") {
        withError("/auth/signup", resendResult.message);
      }
      withError("/auth/signup", resendResult.message);
    }
    withError("/auth/signup", availability.message);
  }

  const client = await createSupabaseServerClient();
  const result = await signupWithPassword(
    client,
    {
      fullName,
      email,
      password,
      confirmPassword,
    },
    callbackUrl,
  );

  if (!result.ok) {
    if (result.type === "validation") {
      withError("/auth/signup", firstError(result.errors));
    }
    withError("/auth/signup", result.message);
  }

  redirect("/auth/verify?sent=1");
}

export async function loginAction(formData: FormData): Promise<never> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const client = await createSupabaseServerClient();
  const result = await loginWithPassword(client, {
    email,
    password,
  });

  if (!result.ok) {
    if (result.type === "validation") {
      withError("/auth/login", firstError(result.errors));
    }
    withError("/auth/login", result.message);
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    withError("/auth/login", "Unable to establish session.");
  }

  if (!user.email_confirmed_at) {
    redirect("/auth/verify?pending=1");
  }

  const { data: profile } = await client
    .from("profiles")
    .select("year,degree_track")
    .eq("id", user.id)
    .maybeSingle();

  if (needsOnboarding(profile)) {
    redirect("/onboarding");
  }

  redirect("/modules");
}

export async function signOutAction(): Promise<never> {
  const client = await createSupabaseServerClient();
  await signOutCurrentUser(client);
  redirect("/");
}
