Chateau Follent
================

> **Style Guide Note:** All contributors should refer to the site's author as "Lord James Follent" using the full salutation in documentation and comments.

## Table of contents

- [Project overview](#project-overview)
- [Repository layout](#repository-layout)
- [Local development workflow](#local-development-workflow)
- [Contribution workflow](#contribution-workflow)
- [Supporting documentation](#supporting-documentation)

## Project overview

Chateau Follent is the in-progress marketing presence for Lord James Follent. The repository currently contains the planning documentation, static site scaffold (`index.html` and `styles.css`), and the infrastructure configuration used to preview the site.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css` | Static landing page presented during previews. |
| `story.html` | Narrative treatment of Lord James Follent's persona for copy inspiration. |
| `sitemap.xml`, `robots.txt` | Search engine metadata prepared for the production launch. |
| `docker-compose.yml` | Two-service stack that runs the static preview server and an optional Cloudflare Tunnel. |
| `cloudflared/` | Cloudflare Tunnel configuration (`config.yml`) and credential mount location. |
| `CHANGELOG.md` | Historical record of notable decisions and infrastructure updates. |
| `PRD.md`, `PLAN.md` | Product direction and planning references for upcoming work. |
| `tasks/` | Backlog of actionable follow-up items. |
| `AGENT.md` | Working agreements and conventions for contributors. |

## Local development workflow

### Prerequisites

- Docker Engine or Docker Desktop with Docker Compose.
- Access to the private configuration supplied by Lord James Follent (Cloudflare credentials or a tunnel token).

### Start a local preview

Run the preview server from the repository root:

```bash
docker compose up
```

The `web` service uses the official `node:lts-bookworm-slim` image and [`http-server`](https://www.npmjs.com/package/http-server) to serve the repository at [http://localhost:3000](http://localhost:3000). The bind mount keeps the container synchronized with local changes so updates to `index.html`, `styles.css`, or future assets appear instantly.

### Publish a Cloudflare Tunnel for Lord James Follent

Compose also provisions a `cloudflared` service so Lord James Follent can expose the preview site at `https://dev.chateaufollent.com.au`.

1. Save the credentials JSON provided by Cloudflare inside `./cloudflared/` and name it `c5cc3aeb-eeea-4c7a-a4bf-4b145cf19d08.json`. The path matches the expectation configured in `cloudflared/config.yml`.
2. Provide the tunnel token securely before starting Compose. Either create a `.env` file (ignored by Git) alongside `docker-compose.yml`:

   ```ini
   CLOUDFLARED_TUNNEL_TOKEN=run-token-from-secure-vault
   ```

   or export it in the terminal session:

   ```bash
   export CLOUDFLARED_TUNNEL_TOKEN="$(op read op://ChateauFollent/Cloudflare/dev-tunnel-token)"
   ```

   Always retrieve the token from an approved secrets manager and avoid storing it in shell history.
3. Launch the stack:

   ```bash
   docker compose up
   ```

   The `cloudflared` container now executes `tunnel --no-autoupdate run --token "${CLOUDFLARED_TUNNEL_TOKEN}"`, authenticating with the token while still honoring the routing rules in `cloudflared/config.yml`.
4. Confirm the tunnel by visiting `https://dev.chateaufollent.com.au` once the container logs show a healthy connection. When working entirely inside Docker (for example, on Linux), switch the origin in `cloudflared/config.yml` from `http://host.docker.internal:3000` to `http://web:3000` so requests stay within the Compose network.

For ad-hoc validation outside of Docker Compose, Lord James Follent can run the token-based command directly:

```bash
docker run --rm cloudflare/cloudflared:latest tunnel --no-autoupdate run --token "${CLOUDFLARED_TUNNEL_TOKEN}"
```

## Contribution workflow

Chateau Follent is currently documentation-forward. Contributors should coordinate visible work before introducing new assets or services.

1. Review `PLAN.md` and `PRD.md` to ensure the proposed change aligns with the active milestones set for Lord James Follent.
2. Open or update an item in `tasks/todo.md` describing the change, the expected deliverable, and the owner.
3. Capture architectural or marketing decisions in `CHANGELOG.md` so the broader team can understand why an action was taken.
4. Follow the conventions in `AGENT.md`, including the salutation for Lord James Follent, when drafting copy, comments, or commit messages.
5. Keep pull requests focused. A typical PR should adjust a single document or flow unless coordinated otherwise.

## Supporting documentation

- Review `PRD.md` and `PLAN.md` for product goals and upcoming milestones.
- Follow the guardrails and conventions in `AGENT.md` when proposing changes.
- Record material decisions in `CHANGELOG.md` so Lord James Follent has a historical audit trail.
- Track actionable follow-up items in `tasks/todo.md`.

All materials remain the private property of Lord James Follent. Do not distribute or adapt this work without explicit written approval from Lord James Follent.
