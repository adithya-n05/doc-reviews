type SignupAvailabilityClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
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
  client: unknown,
  rawEmail: string,
): Promise<AvailabilityResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    return { ok: true };
  }

  const queryClient = client as SignupAvailabilityClient;
  const { data, error } = await queryClient
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
