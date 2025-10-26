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
- [ ] Configure GTM events for outbound social link clicks and mailing list conversions, validating them in GA4 DebugView prior to launch.
  - Owner: Lord James Follent
  - Priority: Medium
