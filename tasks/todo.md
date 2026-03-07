# Task List

## Docker Compose Tunnel Integration

- [x] Add `cloudflared` service to `docker-compose.yml` with the specified image, command, volume mount, dependency on `web`, and `unless-stopped` restart policy so the tunnel starts with the stack.
  - Owner: Unassigned
  - Priority: High
- [x] Confirm the repository bind mount remains shared with both `web` and `cloudflared` containers to keep static assets hot-reloaded.
  - Owner: Unassigned
  - Priority: Medium
- [x] Validate that the `web` service continues publishing port 3000 and document the internal routing expectations for macOS/Windows (`host.docker.internal:3000`) and Linux (`http://web:3000`).
  - Owner: Unassigned
  - Priority: Medium

## Analytics Foundations

- [ ] Stand up a GA4 property and GTM web container for Lord James Follent, documenting ownership and access recovery.
  - Owner: Lord James Follent
  - Priority: High
- [x] Instrument baseline page view tracking by adding the GTM snippet across current public pages and publishing the configuration tag.
  - Owner: Lord James Follent
  - Priority: High
  - Notes:
    - GTM `GTM-W72PPP7B` and dataLayer bootstrap metadata are now present on `index.html`, `story.html`, `vintages.html`, and `founding-fellowship.html`.
    - Legacy direct GA snippets remain intentionally absent so analytics is governed through GTM configuration.
- [ ] Run a post-implementation analytics QA pass for baseline page views and archive evidence for Lord James Follent.
  - Owner: Lord James Follent
  - Priority: High
  - Plan:
    1. Enter GTM Preview mode and validate expected page context fields (`pageTitle`, `pageTemplate`, `audiencePersona`) across all public pages.
    2. Confirm `page_view` events appear in GA4 DebugView and real-time reports without duplication.
    3. Capture and store validation screenshots with the analytics records to preserve an audit trail.
- [ ] Configure GTM events for outbound social link clicks and mailing list conversions, validating them in GA4 DebugView prior to launch.
  - Owner: Lord James Follent
  - Priority: Medium
  - Plan:
    - Document the CSS selectors or IDs for social links and mailing list forms within the static pages, keeping the inventory aligned with `PLAN.md`.
    - Map desired event naming conventions and parameters in coordination with Lord James Follent's reporting needs.
    - Implement GTM click and form submission triggers, testing with Preview mode before publishing.
    - Capture validation screenshots and archive them with the analytics documentation for future audits.

## Security Hardening Actions

- [x] Rotate any previously published Cloudflared tunnel UUIDs, treating them as compromised, and document regeneration steps so contributors never reuse retired identifiers.
  - Owner: Unassigned
  - Priority: High
- [x] Replace live tunnel identifiers and credential filenames in version-controlled files with placeholders, backed by clearly documented sample configurations stored outside the repository.
  - Owner: Unassigned
  - Priority: High
- [x] Reference sensitive Cloudflared assets via environment variables or Compose `env_file` entries so production credential filenames are never committed.
  - Owner: Unassigned
  - Priority: Medium
- [x] Expand `.gitignore` to include common secret formats (e.g., `.pem`, `.crt`, `.log`) alongside Cloudflared credentials to reduce the risk of accidental leaks.
  - Owner: Unassigned
  - Priority: Medium
- [x] Add a `SECURITY.md` in the repository and a `security.txt` on the deployed site outlining the vulnerability disclosure process for Lord James Follent.
  - Owner: Unassigned
  - Priority: High
- [x] Maintain a register of third-party scripts such as the Google Tag Manager container `GTM-W72PPP7B`, pairing it with consent and privacy review notes before any launch.
  - Owner: Unassigned
  - Priority: Medium
