import {
  validateLoginInput,
  validateSignupInput,
} from "@/lib/validation/auth";

type AuthClient = {
  auth: {
    signUp: (params: {
      email: string;
      password: string;
      options: {
        emailRedirectTo: string;
        data: {
          full_name: string;
        };
      };
    }) => Promise<{ error: { message: string } | null }>;
    signInWithPassword: (params: {
      email: string;
      password: string;
    }) => Promise<{ error: { message: string } | null }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
};

type ValidationFailure<T> = {
  ok: false;
  type: "validation";
  errors: T;
};

type AuthFailure = {
  ok: false;
  type: "auth";
  message: string;
};

type Success = {
  ok: true;
};

export async function signupWithPassword(
  client: AuthClient,
  input: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  emailRedirectTo: string,
): Promise<Success | ValidationFailure<Record<string, string | undefined>> | AuthFailure> {
  const validated = validateSignupInput(input);
  if (!validated.ok) {
    return {
      ok: false,
      type: "validation",
      errors: validated.errors,
    };
  }

  const { value } = validated;
  const { error } = await client.auth.signUp({
    email: value.email,
    password: value.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: value.fullName,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      type: "auth",
      message: error.message,
    };
  }

  return {
    ok: true,
  };
}

export async function loginWithPassword(
  client: AuthClient,
  input: {
    email: string;
    password: string;
  },
): Promise<Success | ValidationFailure<Record<string, string | undefined>> | AuthFailure> {
  const validated = validateLoginInput(input);
  if (!validated.ok) {
    return {
      ok: false,
      type: "validation",
      errors: validated.errors,
    };
  }

  const { value } = validated;
  const { error } = await client.auth.signInWithPassword({
    email: value.email,
    password: value.password,
  });

  if (error) {
    return {
      ok: false,
      type: "auth",
      message: error.message,
    };
  }

  return {
    ok: true,
  };
}

export async function signOutCurrentUser(
  client: AuthClient,
): Promise<Success | AuthFailure> {
  const { error } = await client.auth.signOut();

  if (error) {
    return {
      ok: false,
      type: "auth",
      message: error.message,
    };
  }

  return {
    ok: true,
  };
}
