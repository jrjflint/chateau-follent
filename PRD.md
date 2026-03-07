# Product Requirements Document (PRD)

## 1. Overview
Chateau Follent is the public-facing digital home for Lord James Follent. The current release is a static marketing website that communicates the brand story, showcases vintages, and prepares an owned channel for audience growth.

This PRD defines the concrete product decisions for the current delivery phase so contributors can ship a launch-ready experience without introducing speculative platform work.

## 2. Goals
1. Publish and maintain a polished, static marketing site for Lord James Follent at `chateaufollent.com.au`.
2. Present clear narrative and vintage content across the core pages (`/`, `/story.html`, `/vintages.html`).
3. Capture early audience intent via a waitlist flow and outbound links.
4. Establish baseline analytics instrumentation through Google Tag Manager (`GTM-W72PPP7B`) and GA4-ready events.
5. Preserve operational safety through documented security, tunnel, and third-party script controls.

## 3. Non-Goals
1. Building a custom CMS, admin panel, or authenticated user accounts.
2. Implementing ecommerce checkout, payments, or order management.
3. Adding backend APIs or persistent databases in this phase.
4. Launching paid campaign automation beyond baseline analytics tagging.

## 4. Target Users & Personas
- **Prospective supporters and wine enthusiasts:** People discovering Chateau Follent who need clear story and vintage context before joining the waitlist.
- **Existing contacts of Lord James Follent:** Returning visitors who need direct access to updated vintage and project narrative information.
- **Internal contributors:** Collaborators maintaining copy, links, analytics tags, and security posture using repository documentation.

## 5. Problem Statement
Lord James Follent needs a credible, maintainable web presence that can be updated quickly, communicate the Chateau Follent story, and measure audience engagement before larger product investments are made. Without clear requirements, contributors risk inconsistent messaging, missing analytics coverage, and avoidable security gaps.

## 6. Scope
### In scope for this PRD phase
- Static site experience and content updates across existing public HTML pages.
- Brand-aligned styling and supporting assets (favicon, share image, colour references).
- Search discoverability essentials (`sitemap.xml`, `robots.txt`).
- Waitlist interaction flow present in the static experience.
- Analytics foundation via GTM placement and QA workflow.
- Local preview and controlled external preview via Docker + Cloudflared tunnel.
- Documentation governance (`README.md`, `PLAN.md`, `tasks/todo.md`, `CHANGELOG.md`, `SECURITY.md`, and script register).

## 7. Out of Scope
- Native mobile apps.
- Multi-language content variants.
- Personalisation engines or recommendation systems.
- Cookie consent platform implementation (tracked as compliance dependency, not built here).
- Automated CI/CD rollout beyond current contributor workflow.

## 8. Functional Requirements
- **FR-1 (Page availability):** The site must provide public access to the defined core pages and any linked campaign pages tracked in repository documentation.
- **FR-2 (Narrative clarity):** The homepage and story pages must communicate the Chateau Follent narrative for Lord James Follent with consistent salutation and tone.
- **FR-3 (Vintage directory access):** Visitors must be able to browse the vintages archive and land on anchored wine entries from campaign/QR links.
- **FR-4 (Waitlist intent capture):** The site must provide a waitlist call-to-action and interaction flow that can be opened/closed reliably.
- **FR-5 (Analytics bootstrapping):** GTM container `GTM-W72PPP7B` and page context metadata must be present on designated public pages.
- **FR-6 (Preview environments):** Contributors must be able to run a local preview at `http://localhost:3000` and optionally expose it via Cloudflared for stakeholder review.
- **FR-7 (Documentation traceability):** Material delivery, security, and analytics decisions must be captured in repository docs so future contributors can onboard without tribal knowledge.

## 9. Non-Functional Requirements
- **NFR-1 (Performance):** Static pages should render quickly on modern mobile and desktop browsers without heavy runtime dependencies.
- **NFR-2 (Reliability):** Public pages and key interactions (navigation, waitlist modal open/close) must function consistently across supported browsers.
- **NFR-3 (Security):** Tunnel credentials, tokens, and sensitive identifiers must never be committed; secret handling must follow documented environment-variable workflows.
- **NFR-4 (Accessibility):** Interactive components must preserve focus order and keyboard operability, including modal/focus-trap behavior.
- **NFR-5 (Compliance readiness):** Analytics tagging decisions must remain documented with consent/privacy notes for Australian Privacy Act and GDPR review.
- **NFR-6 (Maintainability):** Product and operational changes must be reflected in `CHANGELOG.md` and related planning docs.

## 10. User Stories
- **US-1 (P0):** As a first-time visitor, I want to understand who Lord James Follent is and what Chateau Follent represents so that I can decide whether to engage further.
- **US-2 (P0):** As a wine enthusiast, I want to browse current vintages and deep-link to specific wines so that I can revisit exact entries from labels or QR codes.
- **US-3 (P0):** As an interested supporter, I want to join the waitlist so that I can receive updates from Lord James Follent.
- **US-4 (P1):** As a contributor, I want to preview the site locally and through a secure tunnel so that I can validate changes before release.
- **US-5 (P1):** As a project owner, I want baseline analytics events and page context fields so that early traffic and engagement can be measured.

## 11. Acceptance Criteria
- **AC-1 (Core pages):** Given the production domain, when a user visits `/`, `/story.html`, and `/vintages.html`, then each page loads successfully and is linked from the site navigation or sitemap.
- **AC-2 (QR deep links):** Given a documented QR URL pattern, when a user opens a wine-specific link, then the user lands on the correct anchor within `vintages.html`.
- **AC-3 (Waitlist interaction):** Given the homepage call-to-action, when a user opens and closes the waitlist modal using mouse or keyboard, then focus and overlay states behave correctly.
- **AC-4 (Analytics baseline):** Given GTM Preview mode, when a contributor opens each designated public page, then expected page context metadata is visible and `page_view` events can be validated in GA4 DebugView without duplication.
- **AC-5 (Preview workflow):** Given Docker is available, when a contributor runs `docker compose up`, then the local preview is accessible at `http://localhost:3000`.
- **AC-6 (Security hygiene):** Given a pull request with environment/config changes, when reviewed, then no live tunnel secrets or credential filenames are present in version-controlled files.

## 12. UX & Design
- Preserve a premium, editorial aesthetic aligned with Chateau Follent and Lord James Follent's narrative voice.
- Keep navigation and page hierarchy straightforward: discovery (home), story context, and vintages details.
- Maintain clear calls-to-action for waitlist engagement without intrusive interaction patterns.
- Reuse established visual assets and colour reference pages to keep design implementation consistent.

## 13. Information Architecture
### Primary content entities
1. **Page** (home, story, vintages, supporting campaign pages).
2. **Vintage Entry** (wine name, year, anchor ID, supporting copy).
3. **Marketing Link** (UTM parameters + destination anchor).
4. **Analytics Context** (`pageTitle`, `pageTemplate`, `audiencePersona`, event metadata).

### Relationship notes
- Marketing links resolve to specific page anchors in the vintages archive.
- Analytics context is attached per page and consumed via GTM/GA4 tooling.
- Supporting governance documents describe how entities are updated and validated.

## 14. Release Plan
1. **Phase 1 — Foundation (completed):** Static scaffold, core pages, base styling, local Docker preview.
2. **Phase 2 — Operational readiness (completed):** Cloudflared token workflow, security policy, secrets hygiene documentation.
3. **Phase 3 — Measurement baseline (in progress):** GTM rollout across public pages, analytics QA pass, event expansion planning.
4. **Phase 4 — Content polish (next):** Continue copy, visuals, and campaign-link refinements based on early audience feedback.

## 15. Dependencies
- Docker Engine / Docker Compose for local preview.
- Cloudflare Tunnel (`cloudflared`) for controlled external preview.
- Google Tag Manager container `GTM-W72PPP7B` and GA4 property access for analytics validation.
- Approved secret management workflow for tunnel and analytics credentials.

## 16. Assumptions
1. Chateau Follent remains a static-first site for the current planning horizon.
2. Lord James Follent approves copy, campaign direction, and analytics instrumentation decisions.
3. Contributors have access to required infrastructure secrets outside the repository.
4. No payment, account, or transactional capabilities are required in this phase.

## 17. Risks & Mitigations
- **Risk:** Sensitive tunnel values are accidentally committed.  
  **Mitigation:** Enforce placeholder-only config, environment-variable usage, and PR review checks.
- **Risk:** Analytics is deployed but not validated, leading to unreliable reporting.  
  **Mitigation:** Execute documented GTM Preview + GA4 DebugView QA checklist and archive evidence.
- **Risk:** Content updates diverge from brand voice or salutation standards.  
  **Mitigation:** Follow repository style guidance and review all copy for consistent references to Lord James Follent.
- **Risk:** Scope creep into backend/ecommerce work delays core launch quality.  
  **Mitigation:** Keep roadmap constrained to static-site and measurement objectives in this PRD.

## 18. Metrics & Success Criteria
- Core pages are published and accessible with no broken primary navigation paths.
- Waitlist interaction is operational on target pages.
- GTM instrumentation is present on designated public pages and validated for baseline `page_view` events.
- QR campaign links resolve to correct vintages anchors.
- Security documentation and third-party script register remain current after each material change.

## 19. Open Questions
1. Which additional custom GTM events (social outbound clicks, waitlist conversion milestones) should be promoted from backlog to current milestone?
2. What evidence format and storage location will Lord James Follent use for recurring analytics QA artifacts?
3. Is a formal cookie consent banner required before broader campaign traffic scales beyond baseline testing?

## 20. Appendix
- `README.md` — repository usage and preview workflows.
- `PLAN.md` — cloudflared and analytics roadmap details.
- `tasks/todo.md` — active implementation and QA backlog.
- `third-party-scripts.md` — approved external script register and compliance notes.
- `marketing-links.md` — canonical QR campaign links and UTM conventions.
- `SECURITY.md` — vulnerability disclosure and security response process.
