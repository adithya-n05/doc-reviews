import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createServerClientMock,
  cookieStoreSetMock,
  cookiesMock,
} = vi.hoisted(() => ({
  createServerClientMock: vi.fn(() => ({ kind: "server-client" })),
  cookieStoreSetMock: vi.fn(),
  cookiesMock: vi.fn(async () => ({
    getAll: () => [{ name: "sb", value: "token" }],
    set: vi.fn(),
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

import { createSupabaseServerClient } from "./server";
import { resetEnvCacheForTests } from "@/lib/env";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  resetEnvCacheForTests();
  createServerClientMock.mockClear();
  cookieStoreSetMock.mockClear();
  cookiesMock.mockResolvedValue({
    getAll: () => [{ name: "sb", value: "token" }],
    set: cookieStoreSetMock,
  });
});

describe("createSupabaseServerClient", () => {
  it("creates server client and wires cookie handlers", async () => {
    const client = await createSupabaseServerClient();

    expect(client).toEqual({ kind: "server-client" });
    expect(createServerClientMock).toHaveBeenCalledTimes(1);

    const [url, anonKey, options] = createServerClientMock.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
    expect(anonKey).toBe("anon");
    expect(options.cookies.getAll()).toEqual([{ name: "sb", value: "token" }]);

    options.cookies.setAll([
      { name: "a", value: "1", options: { path: "/" } },
      { name: "b", value: "2", options: { httpOnly: true } },
    ]);

    expect(cookieStoreSetMock).toHaveBeenCalledTimes(2);
    expect(cookieStoreSetMock).toHaveBeenCalledWith("a", "1", { path: "/" });
    expect(cookieStoreSetMock).toHaveBeenCalledWith("b", "2", {
      httpOnly: true,
    });
  });
});
