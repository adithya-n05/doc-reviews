import { describe, expect, it } from "vitest";
import { validateProfileAvatarUrl } from "./profile-avatar";

describe("validateProfileAvatarUrl", () => {
  it("accepts valid https image urls", () => {
    const result = validateProfileAvatarUrl("https://images.example.com/avatar.jpg");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("https://images.example.com/avatar.jpg");
    }
  });

  it("rejects empty urls", () => {
    const result = validateProfileAvatarUrl("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects non-https urls", () => {
    const result = validateProfileAvatarUrl("http://images.example.com/avatar.jpg");
    expect(result.ok).toBe(false);
  });

  it("rejects malformed urls", () => {
    const result = validateProfileAvatarUrl("not-a-url");
    expect(result.ok).toBe(false);
  });
});
