# Google Analytics and Google Tag Manager MVP Plan

## Objectives
- Establish baseline reporting on sessions, engaged sessions, and users for Lord James Follent's public site via Google Analytics 4 (GA4).
- Capture outbound link clicks to Lord James Follent's Instagram and other social profiles as tracked GTM events.
- Prepare infrastructure to measure mailing list sign-up conversions once the subscription form is live.

## Scope and Assumptions
- A single Google Tag Manager (GTM) web container will manage all client-side tracking for the site.
- Lord James Follent is the GTM administrator responsible for previewing, testing, and publishing container versions.
- Initial deployment targets the existing static marketing site served from `index.html`, with future-ready provisions for mailing list functionality.

## Implementation Milestones

### 1. Container and Property Setup
1. Create a GA4 property dedicated to Lord James Follent's public site and note the Measurement ID.
2. Create a GTM web container and enable Preview/Debug access for the administrator account.
3. Document account ownership, recovery, and access procedures to ensure continuity.

### 2. Baseline Page View Tracking
1. Add the GTM container snippet to `index.html` (and any additional public pages such as `story.html`).
2. Within GTM, configure a GA4 Configuration tag pointing to the site's Measurement ID and fire it on all pages.
3. Publish the container and confirm page view data is populating in GA4's real-time dashboard.

### 3. Outbound Social Link Click Events
1. Inventory all social profile links (Instagram, etc.) and ensure they include identifying CSS classes or attributes for targeting.
2. Create a GTM Click Trigger scoped to outbound links that match the social URL patterns.
3. Add a GA4 Event tag (e.g., `social_outbound_click`) capturing parameters such as `link_url`, `link_text`, and `source`.
4. Test in GTM Preview mode and verify event delivery in GA4 DebugView before publishing.

### 4. Mailing List Conversion Tracking
1. Select or integrate a mailing list provider (e.g., Mailchimp, ConvertKit) that supports client-side event callbacks or hidden field tracking.
2. Design and deploy the mailing list signup form, ensuring it posts to the chosen provider and confirms submissions without full page reloads when possible.
3. Implement a GTM trigger for successful form submissions (e.g., using the Form Submit trigger, custom event, or data layer push from the provider).
4. Fire a GA4 Event (e.g., `lead_signup`) with parameters such as `form_location` and `subscription_type` to support downstream reporting.
5. Validate end-to-end tracking in Preview mode, then publish the updated container once confirmed.

### 5. Reporting and QA
1. Build an initial GA4 report or exploration summarizing sessions, users, outbound social clicks, and mailing list conversions.
2. Schedule periodic reviews (monthly or aligned with campaigns) to monitor data quality and adjust GTM triggers as the site evolves.
3. Document troubleshooting steps and change logs in the repository or GTM notes to support future enhancements.

## Privacy and Compliance Considerations
- Add or update the site's privacy notice to disclose the use of GA4, GTM, and mailing list tracking for Lord James Follent.
- Evaluate consent requirements (e.g., GDPR, Australian Privacy Act) and integrate a consent banner if legally required before firing analytics tags.
- Configure data retention and IP anonymization settings in GA4 according to compliance needs.

## Future Enhancements
- Expand tracking to capture additional engagement events (e.g., hero CTA clicks, story page scroll depth) as the site content grows.
- Integrate conversion tracking with advertising platforms once paid campaigns begin.
- Consider server-side tagging or enhanced measurement once infrastructure allows, while keeping the single-container governance model.
