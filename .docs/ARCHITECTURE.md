# Architecture (Active)

## 1) Product Goal
A module review website for Imperial Computing students where users:
1. Sign up with Imperial email + password.
2. Verify email ownership before account activation.
3. Select year and modules from a curated list.
4. Browse module details (including leaders) and review content.
5. Submit reviews with identity always visible (full name + email).
6. Edit and delete their own reviews.

## 2) Chosen Stack
- Frontend/Full-stack framework: Next.js (App Router)
- Language: TypeScript
- Auth + DB + storage: Supabase (Postgres + Auth)
- Deployment: Vercel
- Email delivery for verification: Supabase Auth email provider setup

## 3) Why This Stack
1. Single codebase for UI + server routes.
2. Managed authentication and database reduce MVP complexity.
3. Vercel deployment aligns naturally with Next.js.
4. Easy to evolve from MVP to production-hardening.

## 4) High-Level Components
1. Web App (Next.js): pages, forms, module browsing, review UI.
2. Supabase Auth: signup/login, verified-user session handling.
3. Supabase Postgres: modules, profiles, user selections, reviews.
4. Setup-time ingestion scripts: manual scrape + seed process.

## 5) UX and Visual Direction
1. Use `.mockups/mockup-editorial.html` as the structural and style baseline.
2. Keep the editorial composition and typography.
3. Replace purple accents with Imperial blue palette tones (e.g. `#002147`, `#003E74`, `#006EAF`, `#0098DA`).

## 6) Data Model (Initial)
- `profiles`
  - `id` (auth user id, pk)
  - `full_name`
  - `email`
  - `year`
  - `degree_track` (e.g. BEng, MEng, MEng specialism)
  - `created_at`

- `modules`
  - `id` (uuid pk)
  - `code` (unique)
  - `title`
  - `description`
  - `module_leaders` (text array or relation table)
  - `source_url`
  - `created_at`

- `module_offerings`
  - `id` (uuid pk)
  - `module_id` (fk)
  - `academic_year_label`
  - `study_year` (1..4)
  - `term` (autumn/spring/summer/multi)
  - `offering_type` (core/compulsory/elective/selective/extracurricular)
  - `degree_path`

- `user_modules`
  - `id` (uuid pk)
  - `user_id` (fk)
  - `module_id` (fk)
  - unique (`user_id`, `module_id`)

- `reviews`
  - `id` (uuid pk)
  - `module_id` (fk)
  - `user_id` (fk)
  - `teaching_rating` (1..5)
  - `workload_rating` (1..5)
  - `difficulty_rating` (1..5)
  - `assessment_rating` (1..5)
  - `comment`
  - `created_at`

## 7) Authentication and Verification
1. Client validates email domain at signup (`ic.ac.uk` or `imperial.ac.uk`).
2. Server repeats validation before creating account (authoritative check).
3. Supabase Auth handles email confirmation flow.
4. Only verified users can create/edit/delete reviews.

## 8) Route Shape (Planned)
- `/` landing
- `/auth/signup`
- `/auth/login`
- `/auth/verify` (email confirmation callback)
- `/onboarding` (year + module selection)
- `/modules`
- `/modules/[code]`
- `/profile`

## 9) Security Baseline
1. Enforce server-side domain checks, never client-only.
2. Add Postgres RLS policies for profile and review writes.
3. Restrict review writes/edits/deletes to authenticated + verified owners.
4. Sanitize/escape comment rendering.

## 10) Ingestion Strategy
No scheduler initially. Module ingestion is manual at setup points:
1. Run scraper script locally.
2. Validate generated JSON.
3. Seed/update database from JSON.
4. Re-run only when curriculum changes are needed.

## 11) Explicit Product Decisions
1. Reviewer identity is always public on each review: name + email.
2. Anonymous reviews are not supported.
3. Admin moderation is not part of MVP.
4. Abuse-protection systems are intentionally out of scope for MVP.
5. Year 4 includes all MEng specialism modules.
