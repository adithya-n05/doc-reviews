# Logs Workspace

This folder is the single place for agent/operator logs.

## Layout
- `logs/INDEX.md`: run register and quick pointers.
- `logs/AGENT-FIRST-POLICY.md`: agent setup standards adapted from OpenAI references.
- `logs/runs/`: concise run summaries (markdown).
- `logs/local-artifacts/`: raw local artifacts (Playwright snapshots/screenshots, temporary traces).

## Rules
1. Keep summaries in `logs/runs/*.md` short and decision-oriented.
2. Keep heavy/generated artifacts in `logs/local-artifacts/`.
3. Add each new run summary to `logs/INDEX.md`.
4. Never store credentials/secrets in any log file.

## Playwright Artifact Collection
Use the helper script after a browser-debug cycle:

```bash
scripts/logs/collect-playwright-artifacts.sh <run-name>
```

Example:

```bash
scripts/logs/collect-playwright-artifacts.sh 2026-02-27-auth-review-flow
```
