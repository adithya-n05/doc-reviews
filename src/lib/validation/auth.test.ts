import { describe, expect, it } from "vitest";
import { validateSignupInput, validateLoginInput } from "./auth";

describe("validateSignupInput", () => {
  it("accepts a valid imperial signup payload", () => {
    const result = validateSignupInput({
      fullName: "Ada Lovelace",
      email: "ada@ic.ac.uk",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe("ada@ic.ac.uk");
      expect(result.value.fullName).toBe("Ada Lovelace");
    }
  });

  it("rejects non-imperial domains", () => {
    const result = validateSignupInput({
      fullName: "Ada Lovelace",
      email: "ada@gmail.com",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toMatch(/imperial/i);
    }
  });

  it("rejects mismatched passwords", () => {
    const result = validateSignupInput({
      fullName: "Ada Lovelace",
      email: "ada@imperial.ac.uk",
      password: "StrongPassword123!",
      confirmPassword: "DifferentPassword123!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.confirmPassword).toMatch(/match/i);
    }
  });

  it("rejects weak passwords", () => {
    const result = validateSignupInput({
      fullName: "Ada Lovelace",
      email: "ada@ic.ac.uk",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.password).toMatch(/at least/i);
    }
  });

  it("rejects empty full names", () => {
    const result = validateSignupInput({
      fullName: "",
      email: "ada@ic.ac.uk",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.fullName).toMatch(/required/i);
    }
  });
});

describe("validateLoginInput", () => {
  it("accepts valid login input", () => {
    const result = validateLoginInput({
      email: "test@imperial.ac.uk",
      password: "Password123!",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects malformed email", () => {
    const result = validateLoginInput({
      email: "not-an-email",
      password: "Password123!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toMatch(/valid email/i);
    }
  });

  it("rejects missing password", () => {
    const result = validateLoginInput({
      email: "test@ic.ac.uk",
      password: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.password).toMatch(/required/i);
    }
  });
});
