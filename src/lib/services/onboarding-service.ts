import { validateOnboardingInput } from "@/lib/validation/onboarding";

type OnboardingDeps = {
  getModulesByCodes: (
    moduleCodes: string[],
  ) => Promise<Array<{ id: string; code: string }>>;
  updateProfile: (payload: {
    userId: string;
    year: number;
    degreeTrack: string;
  }) => Promise<{ error: string | null }>;
  replaceUserModules: (payload: {
    userId: string;
    moduleIds: string[];
  }) => Promise<{ error: string | null }>;
};

type OnboardingInput = {
  userId: string;
  year: number;
  degreeTrack: string;
  moduleCodes: string[];
};

type ValidationFailure = {
  ok: false;
  type: "validation";
  errors: Record<string, string | undefined>;
};

type DbFailure = {
  ok: false;
  type: "db";
  message: string;
};

type Success = {
  ok: true;
};

export async function saveOnboardingForUser(
  deps: OnboardingDeps,
  input: OnboardingInput,
): Promise<Success | ValidationFailure | DbFailure> {
  const validated = validateOnboardingInput({
    year: input.year,
    degreeTrack: input.degreeTrack,
    moduleCodes: input.moduleCodes,
  });

  if (!validated.ok) {
    return {
      ok: false,
      type: "validation",
      errors: validated.errors,
    };
  }

  const moduleRows = await deps.getModulesByCodes(validated.value.moduleCodes);
  const moduleIdByCode = new Map(
    moduleRows.map((row) => [row.code.trim().toUpperCase(), row.id]),
  );

  const unknownCodes = validated.value.moduleCodes.filter(
    (code) => !moduleIdByCode.has(code),
  );

  if (unknownCodes.length > 0) {
    return {
      ok: false,
      type: "validation",
      errors: {
        moduleCodes: `Unknown modules selected: ${unknownCodes.join(", ")}`,
      },
    };
  }

  const { error: profileError } = await deps.updateProfile({
    userId: input.userId,
    year: validated.value.year,
    degreeTrack: validated.value.degreeTrack,
  });

  if (profileError) {
    return {
      ok: false,
      type: "db",
      message: profileError,
    };
  }

  const moduleIds = validated.value.moduleCodes.map(
    (code) => moduleIdByCode.get(code) as string,
  );

  const { error: modulesError } = await deps.replaceUserModules({
    userId: input.userId,
    moduleIds,
  });

  if (modulesError) {
    return {
      ok: false,
      type: "db",
      message: modulesError,
    };
  }

  return {
    ok: true,
  };
}
