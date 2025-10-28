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

## Security Hardening Actions
- Rotate any previously published tunnel UUIDs, treat them as compromised, and document the regeneration steps so contributors never reuse retired identifiers.
- Replace live tunnel identifiers and credential filenames in version-controlled files with placeholders, pairing them with clearly documented sample configs kept outside the main repo.
- Reference sensitive Cloudflared assets via environment variables or Compose `env_file` entries so the production credential filenames are never committed.
- Expand `.gitignore` to cover additional secret formats (e.g., `.pem`, `.crt`, `.log`) alongside Cloudflared credentials to reduce the chance of accidental leaks.
- Add a `SECURITY.md` in the repository and a `security.txt` on the deployed site describing how to report vulnerabilities affecting Lord James Follent.
- Maintain a register of third-party scripts such as the Google Tag Manager container `GTM-W72PPP7B`, and review consent and privacy requirements before any launch.

## Analytics Foundations for Lord James Follent

### Objectives
- Establish a GA4 property dedicated to Lord James Follent's public presence and govern access, recovery details, and ownership continuity within the shared credential vault.
- Consolidate all browser-side tracking through a single Google Tag Manager (GTM) web container so instrumentation stays centrally managed.
- Produce actionable reporting on sessions, users, outbound social engagement, and future mailing list conversions without introducing duplicate scripts in the static site.

### Scope and Assumptions
- The existing static marketing pages (`index.html`, `story.html`, and any future additions referenced in `sitemap.xml`) load the GTM snippet maintained in this repository.
- Lord James Follent remains the administrator responsible for GTM previews, QA sign-off, and publishing container versions.
- Mailing list functionality will ship in a later milestone; the plan below prepares the instrumentation path so analytics tracking is ready when the form is introduced.

### Milestones

#### 1. Container and Property Setup
1. Create the GA4 property and record the Measurement ID (`G-LRQH90P786`) alongside account recovery steps in the secure vault.
2. Create the GTM web container (`GTM-W72PPP7B`), enable Preview/Debug access for the administrator account, and capture ownership notes in the same vault entry.
3. Document support contacts and recovery procedures directly in the vault and summarize them in `README.md` once the property is live so future maintainers understand the escalation path.

#### 2. Baseline Page View Tracking
1. Embed the GTM snippet at the top of every `<head>` element and the `<noscript>` fallback immediately after each opening `<body>` tag.
2. Within GTM, configure a GA4 Configuration tag targeting the recorded Measurement ID and set it to fire on all pages.
3. Publish the container and confirm page view data using GA4 real-time and DebugView dashboards.

#### 3. Outbound Social Link Click Events
1. Inventory every outbound social URL present in the static pages and note the CSS classes or IDs that can anchor GTM triggers.
2. Build a GTM Click Trigger scoped to those URLs and attach a GA4 Event tag (proposed name: `social_outbound_click`) capturing parameters such as `link_url`, `link_text`, and `source`.
3. Validate the event in GTM Preview mode, capture evidence, and archive screenshots for Lord James Follent's records before publishing the container version.

#### 4. Mailing List Conversion Tracking
1. Select the mailing list provider (e.g., Mailchimp or ConvertKit) and design the embedded signup form when the feature enters implementation.
2. Emit a GTM trigger on successful submissions (Form Submit trigger, custom event, or explicit `dataLayer.push`) and fire a GA4 Event (`lead_signup`) containing `form_location` and `subscription_type`.
3. Test the full flow in Preview mode and verify conversions inside GA4 DebugView before moving changes to production.

#### 5. Reporting, QA, and Compliance
1. Assemble an initial GA4 exploration covering sessions, users, outbound social events, and mailing list conversions so stakeholders have a single status view.
2. Schedule recurring analytics reviews (monthly or around campaign launches) to evaluate data quality, refresh triggers, and document adjustments in this repository or GTM notes.
3. Update privacy notices to mention GA4, GTM, and mailing list tracking, and evaluate whether consent management tooling is required for the target jurisdictions (GDPR, Australian Privacy Act).
4. Configure GA4 data retention and IP anonymization settings in line with compliance expectations, recording the applied values for audit purposes.

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
