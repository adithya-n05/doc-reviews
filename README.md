# DoC Reviews

DoC Reviews is a student-run platform for Imperial College London Computing students to discover modules, read peer feedback, and publish structured reviews.

## Agent-First Start Here
If you are an agent (or onboarding quickly), use this map first:
1. `AGENTS.md` (local canonical map and protocol)
2. `.docs/INDEX.md` (local docs index)
3. `.docs/WORKFLOW.md` (TDD + commit policy)
4. `.docs/ARCHITECTURE.md`
5. `.docs/PLAN.md`
6. `logs/README.md` and `logs/INDEX.md`

## Project Description
The app combines a searchable module catalogue with community reviews so students can evaluate teaching quality, workload, difficulty, and assessment fairness before selecting modules.

## What It Includes
- Authentication and onboarding for student contributors.
- Searchable module catalogue with filters and ranking.
- Per-module review pages with aggregate metrics and sentiment keywords.
- Write, edit, and delete review workflows.
- Scripts to scrape and ingest module metadata into Supabase.

## Tech Stack
- Next.js + React + TypeScript
- Supabase (Auth + Database)
- Vitest + ESLint for test/lint quality gates
- Vercel deployment target

## Getting Started
```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Useful Scripts
```bash
npm run dev
npm run lint
npm test
npm run build
npm run scrape:modules
npm run ingest:modules
```

## Logging Workflow
- Run summaries: `logs/runs/*.md`
- Raw local artifacts: `logs/local-artifacts/`
- Collect Playwright artifacts:

```bash
scripts/logs/collect-playwright-artifacts.sh <run-name>
```

## Deployment
- Vercel project: `doc-reviews`
- Production URL: `https://doc-reviews-eight.vercel.app`

## Project Standards
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- License: [LICENSE](LICENSE) (MIT)
