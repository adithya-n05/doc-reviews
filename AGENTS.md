# AGENTS.md

Agent-first repository map and working protocol for `ic-module-reviews`.

## 1) Purpose
This file is the canonical navigation entrypoint for agents and contributors.
Use it to quickly locate docs, understand repository intent, and follow required update hygiene.

## 2) Required Update Protocol
When you add, remove, or move files, you must update **both**:
1. `AGENTS.md` repository tree snapshot.
2. `.docs/INDEX.md` document index and status.

Also update `.docs/PLAN.md` if scope, sequencing, or milestones changed.

## 3) Required Read Order (Agent-First)
1. `AGENTS.md`
2. `.docs/INDEX.md`
3. `.docs/WORKFLOW.md` (mandatory engineering policy)
4. `.docs/ARCHITECTURE.md`
5. `.docs/PLAN.md`

## 4) Repository Tree (Current Snapshot)

```text
.
├── .docs/
│   ├── INDEX.md
│   ├── WORKFLOW.md
│   ├── ARCHITECTURE.md
│   ├── PLAN.md
│   ├── adr/
│   │   └── README.md
│   ├── runbooks/
│   │   └── manual-module-ingest.md
│   └── specs/
├── .mockups/
│   ├── mockup.html
│   ├── mockup-editorial.html
│   ├── mockup-warm.html
│   └── mockup-brutalist.html
├── site/
│   └── (Next.js scaffold, in progress)
└── AGENTS.md
```

## 5) Fast Navigation
- Documentation index: `.docs/INDEX.md`
- Engineering policy: `.docs/WORKFLOW.md`
- System architecture: `.docs/ARCHITECTURE.md`
- Implementation plan: `.docs/PLAN.md`
- Operational runbooks: `.docs/runbooks/`

## 6) Tree Refresh Command
Run this after structural changes and copy the updated tree into this file:

```bash
find . -maxdepth 4 \
  | sed 's#^\./##' \
  | sed '1d' \
  | grep -v '^\.git' \
  | sort
```

## 7) Agent Workflow Expectations
1. Follow `.docs/WORKFLOW.md` strictly.
2. Use TDD loop (`red -> green -> refactor`) for feature slices.
3. Commit atomically per completed feature slice.
4. Keep `.docs/PLAN.md` aligned with actual implementation order.
5. If adding design/API decisions, place docs under `.docs/specs/` or `.docs/adr/` and link them in `.docs/INDEX.md`.
