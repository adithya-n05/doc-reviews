export type ValidationSuccess<T> = {
  ok: true;
  value: T;
};

export type ValidationFailure<E extends Record<string, string>> = {
  ok: false;
  errors: E;
};

export type ValidationResult<T, E extends Record<string, string>> =
  | ValidationSuccess<T>
  | ValidationFailure<E>;
