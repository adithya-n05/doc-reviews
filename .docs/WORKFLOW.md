# Engineering Workflow Policy (Active)

This file defines mandatory implementation rules for all agents and contributors working in this repository.

## 1) Core Delivery Contract
1. Use strict TDD for feature work.
2. Use atomic commits after each completed feature slice.
3. Maintain very high test coverage for behavior and edge cases.
4. Keep changes small, reviewable, and reversible.

## 2) Mandatory TDD Loop (Red -> Green -> Refactor)
For each feature slice:
1. Write a test first.
2. Run tests and verify the new test fails for the expected reason.
3. Implement the minimal code required to pass.
4. Re-run tests and verify pass.
5. Refactor if needed without changing behavior.
6. Re-run full relevant test suite.
7. Commit atomically.

## 3) Test Thoroughness Requirements
At minimum, each feature must include tests for:
1. Happy path behavior.
2. Validation failures.
3. Permission/auth failures.
4. Boundary values and empty inputs.
5. Non-trivial edge cases specific to the feature.
6. Regression cases for bugs fixed during implementation.

## 4) Commit Policy
1. One logical change per commit.
2. Commit message format:
   - `feat: ...`
   - `fix: ...`
   - `test: ...`
   - `refactor: ...`
3. Every commit must leave tests passing.
4. Never batch unrelated features into one commit.

## 5) Minimum Per-Commit Checklist
1. New/updated tests exist for changed behavior.
2. Targeted tests pass.
3. No unrelated files are modified.
4. Documentation updated if contracts/routes/schema changed.

## 6) Project-Specific Locks
1. Reviewer identity is public by product decision (name + email).
2. Anonymous reviews are not allowed.
3. Review owners can edit and delete their own reviews.
4. No moderation queue in MVP.
5. No abuse-protection subsystem in MVP.

## 7) Repo Hygiene for Agents
1. Update `AGENTS.md` tree when structure changes.
2. Update `.docs/INDEX.md` status/index when docs change.
3. Keep `.docs/PLAN.md` in sync with actual execution.

## 8) Definition of Ready for Implementation
Feature work should only begin when:
1. Acceptance criteria are written.
2. Expected test cases are listed.
3. Data and API contracts are clear.

## 9) Definition of Done per Feature Slice
1. Tests added and passing.
2. Feature behavior matches acceptance criteria.
3. Atomic commit created.
4. Relevant docs updated.
