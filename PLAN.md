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

## Public Site Launch Plan

### Objectives
- Connect `chateaufollent.com.au` and `www.chateaufollent.com.au` to the GitHub repository via Cloudflare-managed DNS.
- Provide secure HTTPS access with consistent canonical routing between apex and www hosts.
- Publish search-friendly metadata (robots.txt, sitemap) alongside the static site.
- Establish Cloudflare performance, monitoring, and deployment practices for ongoing maintenance.

### DNS and Hosting Linkage
- Decide on the hosting flow (e.g., GitHub Pages served through Cloudflare) and ensure the registrar delegates to Cloudflare nameservers.
- In Cloudflare DNS, add proxied A records for the apex pointing to GitHub Pages IPs (185.199.108.153/154/155/156) and a proxied CNAME for `www` pointing to the GitHub Pages hostname (e.g., `<username>.github.io`).
- Update GitHub Pages settings for the repo to include both custom domains so GitHub issues certificates and handles redirects appropriately.

### HTTPS and Canonical Routing
- Set Cloudflare SSL/TLS mode to **Full** (or **Full (strict)** when GitHub certificates are trusted).
- Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites** within Cloudflare.
- Choose the canonical hostname (apex or www) and add a Cloudflare Page Rule (or GitHub redirect) to funnel traffic from the non-canonical host with a 301 redirect.

### Site Discovery and Bots
- Add `/robots.txt` to the repo allowing crawling and referencing the sitemap location.
- Generate `/sitemap.xml` enumerating the primary public URLs; commit both files to ensure GitHub Pages serves them once published.
- After launch, submit the sitemap to Google Search Console and Bing Webmaster Tools.

### Performance and Caching
- Enable Cloudflare performance features such as Brotli compression and Auto Minify (HTML/CSS/JS).
- Confirm the cache level is set to **Standard**; consider cache rules for longer-lived static assets if needed.
- Document a cache-busting/versioning strategy (e.g., query-string versioning) for static assets as the site grows.

### Monitoring and Maintenance
- Turn on Cloudflare analytics alerts and optionally integrate uptime monitoring services.
- Decide on the deployment workflow (manual GitHub Pages publish vs. automated CI) and document it in the repo for contributors.
- Record rollback procedures (e.g., revert commits, adjust DNS) so the team can respond quickly to issues.
- Verify domain ownership through Google Search Console or similar tools and evaluate legal/compliance requirements (privacy policy, cookie notices) based on future site features.
