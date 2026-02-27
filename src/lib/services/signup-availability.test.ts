import { describe, expect, it, vi } from "vitest";
import { checkSignupEmailAvailability } from "@/lib/services/signup-availability";

type QueryResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<QueryResult>>>;
};

function makeClient(result: QueryResult) {
  const builder: QueryBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(async () => result),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return {
    from: vi.fn(() => builder),
    _builder: builder,
  };
}

describe("checkSignupEmailAvailability", () => {
  it("rejects signup when a profile already exists for that email", async () => {
    const client = makeClient({ data: { id: "p1" }, error: null });

    const result = await checkSignupEmailAvailability(client, "ANB122@ic.ac.uk");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/already exists/i);
    }
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(client._builder.eq).toHaveBeenCalledWith("email", "anb122@ic.ac.uk");
  });

  it("allows signup when no existing profile matches the email", async () => {
    const client = makeClient({ data: null, error: null });

    const result = await checkSignupEmailAvailability(client, "student@imperial.ac.uk");

    expect(result).toEqual({ ok: true });
  });

  it("fails closed with a clear message when lookup errors", async () => {
    const client = makeClient({ data: null, error: { message: "db down" } });

    const result = await checkSignupEmailAvailability(client, "student@ic.ac.uk");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/try again/i);
    }
  });
});
