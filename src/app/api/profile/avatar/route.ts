import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateProfileAvatarFile } from "@/lib/validation/profile-avatar-file";

export async function POST(request: Request) {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const validation = validateProfileAvatarFile(formData.get("avatarFile"));
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const uploadPath = `${user.id}/${crypto.randomUUID()}.${validation.extension}`;
  const uploadResult = await client.storage.from("profile-avatars").upload(uploadPath, validation.file, {
    contentType: validation.contentType,
    upsert: true,
  });
  if (uploadResult.error) {
    return NextResponse.json(
      { error: uploadResult.error.message || "Unable to upload profile photo." },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = client.storage.from("profile-avatars").getPublicUrl(uploadPath);
  const { error } = await client
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to update profile photo." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    avatarUrl: publicUrlData.publicUrl,
  });
}

export async function DELETE() {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { error } = await client
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to remove profile photo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
