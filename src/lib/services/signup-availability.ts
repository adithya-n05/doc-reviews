type SignupAvailabilityClient = {
  from: (table: "profiles") => {
    select: (columns: "id") => {
      eq: (column: "email", value: string) => {
        maybeSingle: () => Promise<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

type AvailabilityResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function checkSignupEmailAvailability(
  client: SignupAvailabilityClient,
  rawEmail: string,
): Promise<AvailabilityResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    return { ok: true };
  }

  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "Unable to verify account status right now. Please try again.",
    };
  }

  if (data) {
    return {
      ok: false,
      message: "An account with this Imperial email already exists. Please sign in instead.",
    };
  }

  return { ok: true };
}
