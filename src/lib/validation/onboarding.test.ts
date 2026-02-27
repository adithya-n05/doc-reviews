import { describe, expect, it } from "vitest";
import { validateOnboardingInput } from "./onboarding";

describe("validateOnboardingInput", () => {
  it("accepts valid onboarding input", () => {
    const result = validateOnboardingInput({
      year: 2,
      degreeTrack: "MEng Computing",
      moduleCodes: ["50001", "50002"],
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid years", () => {
    const result = validateOnboardingInput({
      year: 0,
      degreeTrack: "MEng Computing",
      moduleCodes: ["50001"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.year).toMatch(/between 1 and 4/i);
    }
  });

  it("rejects missing degree track", () => {
    const result = validateOnboardingInput({
      year: 3,
      degreeTrack: "",
      moduleCodes: ["60010"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.degreeTrack).toMatch(/required/i);
    }
  });

  it("rejects empty module selection", () => {
    const result = validateOnboardingInput({
      year: 1,
      degreeTrack: "BEng Computing",
      moduleCodes: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.moduleCodes).toMatch(/at least one/i);
    }
  });

  it("normalizes module codes", () => {
    const result = validateOnboardingInput({
      year: 1,
      degreeTrack: "BEng Computing",
      moduleCodes: [" 40008 ", "40008", "40009"],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.moduleCodes).toEqual(["40008", "40009"]);
    }
  });
});
