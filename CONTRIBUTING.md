# Contributing to DoC Reviews

Thanks for contributing.

## Before You Start
- Check existing issues/PRs before opening new work.
- For major changes, open an issue first to align on scope.

## Local Development
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

## Quality Checklist
Run these before opening a pull request:
```bash
npm run lint
npm test
npm run build
```

## Pull Request Guidelines
- Keep PRs focused and small where possible.
- Include a clear summary of what changed and why.
- Add or update tests for behavior changes.
- Update docs if setup, workflows, or APIs changed.
- Link the related issue (if applicable).

## Code Standards
- Use TypeScript and keep strict typing where practical.
- Follow existing project patterns and file structure.
- Prefer readable, maintainable code over clever shortcuts.

## Reporting Bugs
When reporting a bug, include:
- Expected vs actual behavior
- Steps to reproduce
- Relevant logs/screenshots
- Local environment details (OS, Node version, browser)
