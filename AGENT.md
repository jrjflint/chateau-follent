Chateau Follent — Project Context for Agents

Project Overview
- Goal: Maintain the Chateau Follent static website, supporting prototypes and project guidance.
- Primary users: Project contributors, PMs, and future engineers.
- Non-goals: Adding payment, account or production backend capabilities to static prototypes.

Current Runtime Additions
- The static website is implemented at the repository root. The direct-link Wine Profile prototype is `wine-profile.html`, supported by isolated modules/styles in `assets/wine-profile/`.
- Wine Profile documentation: `docs/wine-profile.md`. Tests: `node --test --test-isolation=none tests/wine-profile.test.mjs` (Node 24).
- The Wine Profile is mock-only: no live lead collection, email delivery, GTM, browser persistence, accounts, or payments.
- The separate Shopify Stage 1 source is `assets/wine-profile/storefront-app.mjs`; generate the theme section and preview with `node tools/build-wine-profile-shopify.mjs`. Messaging proof assets are generated with `node tools/build-wine-profile-messaging.mjs`. Deployment status and the received-email gate are in `shopify/wine-profile/README.md`; the static prototype remains mock-only.
- `node tools/build-wine-profile-shopify.mjs --with-email` generates the separate disabled Stage 2 section and synthetic `preview-email.html`. Its entry is `assets/wine-profile/storefront-email-app.mjs`; no email controls or persistence modules load in Stage 1. Native Shopify signup/authentication and automatic sending remain unverified.
- Read-only operator review is part of the Worker and requires a signed Shopify admin ID token plus `WINE_PROFILE_REVIEWER_IDS`; the allowlist defaults empty. Run `tests/wine-profile-operations.test.mjs` with the integration tests. `node tools/build-wine-profile-operations-preview.mjs` creates a synthetic UI preview without real authentication or customer access.
- The Shopify development theme and hidden quiz page are installed; contrasting synthetic emails were received and verified. Shared Stage 2 modules are in `shopify/wine-profile/integration/` with `assets/wine-profile/login-handoff.mjs`; they are not deployed. Test them with `node --test --test-isolation=none tests/wine-profile-integration.test.mjs`. The Basic-plan restriction on custom-app Flow tasks requires a route decision recorded in the implementation guide. Keep automatic sending disabled until actual integration tests pass.

Codebase Map
- Docs: README.md (repo guidance), PRD.md (product requirements), AGENT.md (this file), CHANGELOG.md (decision/change notes), tasks/todo.md (work items).
- Entry points: Static HTML pages at the repository root.
- Tests: Wine Profile coverage in `tests/wine-profile.test.mjs`, plus browser walkthroughs.

Working Agreements
- Keep changes minimal and focused; prefer small PRs.
- Use Markdown for docs; one topic per file. Filenames in kebab-case when adding new docs.
- Commit messages: type: short summary (e.g., docs: add AGENT context).
- Style Guide: Always refer to the site author as "Lord James Follent" (full salutation) in all documentation and code comments.

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
