import { describe, expect, it } from "vitest";
import { isImperialEmail } from "./email-domain";

describe("isImperialEmail", () => {
  it("accepts ic.ac.uk emails", () => {
    expect(isImperialEmail("abc123@ic.ac.uk")).toBe(true);
  });

  it("accepts imperial.ac.uk emails", () => {
    expect(isImperialEmail("student@imperial.ac.uk")).toBe(true);
  });

  it("normalizes case and whitespace", () => {
    expect(isImperialEmail("  STUDENT@IC.AC.UK  ")).toBe(true);
  });

  it("rejects non-imperial domains", () => {
    expect(isImperialEmail("user@gmail.com")).toBe(false);
    expect(isImperialEmail("user@imperial.com")).toBe(false);
    expect(isImperialEmail("user@ic.ac.uk.evil.com")).toBe(false);
  });

  it("rejects malformed email values", () => {
    expect(isImperialEmail("")).toBe(false);
    expect(isImperialEmail("justtext")).toBe(false);
    expect(isImperialEmail("@ic.ac.uk")).toBe(false);
    expect(isImperialEmail("user@@ic.ac.uk")).toBe(false);
  });
});
