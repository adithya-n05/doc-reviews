type UserAuthState = {
  email_confirmed_at: string | null;
} | null;

type ProfileState = {
  year: number | null;
  degree_track: string | null;
} | null;

export function isEmailVerified(user: UserAuthState): boolean {
  return Boolean(user?.email_confirmed_at);
}

export function needsOnboarding(profile: ProfileState): boolean {
  if (!profile) return true;
  if (!profile.year) return true;
  if (!profile.degree_track || profile.degree_track.trim().length === 0) return true;
  return false;
}

export function canManageReviews(
  user: UserAuthState,
  profile: ProfileState,
): boolean {
  return isEmailVerified(user) && !needsOnboarding(profile);
}
