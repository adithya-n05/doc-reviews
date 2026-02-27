"use server";

import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/server/auth-context";
import { validateProfileAvatarUrl } from "@/lib/validation/profile-avatar";

function withError(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`);
}

export async function updateProfilePhotoAction(formData: FormData): Promise<never> {
  const avatarUrl = String(formData.get("avatarUrl") ?? "");
  const validation = validateProfileAvatarUrl(avatarUrl);
  if (!validation.ok) {
    withError(validation.errors.avatarUrl ?? "Invalid profile photo URL.");
  }

  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const { error } = await client
    .from("profiles")
    .update({ avatar_url: validation.value })
    .eq("id", user.id);

  if (error) {
    withError("Unable to update profile photo right now.");
  }

  redirect("/profile?photo=updated");
}

export async function clearProfilePhotoAction(): Promise<never> {
  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const { error } = await client
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    withError("Unable to remove profile photo right now.");
  }

  redirect("/profile?photo=removed");
}
