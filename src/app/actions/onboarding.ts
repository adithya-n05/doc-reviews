"use server";

import { redirect } from "next/navigation";
import { saveOnboardingForUser } from "@/lib/services/onboarding-service";
import { requireUserContext } from "@/lib/server/auth-context";

function withError(message: string): never {
  redirect(`/onboarding?error=${encodeURIComponent(message)}`);
}

function firstError(errors: Record<string, string | undefined>): string {
  for (const value of Object.values(errors)) {
    if (value) return value;
  }
  return "Please check your onboarding details.";
}

export async function saveOnboardingAction(formData: FormData): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
  });

  const year = Number.parseInt(String(formData.get("year") ?? ""), 10);
  const degreeTrack = String(formData.get("degreeTrack") ?? "");
  const moduleCodes = formData
    .getAll("moduleCodes")
    .map((value) => String(value))
    .filter((value) => value.length > 0);

  const result = await saveOnboardingForUser(
    {
      async getModulesByCodes(codes) {
        if (codes.length === 0) {
          return [];
        }

        const { data, error } = await client
          .from("modules")
          .select("id,code")
          .in("code", codes);

        if (error || !data) {
          return [];
        }

        return data.map((row) => ({
          id: row.id,
          code: row.code,
        }));
      },
      async updateProfile(payload) {
        const { error } = await client
          .from("profiles")
          .update({
            year: payload.year,
            degree_track: payload.degreeTrack,
          })
          .eq("id", payload.userId);

        return {
          error: error?.message ?? null,
        };
      },
      async replaceUserModules(payload) {
        const { error: deleteError } = await client
          .from("user_modules")
          .delete()
          .eq("user_id", payload.userId);

        if (deleteError) {
          return {
            error: deleteError.message,
          };
        }

        if (payload.moduleIds.length === 0) {
          return {
            error: null,
          };
        }

        const { error: insertError } = await client.from("user_modules").insert(
          payload.moduleIds.map((moduleId) => ({
            user_id: payload.userId,
            module_id: moduleId,
          })),
        );

        return {
          error: insertError?.message ?? null,
        };
      },
    },
    {
      userId: user.id,
      year,
      degreeTrack,
      moduleCodes,
    },
  );

  if (!result.ok) {
    if (result.type === "validation") {
      withError(firstError(result.errors));
    }
    withError(result.message);
  }

  redirect("/modules");
}
