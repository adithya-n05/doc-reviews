import { describe, expect, it, vi } from "vitest";
import {
  loginWithPassword,
  resendSignupVerification,
  signOutCurrentUser,
  signupWithPassword,
} from "./auth-service";

type MockSupabaseAuth = {
  signUp: ReturnType<typeof vi.fn>;
  resend?: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
};

function buildClient(auth: MockSupabaseAuth) {
  return {
    auth: {
      resend: vi.fn().mockResolvedValue({ data: null, error: null }),
      ...auth,
    },
  };
}

describe("signupWithPassword", () => {
  it("returns validation errors for invalid signup payload", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    };

    const result = await signupWithPassword(
      buildClient(auth),
      {
        fullName: "",
        email: "bad-email",
        password: "123",
        confirmPassword: "999",
      },
      "https://doc-reviews.vercel.app/auth/verify",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("validation");
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.confirmPassword).toBeDefined();
    }

    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("calls supabase auth.signUp for valid signup payload", async () => {
    const auth = {
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    };

    const result = await signupWithPassword(
      buildClient(auth),
      {
        fullName: "Ada Lovelace",
        email: "ADA@IC.AC.UK",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
      },
      "https://doc-reviews.vercel.app/auth/verify",
    );

    expect(result.ok).toBe(true);
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "ada@ic.ac.uk",
      password: "StrongPassword123!",
      options: {
        emailRedirectTo: "https://doc-reviews.vercel.app/auth/verify",
        data: {
          full_name: "Ada Lovelace",
        },
      },
    });
  });

  it("returns auth error when supabase signup fails", async () => {
    const auth = {
      signUp: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Already registered" } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    };

    const result = await signupWithPassword(
      buildClient(auth),
      {
        fullName: "Ada Lovelace",
        email: "ada@imperial.ac.uk",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
      },
      "https://doc-reviews.vercel.app/auth/verify",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("auth");
      expect(result.message).toMatch(/already/i);
    }
  });
});

describe("loginWithPassword", () => {
  it("rejects invalid login payloads", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    };

    const result = await loginWithPassword(buildClient(auth), {
      email: "invalid",
      password: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("validation");
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    }

    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("calls supabase auth.signInWithPassword for valid credentials", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn(),
    };

    const result = await loginWithPassword(buildClient(auth), {
      email: "STUDENT@imperial.ac.uk",
      password: "StrongPassword123!",
    });

    expect(result.ok).toBe(true);
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "student@imperial.ac.uk",
      password: "StrongPassword123!",
    });
  });

  it("surfaces auth failure messages", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Invalid login credentials" } }),
      signOut: vi.fn(),
    };

    const result = await loginWithPassword(buildClient(auth), {
      email: "student@imperial.ac.uk",
      password: "bad-password",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("auth");
      expect(result.message).toMatch(/invalid/i);
    }
  });
});

describe("resendSignupVerification", () => {
  it("rejects non-imperial resend requests", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resend: vi.fn(),
    };

    const result = await resendSignupVerification(
      buildClient(auth),
      {
        email: "user@gmail.com",
      },
      "https://doc-reviews.vercel.app/auth/callback",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("validation");
      expect(result.message).toMatch(/imperial/i);
    }
    expect(auth.resend).not.toHaveBeenCalled();
  });

  it("calls auth.resend for valid imperial email", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resend: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    const result = await resendSignupVerification(
      buildClient(auth),
      {
        email: "Ada@IC.AC.UK",
      },
      "https://doc-reviews.vercel.app/auth/callback",
    );

    expect(result).toEqual({ ok: true });
    expect(auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "ada@ic.ac.uk",
      options: {
        emailRedirectTo: "https://doc-reviews.vercel.app/auth/callback",
      },
    });
  });

  it("surfaces resend failures", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resend: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "resend throttled" },
      }),
    };

    const result = await resendSignupVerification(
      buildClient(auth),
      {
        email: "ada@ic.ac.uk",
      },
      "https://doc-reviews.vercel.app/auth/callback",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.type).toBe("auth");
      expect(result.message).toMatch(/throttled/i);
    }
  });
});

describe("signOutCurrentUser", () => {
  it("returns ok true when sign out succeeds", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    };

    const result = await signOutCurrentUser(buildClient(auth));

    expect(result.ok).toBe(true);
  });

  it("returns auth failure if sign out fails", async () => {
    const auth = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: { message: "Sign out failed" } }),
    };

    const result = await signOutCurrentUser(buildClient(auth));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/failed/i);
    }
  });
});
