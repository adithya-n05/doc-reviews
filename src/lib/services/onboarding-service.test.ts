import { describe, expect, it, vi } from "vitest";
import { saveOnboardingForUser } from "@/lib/services/onboarding-service";

describe("saveOnboardingForUser", () => {
  it("returns validation errors for invalid payload", async () => {
    const deps = {
      getModulesByCodes: vi.fn(async () => []),
      updateProfile: vi.fn(async () => ({ error: null })),
      replaceUserModules: vi.fn(async () => ({ error: null })),
    };

    const result = await saveOnboardingForUser(deps, {
      userId: "user-1",
      year: 5,
      degreeTrack: " ",
      moduleCodes: [],
    });

    expect(result).toEqual({
      ok: false,
      type: "validation",
      errors: {
        year: "Year must be between 1 and 4.",
        degreeTrack: "Degree track is required.",
        moduleCodes: "Please select at least one module.",
      },
    });
    expect(deps.getModulesByCodes).not.toHaveBeenCalled();
  });

  it("returns validation error when selected module codes are unknown", async () => {
    const deps = {
      getModulesByCodes: vi.fn(async () => [{ id: "m1", code: "40008" }]),
      updateProfile: vi.fn(async () => ({ error: null })),
      replaceUserModules: vi.fn(async () => ({ error: null })),
    };

    const result = await saveOnboardingForUser(deps, {
      userId: "user-1",
      year: 1,
      degreeTrack: "BEng",
      moduleCodes: ["40008", "99999"],
    });

    expect(result).toEqual({
      ok: false,
      type: "validation",
      errors: {
        moduleCodes: "Unknown modules selected: 99999",
      },
    });
    expect(deps.updateProfile).not.toHaveBeenCalled();
    expect(deps.replaceUserModules).not.toHaveBeenCalled();
  });

  it("saves profile and module selections for valid input", async () => {
    const deps = {
      getModulesByCodes: vi.fn(async () => [
        { id: "m1", code: "40008" },
        { id: "m2", code: "40012" },
      ]),
      updateProfile: vi.fn(async () => ({ error: null })),
      replaceUserModules: vi.fn(async () => ({ error: null })),
    };

    const result = await saveOnboardingForUser(deps, {
      userId: "user-1",
      year: 1,
      degreeTrack: "BEng",
      moduleCodes: ["40008", "40012"],
    });

    expect(result).toEqual({ ok: true });
    expect(deps.updateProfile).toHaveBeenCalledWith({
      userId: "user-1",
      year: 1,
      degreeTrack: "BEng",
    });
    expect(deps.replaceUserModules).toHaveBeenCalledWith({
      userId: "user-1",
      moduleIds: ["m1", "m2"],
    });
  });

  it("returns db error when profile update fails", async () => {
    const deps = {
      getModulesByCodes: vi.fn(async () => [{ id: "m1", code: "40008" }]),
      updateProfile: vi.fn(async () => ({ error: "write failed" })),
      replaceUserModules: vi.fn(async () => ({ error: null })),
    };

    const result = await saveOnboardingForUser(deps, {
      userId: "user-1",
      year: 1,
      degreeTrack: "BEng",
      moduleCodes: ["40008"],
    });

    expect(result).toEqual({
      ok: false,
      type: "db",
      message: "write failed",
    });
    expect(deps.replaceUserModules).not.toHaveBeenCalled();
  });

  it("returns db error when module replacement fails", async () => {
    const deps = {
      getModulesByCodes: vi.fn(async () => [{ id: "m1", code: "40008" }]),
      updateProfile: vi.fn(async () => ({ error: null })),
      replaceUserModules: vi.fn(async () => ({ error: "module write failed" })),
    };

    const result = await saveOnboardingForUser(deps, {
      userId: "user-1",
      year: 1,
      degreeTrack: "BEng",
      moduleCodes: ["40008"],
    });

    expect(result).toEqual({
      ok: false,
      type: "db",
      message: "module write failed",
    });
  });
});
