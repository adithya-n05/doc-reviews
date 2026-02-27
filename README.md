# DoC Reviews

Imperial Computing module review platform built with Next.js + TypeScript + Supabase and deployed on Vercel.

## Agent-First Start Here
1. `AGENTS.md` (local canonical map and protocol)
2. `.docs/INDEX.md` (local docs index)
3. `.docs/WORKFLOW.md` (TDD + commit policy)
4. `.docs/ARCHITECTURE.md`
5. `.docs/PLAN.md`
6. `logs/README.md` and `logs/INDEX.md`

## Local Setup
```bash
npm install
cp .env.local.example .env.local # or create manually
npm run dev
```

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Quality Gates
```bash
npm run lint
npm test
npm run build
```

CI runs on push/PR via `.github/workflows/ci.yml`.

## Data Pipeline
```bash
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
