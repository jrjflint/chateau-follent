# Wine Profile: Shopify Quiz and Messaging Email

Owner: Lord James Follent. Updated 22 October 2026.

## Agreed goal

Deliver the existing Wine Profile in two stages. Stage 1 is a Shopify page with complete on-page results, available without signing in or subscribing. Stage 2 lets signed-in, confirmed marketing subscribers request an automatic email containing their full individual results through Shopify Messaging.

The chosen delivery service is Shopify Messaging. A custom authenticated Shopify integration and Flow will provide data transfer and automation after the received-email proof. Birthday campaigns, wine sales, domain migration and removing private storefront access are outside these stages.

The backend's actual GraphQL operations and customer metafield provisioning operations pass Shopify's 2026-10 schema validator. [Validation evidence](../shopify/wine-profile/qa/shopify-schema-validation.json) distinguishes this from live permission/mutation testing. [Data lifecycle requirements](../shopify/wine-profile/integration/data-lifecycle.md) cover stored data, deletion coordination and retention checks still required before real collection.

## Confirmed environment

Read-only inspection found Shopify Basic, a private storefront at tvump1-7j.myshopify.com, the selected Chateau Follent - Story launch theme (188625289390), a Horizon draft (188623225006), and Messaging/Digital Products installed. The Shopify sender james@chateaufollent.com.au is marked Authenticated. Only the myshopify.com storefront domain was listed as connected.

The embedded admin panels recovered. The selected theme is Horizon 4.3.0. Its unpublished duplicate **Chateau Follent - Wine Profile development** (`188760850606`) now contains the quiz section, dedicated template and two schema locale keys. The hidden **Wine Profile** page (`164315136174`) exists outside navigation. No theme was published, storefront access changed or customer data/consent written. Controlled red and white test emails were received in the owner's Gmail inbox; no subscriber campaign was sent.

## Stage 1: quiz page

Implemented and installed in the draft theme:

- A dedicated Shopify section and page template generated from the shared quiz catalogue and rules.
- All seven questions, adult screening, complete results, editing, restart and print controls.
- Section-scoped state/styles and custom-element cleanup for theme-editor lifecycle changes.
- Direct results after question seven; no email capture, signup, sending or browser persistence.
- A local verification page, including a responsive overflow fix.
- Theme-native typography and colour variables, section-owned styles and translated schema labels.

Shopify verification status:

1. Completed: duplicate Story launch, install section/template and create the hidden page without adding navigation. Shopify's page template selector only lists selected-theme templates; the hidden page remains on Default and is previewed with the draft's `view=wine-profile` template. Do not publish to bypass this limitation.
2. Completed: verify `/pages/vintages`, required answers, seven questions, full red/white/exploratory results and changed mead recommendations. The non-drinking result offers an aroma exercise without alcohol. Underage rejection, restart/clearing, keyboard form entry/selection and section removal/restoration work in the actual theme. Mobile results are readable.
3. Remaining: final print-layout review. Browser automation cannot inspect Chrome's print dialog; a manual review has been requested.
4. Remaining before release: review the privacy policy content and assign the dedicated page template when it becomes available in the selected theme, under a separately authorised release.

Stage 1 is installed and partially verified inside Shopify; final integration QA remains open.

## Stage 2: Messaging email

Implemented locally:

- A full custom-coded Liquid email reproducing the title, summary, preferences, three styles and explanations, exercise and journal topic.
- Versioned answer/recommendation IDs plus compiled trusted text-fragment IDs in customer tags. Customer metafields are not assumed to be available in Messaging Liquid.
- Customer-name escaping, Shopify unsubscribe/open-tracking variables, complete-report validation and explicit missing-data fallback.
- Five synthetic profile fixtures and rendered local examples. These are not sent or received email proofs.
- A release record with `email_sending_enabled` false and the contrasting received-email proofs recorded separately from the incomplete integration checks.

The **Your Chateau Follent Wine Profile** custom-coded template (`1887861`) is saved in Messaging and its persisted source was checked against the generated file. The actual editor rejects a leading Liquid comment and expects `open_tracking_block`; both are reflected in the generator. Full synthetic red and white profiles render in the separate **Wine Profile proof - synthetic data** template (`1887895`). The production template continues to read `customer.tags`.

Messaging's Send test uses the sample customer Bob with no context selector. Generated `proof-*.liquid` templates temporarily inject synthetic tags into the proof copy without modifying customer data or consent. The controlled campaign draft (`78989550`) sent red and white tests to the inbox selected by Lord James Follent. Both were received in Gmail and all 20 expected fields matched each corresponding profile, with no fallback or DOB. [Evidence and limitations](../shopify/wine-profile/messaging/proof-evidence.json) include source hashes and screenshots. Real customer-tag mapping, recipient-specific unsubscribe and subscriber-only automation require their own integration checks.

### Flow plan restriction discovered after the email proof

Shopify's current documentation restricts custom partner-app Flow tasks to Plus. This store is Basic, so the agreed custom **Wine Profile email requested** trigger is unavailable under the current plan. The proposed alternative is Flow's built-in **Customer tags added** trigger, filtered to a dedicated request tag added after saving and verifying the full profile. Lord James Follent's choice is pending; the original trigger requirement has not been silently replaced. [Plan restrictions](https://help.shopify.com/en/manual/shopify-flow), [custom trigger requirements](https://shopify.dev/docs/apps/build/flow/triggers/create), [built-in trigger](https://help.shopify.com/en/manual/shopify-flow/reference/triggers/customer-tags-added).

After received proofs pass:

1. Add the optional Email my profile action after on-page results.
2. Require Shopify customer sign-in only for saving/emailing. Preserve answers across the login handoff temporarily; exclude name, email and DOB, clear restored state and repeat age screening where needed.
3. Use a custom-distribution app with a signed app proxy and Cloudflare Worker. Validate authenticated customer identity server-side and regenerate the profile from validated answers.
4. Save a versioned profile snapshot in customer metafields and replace only the quiz's own tag namespace; preserve unrelated customer data and reject insufficient tag capacity.
5. Offer separate unchecked signup to non-subscribers and wait for confirmed subscription. Declining leaves results available.
6. Resolve the Flow plan restriction, then install/configure the approved trigger route. Carry the customer and submission ID through the workflow, trigger only after profile persistence, check current subscription and send with Messaging.
7. Prevent duplicate requests and concurrent profile mutation during processing. Record operational outcomes and show Email requested after acceptance, never unconfirmed delivery.

Shared authentication, CSRF, strict input validation, Shopify profile/tag persistence, request coordination, signed HTTP routes, optional storefront client, answer-only login handoff, Cloudflare wrapper and token refresh modules are implemented with 25 local tests. Seven additional tests verify authenticated read-only operator review, explicit reviewer access, data filtering, customer isolation and self-ID setup without granting review access. A disabled Worker bundle passes an actual local Cloudflare runtime smoke test, including review RPC, and Wrangler dry run. It is not deployed or connected to the installed quiz. App/credential provisioning, live operator authentication, privacy/deletion handling, live signup verification, delivery/completion adapters and actual integration QA remain incomplete. Both dashboards were rechecked on 22 October 2026: the app/Worker remain unprovisioned and Wrangler is signed out. On 21 October 2026, Lord James Follent deferred deployment and chose to handle Wrangler authorization himself; no authorization flow was opened. [Integration implementation record and authorization handoff](../shopify/wine-profile/integration/README.md). Sending stays disabled.

The optional results controls, sign-in restoration and separate unchecked native signup are now wired in the separate local Stage 2 section. Its Liquid output is disabled and is not installed in Shopify. The synthetic preview verifies subscriber/pending/declined states, blank identity fields after return, repeated adult screening, truthful acceptance, errors, mobile layout and restart during an in-flight request. Real Shopify authentication, signup/confirmation and delivery still require deployed integration checks. [Local controls and build instructions](../shopify/wine-profile/README.md#local-stage-2-controls).

## Verification and next action

68 local tests cover the original 26 rules, ten Shopify/Messaging checks, 25 backend/client checks and seven operator checks. They include disabled Stage 2 output, unchecked signup, 10,000 tag projections, Liquid rendering of 65 reports, existing customer tags, escaping/fallback, parser restrictions, signed identity, privacy, failed writes, full saved-data verification, consent changes, HTTP requests, token refresh, persisted duplicate/concurrent request handling and protected read-only review. Nine corruption scenarios confirm dispatch is blocked when saved snapshots, request metadata or tags differ. The actual Cloudflare runtime smoke test and deployment dry run pass. The received-email gate has passed for the recorded template; the sending release remains disabled.

Local and Shopify walkthroughs cover the quiz scenarios above. Actual contrasting test-email content has been verified in Gmail. Actual sign-in, customer-tag writes, subscription signup, retry/concurrency behaviour through deployed endpoints, automation failures, live unsubscribe and automatic delivery remain unverified.

Continue the shared integration work while the Flow-route decision and manual print check are pending. Installation records, review links, build commands and proof instructions are in [the implementation guide](../shopify/wine-profile/README.md). The original static prototype remains unchanged.
