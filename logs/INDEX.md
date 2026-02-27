# Logs Index

## Current Focus
- Stabilize and verify full auth/onboarding/module-review flow.
- Keep visual parity against `.mockups/mockup-editorial.html` with Imperial-blue theme.

## Runs
- `2026-02-27-agent-first-reorg.md`: logging architecture setup and policy baseline.

## Quick Commands
```bash
# Create a new run summary
cp logs/runs/2026-02-27-agent-first-reorg.md logs/runs/<date>-<topic>.md

# Collect local Playwright artifacts into logs/local-artifacts/<run-name>/
scripts/logs/collect-playwright-artifacts.sh <run-name>

# Inspect recent run summaries
ls -1 logs/runs
```
