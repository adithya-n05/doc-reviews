import { redirect } from "next/navigation";
import { needsOnboarding } from "@/lib/auth/user-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccessOptions = {
  requireVerified?: boolean;
  requireOnboarded?: boolean;
};

export async function requireUserContext(options: AccessOptions = {}) {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (options.requireVerified && !user.email_confirmed_at) {
    redirect("/auth/verify?pending=1");
  }

  const { data: profile } = await client
    .from("profiles")
    .select("id,full_name,email,year,degree_track,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/auth/signup?error=Profile%20not%20found");
  }

  if (options.requireOnboarded && needsOnboarding(profile)) {
    redirect("/onboarding");
  }

  return {
    client,
    user,
    profile,
  };
}
