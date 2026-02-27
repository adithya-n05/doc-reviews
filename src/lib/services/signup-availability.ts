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
  auth: {
    admin: {
      getUserById: (id: string) => Promise<{
        data: {
          user: {
            email_confirmed_at?: string | null;
          } | null;
        };
        error: { message: string } | null;
      }>;
    };
  };
};

type AvailabilityResult =
  | { ok: true }
  | {
      ok: false;
      status: "verified" | "unverified" | "unknown";
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
      status: "unknown",
      message: "Unable to verify account status right now. Please try again.",
    };
  }

  if (data) {
    const userLookup = await queryClient.auth.admin.getUserById(data.id);
    if (userLookup.error || !userLookup.data.user) {
      return {
        ok: false,
        status: "unknown",
        message: "Unable to verify account status right now. Please try again.",
      };
    }

    if (!userLookup.data.user.email_confirmed_at) {
      return {
        ok: false,
        status: "unverified",
        message: "This Imperial email has an account that is not verified yet.",
      };
    }

    return {
      ok: false,
      status: "verified",
      message: "An account with this Imperial email already exists. Please sign in instead.",
    };
  }

  return { ok: true };
}
