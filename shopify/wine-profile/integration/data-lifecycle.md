# Wine Profile data lifecycle

Owner: Lord James Follent. Implementation checklist before real customer collection; deletion and timed retention are not implemented. Sending remains disabled.

## Current data boundaries

| Location | Data | Current lifetime |
| --- | --- | --- |
| Stage 1 page memory | Entered name, adult-screen details, answers and results | Cleared by restart or leaving the page; no server save |
| Optional Stage 2 session handoff | Allowlisted answer IDs only | 20-minute expiry checked when restored; entry removed on restoration |
| Shopify customer metafields | Latest versioned answer/result snapshot and request metadata | No automatic expiry implemented |
| Shopify customer tags | Bounded Wine Profile version, answer and content IDs | Latest profile replaces this integration's previous profile tags |
| Customer-scoped Durable Object | Latest 50 submission IDs, fingerprints, states and timestamps | Count bounded; no time-based expiry implemented |
| Shopify Messaging / recipient inbox | Personalised email and delivery records | Managed outside the Worker; deleting a profile cannot recall an email |

The customer ID and answer fingerprint remain customer-linked data even without a copied email address. The 50-record limit is not a retention period. Browser expiry is checked on use, rather than a background deletion timer. No name, email or DOB is accepted by the profile-save API; DOB must also remain absent from logs and errors.

## Required implementation

1. Record the owner's retention period separately for the latest saved profile and operational request history. Decide how a customer can request removal and who handles requests. Do not publish an automatic-expiry promise before it exists.
2. Implement an authenticated deletion path scoped to one verified shop/customer. A submitted customer ID alone cannot authorize deletion. If Shopify webhooks are used, verify the raw-body HMAC and shop before accepting work, handle duplicate deliveries and durably record accepted cleanup work. Shopify documents the three compliance topics as mandatory for App Store distribution; the planned custom distribution must be configured and checked on its own terms. [Shopify privacy webhooks](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance).
3. Coordinate deletion with the same customer Durable Object. Stop new preparation/dispatch, settle in-flight work and clear in-memory coordinator state. Deleting its persisted records alone could let an old task save the profile again. Resolve pending Flow/Messaging work before claiming no further email can be sent; uncertain outcomes must remain reviewable.
4. Remove only `chateau_wine_profile.snapshot`, `chateau_wine_profile.request` and this integration's versioned profile/request tags. Preserve unrelated customer fields, tags, purchases and subscription state. A profile-deletion request does not itself authorize deleting the customer or changing marketing consent.
5. Clear the relevant Durable Object records and any alarms/retry state, with a documented rule for replay protection. Do not silently retain a customer-linked tombstone forever or reset an uncertain email request into a resendable state. Account for the platform's recovery copies in the deletion description; Cloudflare documents SQLite point-in-time recovery separately from live storage. [Durable Object storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).
6. Verify cleanup in Shopify and Cloudflare. Retry partial failure safely and expose it to the authorised reviewer. Keep only the minimum approved audit information; exclude answers, profile text, DOB, names and email addresses from operational logs.

## Acceptance checks before enabling collection

- Delete an idle profile and confirm unrelated customer data and consent are preserved.
- Delete during preparation, dispatch and an uncertain automation outcome; no late write may recreate removed data and no retry may send an extra email.
- Reject forged, wrong-shop and unauthorised deletion requests; safely repeat a genuine request after interruption.
- Exercise expiry with a controlled clock, including failures, active request locks and stored history older than the approved period.
- Verify deletion after customer removal and app uninstall, including how the implementation discovers any affected customer-scoped storage.
- Confirm the customer-facing notice accurately distinguishes quiz restart, saved-profile deletion and emails already sent.

These checks depend on the chosen Flow dispatch/completion route. They do not require adding deletion controls to the existing read-only operator page or to Stage 1.
