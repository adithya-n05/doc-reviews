# Implementation Plan (Active)

## Execution Constraints (Mandatory)
1. Strict TDD for each feature slice: `red -> green -> refactor`.
2. Atomic commits after each completed feature slice.
3. Very thorough tests including edge cases and permission boundaries.

## Objective
Deliver MVP for Imperial Computing module reviews using Next.js + TypeScript + Supabase, with mandatory Imperial email verification, visible reviewer identity (name + email), and owner edit/delete review controls.

## Phase 0: Foundation and Repo Setup
### Tasks
1. Bootstrap Next.js TypeScript app.
2. Configure linting, formatting, and environment variable handling.
3. Add Supabase client/server helpers.
4. Create initial doc-linked folder structure for scripts and db migrations.

### Acceptance Criteria
1. App runs locally.
2. Supabase connectivity works from both server and client contexts.
3. `.docs` references updated for actual created paths.
4. Baseline test harness is configured.

## Phase 1: Database and Auth
### Tasks
1. Create Supabase schema for `profiles`, `modules`, `module_offerings`, `user_modules`, `reviews`.
2. Enable RLS and write baseline policies.
3. Implement signup/login with email + password.
4. Enforce Imperial domain checks server-side and client-side.
5. Wire email verification and verified-user gating.

### Acceptance Criteria
1. Non-Imperial domains cannot register.
2. Unverified accounts cannot submit/edit/delete reviews.
3. Verified user can login and access protected pages.

## Phase 2: Onboarding and Module Selection
### Tasks
1. Build onboarding page collecting year and module selections.
2. Provide searchable module selector by year.
3. Persist selections in `user_modules`.

### Acceptance Criteria
1. User can save year and selected modules.
2. Modules shown to user are filtered by year path logic.

## Phase 3: Manual Module Data Ingestion Pipeline
### Tasks
1. Build one-off scrape script for Imperial module sources.
2. Parse module code/title/offering metadata.
3. Enrich with module description and leaders from module detail pages.
4. Output normalized JSON in versioned format.
5. Build seed/upsert script to load JSON into Supabase.

### Acceptance Criteria
1. Script produces stable JSON output.
2. Seed script is idempotent for repeated runs.
3. Year 4 includes all MEng specialism modules.

## Phase 4: Core Product UI
### Tasks
1. Build landing and auth pages.
2. Build module list view with filters/search.
3. Build module detail page with leaders + metrics + reviews.
4. Build review submission + edit + delete flow.
5. Implement editorial style from `.mockups/mockup-editorial.html` using Imperial blue accents.

### Acceptance Criteria
1. Mobile + desktop layouts are usable.
2. Module detail page shows leaders and aggregate metrics.
3. Logged-in verified users can submit, edit, and delete their own reviews.
4. Reviews display reviewer name and email publicly.

## Phase 5: Metrics and Derived Insights
### Tasks
1. Add average rating aggregates per module.
2. Add derived keyword/sentiment summary from comments.
3. Display “most-mentioned” insights on module pages.

### Acceptance Criteria
1. Metrics update after new review submission.
2. Derived summaries are visible and understandable.

## Phase 6: Deployment and Production Readiness
### Tasks
1. Configure Vercel project/env vars.
2. Connect production Supabase project.
3. Validate auth callback URLs.
4. Add basic error pages and logging.

### Acceptance Criteria
1. Production deployment accessible.
2. Signup/login/review end-to-end flow works in production.

## Scope Locks
1. No anonymous review mode.
2. No moderation queue.
3. No abuse-protection subsystem in MVP.

## Definition of MVP Done
1. Verified Imperial student can register/login.
2. Student can set year and modules.
3. Student can browse modules and see leaders/reviews/metrics.
4. Student can submit/edit/delete identifiable reviews.
5. Reviews always display reviewer name and email.
6. App is deployed on Vercel with Supabase backing services.
