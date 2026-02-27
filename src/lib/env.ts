type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

type ServiceSupabaseEnv = {
  url: string;
  serviceRoleKey: string;
};

let cachedPublicEnv: PublicSupabaseEnv | null = null;
let cachedServiceEnv: ServiceSupabaseEnv | null = null;

function requireEnv(
  name: string,
  value: string | undefined,
  label?: string,
): string {
  if (!value || value.trim().length === 0) {
    const hint = label ? ` (${label})` : "";
    throw new Error(`Missing required environment variable: ${name}${hint}`);
  }

  return value.trim();
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (cachedPublicEnv) {
    return cachedPublicEnv;
  }

  cachedPublicEnv = {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };

  return cachedPublicEnv;
}

export function getServiceSupabaseEnv(): ServiceSupabaseEnv {
  if (cachedServiceEnv) {
    return cachedServiceEnv;
  }

  cachedServiceEnv = {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKey: requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "service role key",
    ),
  };

  return cachedServiceEnv;
}

export function resetEnvCacheForTests(): void {
  cachedPublicEnv = null;
  cachedServiceEnv = null;
}
