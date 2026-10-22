# Changelog

## 2026-10-22

### Shopify Wine Profile
- Validated Lord James Follent's four actual backend GraphQL operations and the customer metafield provisioning operations against Shopify 2026-10. Added explicit private JSON definitions and a data-lifecycle checklist covering deletion during pending email work. No provisioning mutation was executed; deployment remains deferred and sending disabled.
- Used the Cloudflare plugin's Worker/Durable Object guidance to implement authenticated read-only request review for Lord James Follent. Admin ID tokens and a server-side reviewer allowlist protect both HTTP and RPC access; returned history excludes answers, contact details and fingerprints. The screen cannot resend or unlock requests.
- Added a verified self-ID setup path so the intended operator can identify their Shopify user ID before the owner configures review access, without granting request-history access. Verified 68 local tests, native Cloudflare review RPC with zero outbound requests, generated binding/runtime types, the deployment dry run and synthetic browser review/setup states. Rechecked both dashboards and Wrangler: no app/Worker was provisioned and CLI authorization remains absent. Deployment stays deferred and sending disabled.

## 2026-10-21

### Shopify Wine Profile
- Built optional results email controls for Lord James Follent in a separate disabled Stage 2 section, with native unchecked signup, answer-only sign-in return and repeated screening. Verified synthetic browser paths, mobile layout and restart during a delayed request; all 61 local tests pass. No installation, customer/consent change, authorization, deployment or automatic sending occurred.
- Strengthened pre-dispatch read-back verification for Lord James Follent: the full saved snapshot, request metadata and profile tags must match. Nine corruption scenarios block dispatch; all 60 local tests, the actual Cloudflare runtime smoke and Wrangler dry run pass. Rebuilt the disabled bundle without deployment or authorization changes.
- Recorded Lord James Follent's decision to defer backend deployment and handle Cloudflare authorization himself. Added scoped sign-in instructions without opening authorization or deploying; the Flow-route choice remains pending and automatic sending stays disabled.
- Duplicated Story launch into unpublished Wine Profile development (`188760850606`) for Lord James Follent; installed the generated quiz section, page template and schema locale keys. Created hidden Wine Profile page (`164315136174`) without navigation or changes to the selected theme/private access.
- Verified seven questions, required-answer validation, complete red results, retained edits, changed mead recommendations and mobile results in the actual Shopify theme. Remaining integration QA is tracked in the implementation guide.
- Saved the full Messaging template (`1887861`) and separate synthetic proof template (`1887895`); verified contrasting red/white rendering in Messaging. Updated generation for the editor's comment restriction and native `open_tracking_block` token. Added reproducible synthetic proof sources. Received-email proof and automated integration remain pending; no sending or customer-data writes are enabled.
- Received contrasting red/white native test emails in the owner's Gmail inbox and matched all 20 content fields for each. Recorded immutable evidence hashes/screenshots and preserved that evidence across builds; automatic sending remains disabled. Verified actual-theme restart, underage rejection, keyboard controls, section restoration and additional profile scenarios.
- Implemented shared signed-proxy/CSRF validation, answer-only sign-in handoff, Shopify compare-and-set/tag persistence, serialised idempotent request coordination, signed HTTP routes and optional storefront client with 20 tests. Found Shopify's Plus-only restriction for custom-app Flow tasks; the proposed Basic-compatible tag trigger awaits a decision before deployment.
- Prepared a disabled Cloudflare Worker bundle, customer-scoped Durable Object wrapper, token refresh provider and deployment configuration. Twenty-four integration tests, an actual workerd/SQLite smoke test with zero outbound requests, and the Wrangler dry run pass. Both development dashboards are available, but scoped CLI authorization remains pending after automatic review rejected a login-related command; no app/backend or new access grant was created.

## 2026-10-20

### Documentation
- Added `docs/wine-profile-shopify-plan.md` and discovery tasks for Lord James Follent, covering implementation choices, a personalised-email proof, theme migration, optional customer syncing and launch checks. Platform choices remain provisional; the prototype remains mock-only.
- Tailored the Shopify plan to read-only admin observations: Basic plan, the selected Story launch theme, a Horizon draft, private storefront, Messaging/Digital Products apps, authenticated Shopify sender and the connected myshopify.com domain. No Shopify configuration was changed.

### Changed
- Standardised the brand spelling to Chateau Follent throughout the website, Wine Profile, email preview and brand guidance; removed the editorial spelling exception and redundant structured-data alias. Updated the canonical brand book to version 1.1.

### Added
- Implemented the separate Shopify Stage 1 quiz controller, generated section/page template and local preview for Lord James Follent. Added a generated full-results Shopify Messaging template, versioned tag projection, synthetic proofs and eight integration-focused local tests. Shopify deployment and received-email proof remain pending because embedded admin panels were blank; no live collection or sending was enabled.
- Added a direct-link-only `wine-profile.html` prototype for Lord James Follent, with seven-question personalisation, adult screening, independent consent, printable results and a responsive email preview.
- Added page-scoped modules, deterministic recommendation tests and `docs/wine-profile.md` covering the lead schema and future server-side Shopify/email integration. The prototype submits no details, sends no email, loads no GTM and leaves existing navigation and styles unchanged.

## 2026-03-17

### Changed
- Refocused `index.html` so the header prioritizes the crest/wordmark lockup and reordered homepage content to place the story section ahead of the waitlist panel. (#89)

## 2026-03-15

### Added
- Added new crest source files, including `master-crest.svg` and `chateau-follent-crest-canva-3color-editable.svg`, then iterated the Canva export to a filled-structure v3 variant for brand production workflows. (#85, #86, #87)

### Changed
- Refreshed `styles.css` with an updated light/dark palette tuned for label readability and contrast. (#84)
- Updated crest assets in `chateau-follent-crest-master.svg`, `chateau-follent-crest-black-no-inner.svg`, and `chateau-follent-crest-white-no-inner.svg` to align exported variants.

### Documentation
- Refined `brand-guidelines.md` with print-oriented color system guidance and revised lockup sequencing to present the brand heading before crest treatments. (#83, #88)
- Reordered lockup and brand-heading structure across `index.html`, `story.html`, `vintages.html`, and `founding-fellowship.html` to match the latest documentation direction. (#88)

## 2026-03-12

### Added
- Added a baseline monochrome crest source at `Chateau Follent Crest B&W.svg` and introduced crest-plus-wordmark header lockups across key pages (`index.html`, `story.html`, `vintages.html`, and `founding-fellowship.html`). (#78)

### Changed
- Centered stacked uppercase wordmarks and crest lockups in shared page headers by updating `styles.css` and associated templates. (#79, #80)

### Documentation
- Expanded `brand-guidelines.md` with crest-anchored vertical lockup rules and codified a two-line wordmark standard for consistent placement. (#77, #80)

## 2026-03-09

### Changed
- Updated `vintages.html` to remove outdated marketing-links copy from the vintages page. (#74)

### Fixed
- Corrected the rosé yeast listing to `Enoferm Syrah` in `vintages.html`. (#73)

### Documentation
- Removed the lingering bottling placeholder from the merlot blend entry in `vintages.html`. (#72)

## 2026-03-06

### Documentation
- Refreshed `tasks/todo.md` to mark baseline GTM page-view instrumentation as complete and replaced stale implementation notes with an analytics QA follow-up checklist for Lord James Follent.

## 2025-10-20

### Added
- Introduced a Docker Compose service for local static-site previews using `node:lts-bookworm-slim` and `http-server`, exposing the site at http://localhost:3000. (#1)
- Created the initial static site scaffold (`index.html` and `styles.css`) with welcoming hero content for development previews.

### Documentation
- Added `AGENT.md` to capture contributor guardrails and established `tasks/todo.md` for backlog planning.
- Updated `README.md` with instructions for running the Docker-based preview workflow.

### Changed
- Refined global styling by importing Libre Baskerville and Montserrat web fonts to align with Chateau Follent branding.

## 2025-10-21

### Fixed
- Updated the Docker Compose bind mount to remove the macOS-specific `delegated` flag so the preview workflow works on Linux hosts.

### Changed
- Adjusted the `cloudflared` service command to accept the `CLOUDFLARED_TUNNEL_TOKEN` environment variable, enabling token-based authentication without editing the Compose file. (#19)

### Documentation
- Clarified Cloudflare credential and token setup in `README.md`, reorganizing the guide around the current repository layout and preview workflows.
- Documented the token workflow for Cloudflare Tunnels so Lord James Follent can authenticate from Docker Compose or standalone commands. (#16, #19)

## 2025-10-22

### Documentation
- Merged the Google Analytics and GTM roadmap into `PLAN.md`, adding objectives, milestones, and compliance checkpoints for Lord James Follent.
- Updated `README.md` to point contributors to the consolidated analytics plan and removed the superseded `google-analytics-plan.md` document.

## 2025-10-23

### Security
- Purged previously committed Cloudflared tunnel identifiers, documented the rotation process, and shifted credential management to environment variables so Lord James Follent's preview tunnel stays confidential.
- Added a security policy and disclosure touchpoints, including the `SECURITY.md` and `security.txt` files, to guide vulnerability reports for Lord James Follent.
- Expanded repository hygiene with new ignore patterns and a third-party script register to track analytics dependencies and consent requirements.

## 2025-10-30

### Added
- Published a dedicated social sharing asset (`assets/share/ChateauFollent.png`) so Lord James Follent can control preview imagery across channels.
- Introduced a site favicon to reinforce Chateau Follent branding in browser tabs.

### Fixed
- Hardened the waitlist modal by enforcing inert states outside the dialog, extending the focus trap, and ensuring the overlay hides correctly when closed.
- Deferred loading of the Fillout embed script until the waitlist overlay opens, preventing duplicate script injections while keeping the call to Lord James Follent's audience responsive.
