# Agent-First Policy Baseline

This repository uses an agent-first layout optimized for zero-context startup.

## Principles
1. Single-source instructions: keep one canonical workflow policy and one canonical plan.
2. Mechanical quality gates: enforce lint/test/build checks in CI, not by memory.
3. Explicit run logs: track each significant run as a small summary plus artifact path.
4. Deterministic operations: use scripted commands for repeated workflows.
5. Progressive context loading: read index -> workflow -> architecture -> plan before edits.

## Source Alignment (OpenAI)
These principles are derived from OpenAI's guidance on codex/harness engineering and agent workflows:
- https://developers.openai.com/codex/harness-engineering
- https://platform.openai.com/docs/guides/agents
- https://platform.openai.com/docs/guides/agents-sdk

## Repository Conventions
1. Run summaries live in `logs/runs/*.md`.
2. Heavy artifacts live in `logs/local-artifacts/`.
3. Every feature slice should be traceable by:
   - failing test,
   - minimal fix,
   - passing tests,
   - commit hash.
