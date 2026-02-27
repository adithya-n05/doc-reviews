import { beforeEach, describe, expect, it, vi } from "vitest";

const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn(() => ({ kind: "browser-client" })),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

import {
  createSupabaseBrowserClient,
  resetSupabaseBrowserClientForTests,
} from "./client";
import { resetEnvCacheForTests } from "@/lib/env";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  resetEnvCacheForTests();
  resetSupabaseBrowserClientForTests();
  createBrowserClientMock.mockClear();
});

describe("createSupabaseBrowserClient", () => {
  it("creates client using public env vars", () => {
    const client = createSupabaseBrowserClient();

    expect(client).toEqual({ kind: "browser-client" });
    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon",
    );
  });

  it("returns cached client after first creation", () => {
    const first = createSupabaseBrowserClient();
    const second = createSupabaseBrowserClient();

    expect(first).toBe(second);
    expect(createBrowserClientMock).toHaveBeenCalledTimes(1);
  });
});
