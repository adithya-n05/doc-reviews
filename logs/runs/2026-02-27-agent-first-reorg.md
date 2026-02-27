# 2026-02-27 Agent-First Logging Reorg

## Goal
Create a clean, repeatable logs system for fast zero-context agent handoff.

## Changes
1. Added canonical log docs: `logs/README.md`, `logs/INDEX.md`, `logs/AGENT-FIRST-POLICY.md`.
2. Added `scripts/logs/collect-playwright-artifacts.sh` for deterministic Playwright artifact collection.
3. Moved ad-hoc browser logs from repo root into `logs/local-artifacts/`.

## Operational Outcome
- Logs are now split into:
  - concise human/agent summaries (`logs/runs/*.md`),
  - raw generated artifacts (`logs/local-artifacts/`).
- Root directory noise from temporary browser artifacts is removed.
