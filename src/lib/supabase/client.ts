import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const env = getPublicSupabaseEnv();
  browserClient = createBrowserClient(env.url, env.anonKey);
  return browserClient;
}

export function resetSupabaseBrowserClientForTests(): void {
  browserClient = null;
}
