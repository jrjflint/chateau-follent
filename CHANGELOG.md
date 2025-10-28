# Changelog

## 2025-10-22

### Documentation
- Expanded the public launch plan with explicit Cloudflare DNS steps so Lord James Follent can add the GitHub Pages A records for `chateaufollent.com.au`.

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
