import type { ValidationResult } from "./types";

type OnboardingInput = {
  year: number;
  degreeTrack: string;
  moduleCodes: string[];
};

type OnboardingOutput = {
  year: number;
  degreeTrack: string;
  moduleCodes: string[];
};

type OnboardingErrors = {
  year?: string;
  degreeTrack?: string;
  moduleCodes?: string;
};

export function validateOnboardingInput(
  input: OnboardingInput,
): ValidationResult<OnboardingOutput, OnboardingErrors> {
  const errors: OnboardingErrors = {};
  const degreeTrack = input.degreeTrack.trim();

  if (!Number.isInteger(input.year) || input.year < 1 || input.year > 4) {
    errors.year = "Year must be between 1 and 4.";
  }

  if (!degreeTrack) {
    errors.degreeTrack = "Degree track is required.";
  }

  const normalizedModuleCodes = Array.from(
    new Set(
      input.moduleCodes
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0),
    ),
  );

  if (normalizedModuleCodes.length === 0) {
    errors.moduleCodes = "Please select at least one module.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    value: {
      year: input.year,
      degreeTrack,
      moduleCodes: normalizedModuleCodes,
    },
  };
}
