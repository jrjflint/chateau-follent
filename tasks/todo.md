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
- [ ] Instrument baseline page view tracking by adding the GTM snippet across public pages and publishing the configuration tag.
  - Owner: Lord James Follent
  - Priority: High
  - Plan:
    - Inventory all public entry points (`index.html`, `story.html`, and future templates) that require the snippet.
    - Draft a shared include or snippet block so GTM can be maintained centrally once a templating system exists.
    - Annotate the dataLayer with page context (title, template identifier) to support future segmentation for Lord James Follent.
    - Validate the snippet firing order alongside the existing Google Analytics plan to prevent duplicate page view events.
- [ ] Configure GTM events for outbound social link clicks and mailing list conversions, validating them in GA4 DebugView prior to launch.
  - Owner: Lord James Follent
  - Priority: Medium
  - Plan:
    - Document the CSS selectors or IDs for social links and mailing list forms within the static pages.
    - Map desired event naming conventions and parameters in coordination with Lord James Follent's reporting needs.
    - Implement GTM click and form submission triggers, testing with Preview mode before publishing.
    - Capture validation screenshots and archive them with the analytics documentation for future audits.
