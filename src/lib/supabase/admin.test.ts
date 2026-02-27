import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({ kind: "admin-client" })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

import {
  createSupabaseAdminClient,
  resetSupabaseAdminClientForTests,
} from "./admin";
import { resetEnvCacheForTests } from "@/lib/env";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  resetEnvCacheForTests();
  resetSupabaseAdminClientForTests();
  createClientMock.mockClear();
});

describe("createSupabaseAdminClient", () => {
  it("creates admin client with secure auth settings", () => {
    const client = createSupabaseAdminClient();

    expect(client).toEqual({ kind: "admin-client" });
    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  });

  it("returns cached admin client", () => {
    const first = createSupabaseAdminClient();
    const second = createSupabaseAdminClient();

    expect(first).toBe(second);
    expect(createClientMock).toHaveBeenCalledTimes(1);
  });
});
