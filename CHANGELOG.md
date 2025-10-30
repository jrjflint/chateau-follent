# Changelog

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
