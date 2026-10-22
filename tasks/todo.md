# Task List

## Wine Profile Prototype

- [x] Build the direct-link, mobile-first Wine Profile for Lord James Follent with adult screening, seven questions, deterministic recommendations, separate consent and a responsive mock email.
- [x] Document the CRM schema and future Shopify/transactional delivery boundary without adding live collection, analytics or payments.
- [x] Add dependency-free tests for age, selection rules, varied profiles, consent, attribution, safe rendering and truthful submission states.
- [x] Walk through mobile and desktop flows, changed-answer results, keyboard controls, independent consent, email previews and existing-page smoke checks.

## Wine Profile Shopify Discovery

- [x] Implement the Stage 1 quiz as a generated Shopify section and page template with complete on-page results and no contact capture or transport.
- [x] Generate a full individual-results Messaging template using versioned content/answer/recommendation tags and verify it with a real local Liquid renderer.
- [x] Validate 10,000 varied tag projections, contrasting rendered reports, escaped personal text, incomplete-data fallback and customer tags beyond the first 50.
- [x] Duplicate Story launch into unpublished Wine Profile development (`188760850606`), install section/template/schema locale keys and create hidden Wine Profile page (`164315136174`) outside navigation.
- [x] Verify the seven-question quiz, required answers, full red results, edit retention, changed mead recommendations and mobile results inside the draft Shopify theme.
- [x] Verify actual-theme restart/clearing, underage rejection, keyboard entry/selection, section removal/restoration, white/exploratory parity and the non-drinking exercise.
- [ ] Complete manual actual-theme print-layout review; Chrome's print preview is unavailable to browser automation.
- [x] Save production Messaging template (`1887861`) and verify full red/white rendering in separate synthetic proof template (`1887895`).
- [x] Verify contrasting red/white emails received in the owner's Gmail inbox against all 20 expected fields per profile; record source hashes and screenshots without enabling sending.
- [x] Implement/test shared signed-proxy authentication, CSRF, strict profile validation, safe tag/metafield persistence, request coordination and answer-only login handoff.
- [x] Prepare the closed Cloudflare Worker bundle, customer-scoped Durable Object wrapper and token refresh provider; pass actual local runtime smoke and Wrangler deployment dry run.
- [x] Wire optional email controls, answer-only return, repeated adult screening and unchecked native signup in a separate disabled Stage 2 artifact. Verify synthetic browser states, mobile layout and late-response cleanup; leave the installed Stage 1 unchanged.
- [x] Build read-only request review protected by signed admin ID tokens and a server-side reviewer allowlist; verify filtering, isolation, native Cloudflare RPC and synthetic browser failure paths. Default review access remains closed.
- [x] Validate the actual backend GraphQL operations against Shopify 2026-10 and prepare inspected, schema-validated customer metafield definitions without executing store mutations. Record deletion/retention boundaries and acceptance checks in the integration data-lifecycle checklist.
- [ ] Configure and verify actual embedded Shopify operator authentication for the intended reviewer; implement profile deletion/retention handling before real customer collection.
- [ ] Verify real Shopify sign-in, native signup/CAPTCHA, confirmation and subscriber-only saving through the deployed integration before enabling the Stage 2 section.
- [ ] Provision the backend/app after Lord James Follent handles scoped Wrangler authorization and instructs deployment to proceed. Deployment deferred at his request on 21 October 2026. Both dashboards are accessible; no app, Worker, credential or permission grant has been created.
- [ ] Resolve the Basic-plan restriction on custom-app Flow tasks. Proposed built-in tag trigger awaits Lord James Follent's choice; do not substitute silently or upgrade the plan.
- [ ] After received proofs pass, implement authenticated app-proxy/Worker customer saving, explicit signup and Flow automation; keep sending disabled until integration tests pass.

- [x] Inspect the existing Shopify store read-only and record its Basic plan, selected/draft themes, private access, installed apps, domain connection and authenticated Shopify sender in the implementation plan.
  - Owner: Lord James Follent
- [x] Confirm the underlying theme/version and actual Messaging test-delivery capability using [the Shopify implementation plan](../docs/wine-profile-shopify-plan.md).
  - Owner: Lord James Follent
  - Priority: High
  - Horizon 4.3.0 and contrasting received Messaging test emails are confirmed. Real customer-tag mapping and subscriber-only automation remain unverified.
- [x] Choose the storefront integration and delivery provider: a Shopify page section followed by Shopify Messaging, with Flow and a custom authenticated integration after the email proof.
  - Owner: Lord James Follent; implementation owner to be assigned
  - Priority: High
- [x] Set first-release boundaries: Stage 1 shows results only; Stage 2 saves/email results only for signed-in confirmed marketing subscribers. Retention and integration failure handling remain implementation requirements after the proof.
  - Owner: Lord James Follent
  - Priority: Medium

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
