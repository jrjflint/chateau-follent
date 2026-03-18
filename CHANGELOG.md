# Changelog

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
