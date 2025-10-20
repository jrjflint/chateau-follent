Chateau Follent — Project Context for Agents

Project Overview
- Goal: Establish a clear foundation for the Chateau Follent project. The repo currently houses planning and guidance docs; application code has not been added yet.
- Primary users: Project contributors, PMs, and future engineers.
- Non-goals: Shipping application runtime code in this phase.

Codebase Map
- Docs: README.md (repo guidance), PRD.md (product requirements), AGENT.md (this file), CHANGELOG.md (decision/change notes), tasks/todo.md (work items).
- Entry points: None yet (no app code present).
- Tests: None yet.

Working Agreements
- Keep changes minimal and focused; prefer small PRs.
- Use Markdown for docs; one topic per file. Filenames in kebab-case when adding new docs.
- Commit messages: type: short summary (e.g., docs: add AGENT context).

Guardrails
- Do not remove or significantly rewrite PRD.md, README.md, or AGENT.md without explicit approval.
- Avoid adding dependencies or build tooling until the technical stack is defined in the PRD.
- Prefer creating tasks in tasks/todo.md instead of speculative code scaffolding.

Common Tasks
- Update PRD: refine scope, goals, and acceptance criteria.
- Record decisions: append brief entries to CHANGELOG.md with date and rationale.
- Plan work: add actionable items to tasks/todo.md with owners and priority.

Validation & Review
- Ensure docs are consistent, linked where relevant, and free of placeholders.
- Keep AGENT.md in sync when structure or conventions change.
