import { describe, expect, it, vi } from "vitest";
import { checkSignupEmailAvailability } from "@/lib/services/signup-availability";

type QueryResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

type UserLookupResult = {
  data: { user: { email_confirmed_at?: string | null } | null };
  error: { message: string } | null;
};

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<QueryResult>>>;
};

function makeClient(result: QueryResult, userLookup: UserLookupResult) {
  const builder: QueryBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(async () => result),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return {
    from: vi.fn(() => builder),
    auth: {
      admin: {
        getUserById: vi.fn(async () => userLookup),
      },
    },
    _builder: builder,
  };
}

describe("checkSignupEmailAvailability", () => {
  it("rejects signup when a verified account already exists for that email", async () => {
    const client = makeClient(
      { data: { id: "p1" }, error: null },
      { data: { user: { email_confirmed_at: "2026-02-27T00:00:00.000Z" } }, error: null },
    );

    const result = await checkSignupEmailAvailability(client, "ANB122@ic.ac.uk");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("verified");
      expect(result.message).toMatch(/already exists/i);
    }
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(client._builder.eq).toHaveBeenCalledWith("email", "anb122@ic.ac.uk");
  });

  it("allows signup when no existing profile matches the email", async () => {
    const client = makeClient(
      { data: null, error: null },
      { data: { user: null }, error: null },
    );

    const result = await checkSignupEmailAvailability(client, "student@imperial.ac.uk");

    expect(result).toEqual({ ok: true });
  });

  it("fails closed with a clear message when lookup errors", async () => {
    const client = makeClient(
      { data: null, error: { message: "db down" } },
      { data: { user: null }, error: null },
    );

    const result = await checkSignupEmailAvailability(client, "student@ic.ac.uk");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("unknown");
      expect(result.message).toMatch(/try again/i);
    }
  });

  it("flags existing unverified accounts so signup flow can resend confirmation", async () => {
    const client = makeClient(
      { data: { id: "p2" }, error: null },
      { data: { user: { email_confirmed_at: null } }, error: null },
    );

    const result = await checkSignupEmailAvailability(client, "pending@ic.ac.uk");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("unverified");
      expect(result.message).toMatch(/not verified/i);
    }
  });
});
