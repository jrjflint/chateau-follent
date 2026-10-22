# Shopify Wine Profile implementation

Owner: Lord James Follent. This directory contains generated deployment files, a local preview and the Stage 2 Messaging proof assets. It is an overlay for the existing theme, not a complete Shopify theme ZIP.

## Current status

- Stage 1 is installed in the unpublished **Chateau Follent - Wine Profile development** theme (`188760850606`), duplicated from Story launch. The hidden **Wine Profile** page (`164315136174`) exists at `/pages/wine-profile`, outside navigation. The selected theme and private storefront access are unchanged.
- The dedicated `wine-profile` template is previewed in the draft theme. The page's saved template remains Default because Shopify's selector lists templates from the selected theme. Keep using the draft alternate-template preview until a separate release decision; do not publish to bypass that limitation.
- Shopify walkthroughs verified required answers, all seven questions, complete red/white/exploratory results, answer retention, changed mead recommendations, the non-drinking exercise, underage rejection, restart/clearing, keyboard entry/selection and section removal/restoration. Mobile results are readable. Final print layout still requires manual review because Chrome's print preview is unavailable to browser automation.
- The production Messaging template **Your Chateau Follent Wine Profile** (`1887861`) is saved and its persisted source matches the generated file. The separate synthetic template (`1887895`) and controlled campaign draft (`78989550`) were used for proof. Full red and white emails were received in the owner's Gmail inbox, with all 20 expected content fields matching each profile and no DOB/fallback. No subscriber campaign was sent and no customer data/consent was changed.
- The initial received-email gate passed; actual authenticated customer-tag mapping and subscriber-only automation remain unverified. [Proof evidence](messaging/proof-evidence.json) records the template hash, receipts, screenshots and limitations. Rebuilding preserves valid evidence and invalidates it if the compiled template changes.
- Shared authentication, profile validation/persistence, request coordination, answer-only login handoff and Cloudflare runtime modules are implemented. The disabled Worker bundle passes an actual local Cloudflare smoke test and Wrangler deployment dry run. No app/Worker, results email action, signup integration or Flow automation is deployed. Lord James Follent will handle Wrangler authorization; deployment is deferred at his request. The Flow-route decision remains pending. [Integration status and authorization handoff](integration/README.md).
- The optional email controls are wired into a separate local Stage 2 section, generated with `data-email-enabled="false"`. A synthetic browser walkthrough verified sign-in/signup returns, blank name/DOB, repeated adult screening, subscriber/pending/declined paths, truthful request status, failure states and restart during an in-flight request. The installed Stage 1 has not been changed. Native Shopify signup and real sign-in remain unverified.
- Authenticated read-only request review is implemented and tested locally. It requires an explicit admin reviewer allowlist, which remains empty. The real Cloudflare runtime verifies the HTTP-to-Durable-Object review path; a synthetic browser view covers request locks and failed/empty lookups. Actual embedded Shopify admin authentication remains unverified. [Operator setup and recovery](integration/README.md#request-review-and-recovery).
- A newly verified plan restriction needs a decision: custom-app Flow triggers require Shopify Plus; this store is Basic. The built-in customer-tag trigger is a proposed alternative, awaiting approval. Sending remains disabled.

## Build and preview

From the repository root with Node 24:

```powershell
node tools/build-wine-profile-shopify.mjs
node tools/build-wine-profile-messaging.mjs
python -m http.server 3087 --bind 127.0.0.1
```

Open `http://127.0.0.1:3087/shopify/wine-profile/preview.html`. This verifies the isolated section, not the actual Shopify theme. The original static prototype is unchanged.

The generated section contains its own scoped CSS and JavaScript, so no module paths or external packages must be configured on Shopify. Its custom element aborts all section listeners when disconnected and starts a fresh instance on reconnection. Do not edit generated files directly.

## Local Stage 2 controls

```powershell
node tools/build-wine-profile-shopify.mjs --with-email
```

This produces separate `sections/wine-profile-email.liquid` and `templates/page.wine-profile-email.json` setup artifacts. They are not installed, and email controls remain disabled in the Liquid output. The regular build still produces Stage 1 without importing storage, transport or email controls. The original static prototype remains unchanged.

Open `http://127.0.0.1:3087/shopify/wine-profile/preview-email.html` for the explicitly labelled synthetic simulation. Its scenario selector drives local responses only; it cannot send emails, change consent or save customers. The sign-in/signup simulation reloads this page using the same answer-only session handoff as the production client. The **Slow request** scenario and **Finish queued simulation** control verify late-response cleanup after restart. [Mobile review](qa/wine-profile-stage2-mobile.png).

The Stage 2 source uses Shopify's `routes.storefront_login_url`, which returns visitors to their storefront page, and the native newsletter `customer` form with the signed-in account email. A separate required checkbox starts unchecked. The backend's current `SUBSCRIBED` state remains the authority; a successful form post or Liquid marketing boolean never authorizes sending. Confirmation prompts the visitor to explicitly request their profile. [Shopify routes](https://shopify.dev/docs/api/liquid/objects/routes#routes-storefront_login_url), [native email-consent form](https://shopify.dev/docs/storefronts/themes/customer-engagement/email-consent).

Install and enable this section only after the backend, approved Flow route and controlled integration checks are ready. Test the real signup form, CAPTCHA when applicable, sign-in return URL and subscription confirmation on Shopify. Restart clears page entries and temporary answer handoff; it does not delete a profile already saved to the customer account. Operations review and profile deletion/retention handling remain release requirements.

## Stage 1 installation and release notes

1. Duplicate **Chateau Follent - Story launch** (`188625289390`) and name the copy **Chateau Follent - Wine Profile development**. Keep it unpublished and keep storefront password restriction enabled.
2. In the copy's code editor, add `sections/wine-profile.liquid` and `templates/page.wine-profile.json` from this directory. Merge the two keys in `schema-locale-patch.json` into the existing `locales/en.default.schema.json`; preserve its existing keys and comments. These files are installed in development theme `188760850606`.
3. Create a **Wine Profile** page with handle `wine-profile`; leave it out of navigation. Use the draft theme's alternate-template preview to test it before publication. If Shopify's page template selector only lists the selected theme's templates, do not publish the draft just to make the template appear; validate the draft with the `view=wine-profile` alternate template and its theme preview URL.
4. The existing archive page `/pages/vintages` was verified in this store and matches the default **Vintage archive link**. Privacy uses `shop.privacy_policy.url`, falling back to `/policies/privacy-policy`; review the policy content before release.
5. Test in the actual theme, including theme-editor section reloads, keyboard use, mobile layout and print. Keep the selected theme unchanged until release is separately requested.

## Prove Stage 2 in Messaging

The saved **Code your own** template **Your Chateau Follent Wine Profile** uses `messaging/wine-profile-email.liquid`. It is about 55 KB and must be a full custom-coded email, not a 50 KB custom Liquid section. The actual editor rejects a leading Liquid comment and requires `{{ open_tracking_block }}`; the generator follows those verified restrictions. When creating the eventual automation email, set subject to **Your Chateau Follent Wine Profile** and preview text to **Your preferences, three styles to explore and a discovery of your own.** Use the existing authenticated sender and disable open tracking for the initial proof.

`messaging/proof-fixtures.json` contains synthetic red, white, mead, exploratory and non-drinking profiles. It includes expected results and the exact tags needed to render each message. For a controlled subscribed test customer, preserve unrelated tags and replace only tags beginning with the versioned quiz prefix. Do not apply these synthetic tags to real customers. If a test customer lacks capacity within Shopify's customer-tag limit, stop rather than dropping unrelated tags.

The template resolves only compiled, trusted text IDs; it does not execute HTML supplied by a visitor. It scans tags in five groups of 50 to avoid losing results when customer tags exceed one Liquid loop. It includes Shopify's unsubscribe URL and native open-tracking variable. Missing or incomplete profile data produces an explicit fallback, which is a failed proof, not a valid personalised report.

Send red and white proofs to an inbox chosen by Lord James Follent. Check actual received content against the fixture, plus mobile layout and all links; check Gmail and Outlook when available. Also check the non-drinking exercise. Local `proof-*.html` files and Messaging previews do not satisfy this gate.

Messaging's native **Send test** uses a sample customer (Bob) and offers no customer-context selector. For the first delivery proof, paste `proof-red.liquid` and then `proof-white.liquid` into the isolated synthetic-data template (`1887895`) and use **Send test** to the agreed inbox. These generated proof sources change only the tag input to synthetic fixture IDs. They retain the standard customer-name variable, which previews as Bob. Do not paste them into production template `1887861`. This avoids modifying real customer tags or marketing consent; real authenticated customer-tag mapping and the subscriber-only Flow path still need integration testing after the initial proof.

The red and white campaign test emails were received and compared against every expected field on 21 October 2026. They use synthetic tag overrides and the sample greeting Bob; this establishes Messaging rendering and delivery, not real customer-tag mapping. The native tests also contain a preview unsubscribe link, which must be verified separately for the live automation. The controlled campaign draft remains unscheduled.

Implement the authenticated integration after resolving the Flow plan restriction. Maintain sending as disabled until subscriber, retry, duplicate-request, content-freezing and failure-path tests pass. `release-gate.json` records the successful initial proof and incomplete integration; it is not a deployed backend feature flag.

## Validation

The email QA dependency is installed outside the repository in a temporary directory:

```powershell
npm install --prefix "$env:TEMP/chateau-wine-profile-qa" --no-save --package-lock=false liquidjs@10.21.1
node --test --test-isolation=none tests/wine-profile.test.mjs tests/wine-profile-shopify.test.mjs tests/wine-profile-integration.test.mjs tests/wine-profile-operations.test.mjs
node tools/render-wine-profile-proofs.mjs
```

The 68 tests cover the original profile rules, generated section syntax/schema, no Stage 1 submission/persistence, disabled Stage 2 output and unchecked signup, 10,000 tag projections, complete Liquid rendering, tags beyond the first 50, parser restrictions, disabled release state and backend/client authentication/privacy/concurrency/token handling. Seven operator tests cover ID-token authentication, explicit reviewer access, data filtering, read-only storage, customer isolation and identity-only setup. Saved snapshots, request metadata and tags must all match before dispatch; nine corruption scenarios verify this gate. A separate actual Cloudflare runtime smoke test and Wrangler dry run pass. Actual deployment and live automation remain unverified.

Draft review: [quiz in the Shopify theme editor](https://admin.shopify.com/store/tvump1-7j/themes/188760850606/editor?previewPath=%2Fpages%2Fwine-profile%3Fview%3Dwine-profile), [hidden page](https://admin.shopify.com/store/tvump1-7j/pages/164315136174), [production email template](https://admin.shopify.com/store/tvump1-7j/apps/shopify-messaging/custom-template/1887861), [synthetic proof template](https://admin.shopify.com/store/tvump1-7j/apps/shopify-messaging/custom-template/1887895).
