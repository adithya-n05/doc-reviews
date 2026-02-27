# Documentation Index

This folder is the canonical knowledge base for the project.

## Read Order (Agent-Friendly)
1. `AGENTS.md` (repo map + update protocol)
2. `.docs/INDEX.md` (this file)
3. `.docs/WORKFLOW.md` (mandatory engineering policy)
4. `.docs/ARCHITECTURE.md` (system design and decisions)
5. `.docs/PLAN.md` (implementation sequence)
6. `.docs/runbooks/*` (operational tasks)

## Documents
- `WORKFLOW.md`: Mandatory TDD, commit, and test rigor policy.
- `ARCHITECTURE.md`: Target architecture for Next.js + Supabase + Vercel.
- `PLAN.md`: End-to-end implementation plan with phases and acceptance criteria.
- `runbooks/manual-module-ingest.md`: Manual ingestion process for module data (setup-time scraping).
- `adr/README.md`: ADR convention for new key decisions.

## Status Model
- `Draft`: doc exists but may change during implementation.
- `Active`: doc should be treated as source of truth.
- `Deprecated`: retained only for history.

### Current Status
- `WORKFLOW.md`: Active
- `ARCHITECTURE.md`: Active
- `PLAN.md`: Active
- `runbooks/manual-module-ingest.md`: Draft
- `adr/README.md`: Active

## Documentation Hygiene Rules
1. Any new major file/folder must be reflected in `AGENTS.md` tree.
2. Any new design/implementation decision must be linked from this index.
3. Any plan/scope change must update `PLAN.md`.
4. Any workflow change must update `WORKFLOW.md`.

## Search Shortcuts
```bash
rg -n "TODO|TBD|FIXME" .docs
rg -n "Phase|Milestone|Acceptance" .docs/PLAN.md
rg -n "TDD|atomic|red|green|refactor" .docs/WORKFLOW.md
rg -n "auth|supabase|review|module" .docs
```
