import { isImperialEmail } from "@/lib/email-domain";
import type { ValidationResult } from "./types";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignupOutput = {
  fullName: string;
  email: string;
  password: string;
};

type SignupErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type LoginOutput = {
  email: string;
  password: string;
};

type LoginErrors = {
  email?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignupInput(
  input: SignupInput,
): ValidationResult<SignupOutput, SignupErrors> {
  const errors: SignupErrors = {};
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (!isImperialEmail(email)) {
    errors.email = "Please use your Imperial email address (@ic.ac.uk or @imperial.ac.uk).";
  }

  if (input.password.length < 10) {
    errors.password = "Password must be at least 10 characters.";
  }

  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords must match.";
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
      fullName,
      email,
      password: input.password,
    },
  };
}

export function validateLoginInput(
  input: LoginInput,
): ValidationResult<LoginOutput, LoginErrors> {
  const errors: LoginErrors = {};
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
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
      email,
      password: input.password,
    },
  };
}
