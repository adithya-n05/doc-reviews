"use server";

import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/server/auth-context";
import { validateProfileAvatarFile } from "@/lib/validation/profile-avatar-file";

function withError(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`);
}

export async function updateProfilePhotoAction(formData: FormData): Promise<never> {
  const validation = validateProfileAvatarFile(formData.get("avatarFile"));
  if (!validation.ok) {
    withError(validation.error);
  }

  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const uploadPath = `${user.id}/${crypto.randomUUID()}.${validation.extension}`;
  const uploadResult = await client.storage.from("profile-avatars").upload(uploadPath, validation.file, {
    contentType: validation.contentType,
    upsert: true,
  });
  if (uploadResult.error) {
    withError("Unable to upload profile photo right now.");
  }

  const { data: publicUrlData } = client.storage.from("profile-avatars").getPublicUrl(uploadPath);
  const { error } = await client
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
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

export async function updateDisplayNameAction(formData: FormData): Promise<never> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (fullName.length < 2 || fullName.length > 80) {
    withError("Display name must be between 2 and 80 characters.");
  }

  const { client, user } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const { error } = await client
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) {
    withError("Unable to update display name right now.");
  }

  await client.auth.updateUser({
    data: {
      full_name: fullName,
    },
  });

  redirect("/profile?name=updated");
}

export async function updatePasswordAction(formData: FormData): Promise<never> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    withError("Password must be at least 8 characters.");
  }

  if (newPassword !== confirmPassword) {
    withError("Password confirmation does not match.");
  }

  const { client } = await requireUserContext({
    requireVerified: true,
    requireOnboarded: true,
  });

  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    withError(error.message || "Unable to update password right now.");
  }

  redirect("/profile?password=updated");
}
