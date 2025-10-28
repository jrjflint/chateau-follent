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
    1. Inventory required pages:
       - Confirm `index.html` and `story.html` both lack GTM or GA placeholders so the snippet can be inserted cleanly.
       - Scan `sitemap.xml` for additional public URLs and flag any future microsite entries for the same treatment.
    2. Container ID handling:
       - Reference `google-analytics-plan.md` to verify the live GTM container ID (`GTM-W72PPP7B`).
       - Log the ID in Lord James Follent's shared credential vault with rotation notes so the snippet does not need repo edits during future swaps.
    3. Snippet placement blueprint:
       - Prepare to paste the GTM `<script>` block at the top of each `<head>` (before other scripts or structured data).
       - Stage the `<noscript>` iframe immediately after each opening `<body>` tag, ensuring no whitespace or comments break the fallback.
       - Wrap both blocks in a consistent maintenance comment, e.g., `<!-- GTM snippet: maintain parity with GTM-W72PPP7B publish date -->`, to make future includes obvious.
    4. dataLayer bootstrap definitions:
       - `index.html`: `pageTitle` = "Chateau Follent | Heritage & Winemaking Vision of Lord James Follent", `pageTemplate` = `marketing_homepage`, `audiencePersona` = `prospective_guests_and_partners`.
       - `story.html`: `pageTitle` = "The Chateau Follent Story | Lord James Follent's Winemaking Journey", `pageTemplate` = `longform_story`, `audiencePersona` = `media_and_supporters`.
       - Confirm the bootstrap uses `window.dataLayer = window.dataLayer || [];` before pushing each object so GTM sees consistent keys.
    5. Duplication and QA guardrails:
       - Double-check that no legacy GA or analytics `<script>` tags remain once GTM is live, relying on the GA4 Configuration tag inside GTM.
       - Draft a smoke-test checklist: open each page in private browsing, enter GTM Preview mode, validate `page_view` hits in GA4 real-time, and capture screenshots for Lord James Follent's records.
- [ ] Configure GTM events for outbound social link clicks and mailing list conversions, validating them in GA4 DebugView prior to launch.
  - Owner: Lord James Follent
  - Priority: Medium
  - Plan:
    - Document the CSS selectors or IDs for social links and mailing list forms within the static pages.
    - Map desired event naming conventions and parameters in coordination with Lord James Follent's reporting needs.
    - Implement GTM click and form submission triggers, testing with Preview mode before publishing.
    - Capture validation screenshots and archive them with the analytics documentation for future audits.
