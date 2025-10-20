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
