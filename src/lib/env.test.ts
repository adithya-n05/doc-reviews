import { beforeEach, describe, expect, it } from "vitest";
import {
  getPublicSupabaseEnv,
  getServiceSupabaseEnv,
  resetEnvCacheForTests,
} from "./env";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  resetEnvCacheForTests();
});

describe("getPublicSupabaseEnv", () => {
  it("returns required public Supabase environment values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const env = getPublicSupabaseEnv();

    expect(env.url).toBe("https://example.supabase.co");
    expect(env.anonKey).toBe("anon-key");
  });

  it("throws when public env values are missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    expect(() => getPublicSupabaseEnv()).toThrow(/missing/i);
  });
});

describe("getServiceSupabaseEnv", () => {
  it("returns service env values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const env = getServiceSupabaseEnv();

    expect(env.url).toBe("https://example.supabase.co");
    expect(env.serviceRoleKey).toBe("service-role-key");
  });

  it("throws when service role key is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getServiceSupabaseEnv()).toThrow(/service role/i);
  });
});
