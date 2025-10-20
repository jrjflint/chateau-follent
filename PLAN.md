# Cloudflared Tunnel Plan

## Objectives
- Expose the existing Docker-based development server on port 3000 through `https://dev.chateaufollent.com.au`.
- Require Cloudflare Zero Trust (Access) authentication before anyone can reach the tunnelled environment.
- Reuse the current `docker-compose.yml` stack so local previews and the tunnel run together.

## Prerequisites
1. Cloudflare account with Zero Trust enabled for the `chateaufollent.com.au` zone.
2. Cloudflared tunnel created in the Cloudflare dashboard or via `cloudflared tunnel create <name>`.
   - Download the generated credentials file (e.g., `<tunnel-uuid>.json`).
3. At least one Access policy (e.g., email domain allow list, GitHub/G Suite IdP) configured for `dev.chateaufollent.com.au` in Cloudflare Zero Trust.

## Docker Compose Updates
1. Add a `cloudflared` service to the existing `docker-compose.yml` alongside the `web` service.
   - Image: `cloudflare/cloudflared:latest`.
   - Command: `tunnel run <tunnel-name>`.
   - Volumes:
     - Mount `./cloudflared:/etc/cloudflared` to persist credentials and config.
   - Depends on: `web` (so the tunnel waits until the local server is ready).
   - Restart policy: `unless-stopped`.
2. Ensure the shared bind mount keeps the repo available to the container so static assets remain live.
3. Keep port 3000 published by the `web` service; `cloudflared` will route traffic internally via `host.docker.internal:3000` (on macOS/Windows) or `http://web:3000` (Linux).

## Cloudflared Configuration (`cloudflared/config.yml`)
1. Set tunnel metadata:
   ```yaml
   tunnel: <tunnel-uuid>
   credentials-file: /etc/cloudflared/<tunnel-uuid>.json
   ```
2. Define ingress to forward HTTPS requests to the development server:
   ```yaml
   ingress:
     - hostname: dev.chateaufollent.com.au
       service: http://web:3000
     - service: http_status:404
   ```
   - Cloudflare terminates TLS for visitors. If you prefer end-to-end TLS, swap the service to `https://web:3000` and configure local certificates, then set `originRequest.noTLSVerify: true` if using self-signed certs.
3. (Optional) Add logging/metrics flags via environment variables or command override if observability is required.

## Cloudflare Zero Trust Access Enforcement
1. In the Zero Trust dashboard, navigate to **Access → Applications → Add an application → Self-hosted**.
2. Set the application domain to `https://dev.chateaufollent.com.au` and tie it to the tunnel.
3. Attach the authentication policy created in prerequisites step 3 (e.g., allow specific emails, groups, or IdP).
4. Enable the **Service Auth** integration with the tunnel by adding the following to `config.yml` if using signed JWTs:
   ```yaml
   ingress:
     - hostname: dev.chateaufollent.com.au
       service: http://web:3000
       originRequest:
         access:
           audTag: [<access-aud-tag>]
     - service: http_status:404
   ```
   - Replace `<access-aud-tag>` with the Application Audience tag shown in the Access app.
5. Test by visiting the hostname; Cloudflare should prompt for the configured IdP login before forwarding traffic to the local server.

## DNS and Routing
1. Run `cloudflared tunnel route dns <tunnel-name> dev.chateaufollent.com.au` or add a CNAME record manually from `dev.chateaufollent.com.au` to `<tunnel-uuid>.cfargotunnel.com`.
2. Verify the CNAME exists and propagates before sharing the URL with testers.

## Operational Notes
- Keep the `cloudflared` credentials file out of version control. Add `cloudflared/*.json` to `.gitignore` if not present.
- To start the environment: `docker compose up --build` (or `docker compose up cloudflared` once the web service is running).
- The tunnel stops when the container stops; consider running `docker compose up -d` for persistent previews.
- Monitor Access logs in the Zero Trust dashboard to audit who connects to the dev environment.
