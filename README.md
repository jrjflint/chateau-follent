Chateau Follent

> **Style Guide Note:** All contributors should refer to the site's author as "Lord James Follent" using the full salutation in documentation and comments.

## License & Usage

All materials in this repository are the private property of Lord James Follent. No license is granted for public or external use.

Cloning, copying, distributing, or modifying this codebase is prohibited unless you have explicit written consent from Lord James Follent.

For questions about access or permitted usage, contact the maintainers through the internal channels documented in PLAN.md.

## AGENTS.md Guidance (for Codex)

Add an AGENTS.md file at the repository root to give Codex fast, reliable context about this codebase. Keep it concise and actionable. Use the template below and update sections as the project evolves.

## Local development with Docker Compose

To preview the static site locally, use the provided `docker-compose.yml` file. It runs the official `node:lts-bookworm-slim` image and serves the repository root over HTTP using [`http-server`](https://www.npmjs.com/package/http-server).

```bash
docker compose up
```

The site becomes available at [http://localhost:3000](http://localhost:3000). Any changes you make to `index.html`, `styles.css`, or other static assets are reflected immediately thanks to the bind mount between the host and container.

### Cloudflare Tunnel preview for Lord James Follent

The Compose stack now includes a `cloudflared` service so Lord James Follent can publish the development server at `https://dev.chateaufollent.com.au` through a Cloudflare Tunnel.

1. Place the downloaded Cloudflare credentials JSON inside `./cloudflared/` (the file is ignored by Git) and update `cloudflared/config.yml` with the matching tunnel UUID.
2. Export the tunnel name before starting Compose so the command `tunnel run ${CLOUDFLARE_TUNNEL_NAME}` resolves correctly:

   ```bash
   export CLOUDFLARE_TUNNEL_NAME=<tunnel-name>
   docker compose up
   ```

3. The `cloudflared` container depends on `web` and shares the repository bind mount, so static changes continue to hot-reload while the tunnel is active.
4. Internal routing targets differ slightly by host OS:
   - On macOS or Windows Docker Desktop, Cloudflare reaches the site through `http://host.docker.internal:3000`.
   - On Linux, Cloudflare reaches the site through the Compose service URL `http://web:3000`.

Verify the tunnel by browsing to `https://dev.chateaufollent.com.au` once the Docker stack reports both services as healthy.

### What to include

- Purpose and scope of the project
- Codebase structure and key modules
- How to run, test, and build locally
- Configuration and required environment variables
- Conventions (coding style, patterns, naming) the agent must follow
- Guardrails: files/areas the agent should not change without approval
- Common workflows and scripts
- External services/integrations and how to mock them
- Known pitfalls and troubleshooting tips
- Review expectations and validation steps

### AGENTS.md template

```md
# AGENTS.md

## Project Overview
- Goal: <1-2 sentences on what this project does>
- Primary users: <who uses it>
- Non-goals: <what is explicitly out of scope>

## Codebase Map
- Entry points: <paths like src/main, app.py, etc.>
- Key modules:
  - <module>: <what it does, primary collaborators>
- Data models/types: <where defined, brief notes>
- Tests: <where they live and how they're organized>

## Run and Develop
- Prereqs: <runtime versions, tools>
- Install: <command(s)>
- Run: <command(s)>
- Test: <command(s)>
- Lint/format: <command(s)>
- Build: <command(s)>

## Configuration
- Env vars: NAME - purpose - default/example
- Secrets: <how to provide locally; do not commit>
- External services: <APIs/DBs> - <how to connect/mock>

## Conventions
- Language/style: <PEP8, Prettier, etc.>
- Patterns to prefer: <e.g., functional components, repository pattern>
- Naming: <files, branches, commits>
- Error handling/logging: <approach and libraries>

## Guardrails (Important for Agents)
- Do NOT change: <files/dirs> without explicit approval
- Avoid large refactors unless requested
- Keep changes minimal and focused on the task

## Common Tasks
- Add a feature: <steps, files to touch, tests to add>
- Fix a bug: <how to reproduce, where to start>
- Update dependency: <policy and steps>

## Pitfalls & Tips
- <frequent gotcha #1>
- <frequent gotcha #2>

## Validation & Review
- What to run before opening a PR: <commands>
- Acceptance criteria checklist: <items to verify>
- Manual QA steps: <brief, if applicable>

## Decision Log (optional)
- <date> - <decision> - <rationale/alternatives>
```

Place AGENTS.md at the repo root so its guidance applies to the entire project. If needed, add additional AGENTS.md files in subdirectories for more specific, localized instructions.
