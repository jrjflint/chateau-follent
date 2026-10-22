# Wine Profile authenticated integration

Owner: Lord James Follent. This directory contains tested backend modules and a compiled, disabled Worker bootstrap. It is not deployed and no Shopify app has been created or installed.

## Implemented

- `security.mjs` verifies Shopify app-proxy signatures, signed shop/customer identity and request freshness. It issues customer-bound CSRF tokens and bounds streamed JSON input. No customer identity is accepted from a submitted form.
- `profile-input.mjs` accepts versioned answer IDs and an adult-screen attestation, regenerates the full profile and compiled Messaging tags, rejects extra fields including name/email/DOB, and fingerprints canonical answers. Tag plans preserve unrelated tags and reserve capacity before writes.
- `shopify-admin.mjs` uses the documented 2026-10 customer email marketing-state field, atomic compare-and-set metafields, separate add/remove tag operations and read-back verification of the complete snapshot, request metadata and profile tags. A matching submission ID alone cannot pass verification. Failures return bounded error codes without copying Shopify's potentially private error messages.
- `request-coordinator.mjs` serialises requests for one customer, persists idempotency records and prevents profile changes while a request is processing. Pending subscription causes no profile writes. Consent is checked again after saving. An uncertain trigger outcome remains locked for review rather than being retried automatically. Its public status is `email_requested`, never delivered.
- `http-handler.mjs` provides signed context/request/status routes, no-store responses and CSRF enforcement. Its coordinator lookup uses only the signed identity; sending defaults to disabled.
- `worker-runtime.mjs` routes authenticated customers to separate persistent Durable Objects and checks the signed identity again inside each object. `worker.mjs` composes the actual Cloudflare entry point. The delivery adapter is omitted, so an environment flag alone cannot enable sending.
- `operator-auth.mjs`, `request-review.mjs` and `operations-page.mjs` provide read-only operator review. A fresh signed Shopify admin ID token and explicit server-side reviewer allowlist are required at both the HTTP and Durable Object boundaries. The view returns only request references, statuses, bounded error codes and timestamps. It never reads Shopify profiles, dispatches email, changes consent or unlocks a request.
- `access-token.mjs` implements cached, expiring client-credentials tokens for an installed app owned by the store's Shopify organisation. Actual eligibility and granted permissions must be verified when provisioning the app; this is not a token for other merchants' stores.
- `../../../assets/wine-profile/login-handoff.mjs` stores only allowlisted answer IDs for up to 20 minutes across sign-in, clears on restoration and requires adult screening again. Stage 1 does not import this module.
- `../../../assets/wine-profile/email-session.mjs` provides the optional storefront client, shares duplicate clicks, retains one submission ID across retries and gates submission on current sign-in/subscription. It sends answer IDs and adult attestation only, without name/email/DOB. It is not mounted in Stage 1.
- `../../../assets/wine-profile/email-panel.mjs` and `storefront-email-app.mjs` wire the optional results controls, sign-in restoration and native signup into a separate disabled section. They do not run in Stage 1. Synthetic browser QA covers subscriber gates, repeated screening, pending confirmation, decline, uncertain/failed requests and late-response cleanup. Actual Shopify form/authentication behaviour remains a release check.

The coordinator expects one persistent instance per customer Durable Object. Its storage contains only the latest 50 request IDs, fingerprints, statuses and timestamps; answers and profile text belong in Shopify's versioned snapshot. The delivery adapter is intentionally not chosen before the plan restriction below is resolved.

## Required route decision

The store is on Basic. Shopify documents that custom partner-app Flow tasks require Plus, so the approved custom `Wine Profile email requested` trigger cannot be deployed on this store's current plan. [Shopify Flow plan requirements](https://help.shopify.com/en/manual/shopify-flow), [custom trigger requirements](https://shopify.dev/docs/apps/build/flow/triggers/create).

A proposed Basic-compatible route is the built-in **Customer tags added** trigger, filtered to a dedicated request tag that is added only after the complete profile has been saved and verified. The workflow can then check subscription and use Messaging's **Send Marketing Email** action. This changes the agreed trigger implementation and awaits Lord James Follent's choice; it has not been enabled or substituted silently. [Built-in trigger](https://help.shopify.com/en/manual/shopify-flow/reference/triggers/customer-tags-added), [Messaging connector](https://help.shopify.com/en/manual/shopify-flow/reference/connectors/apps).

## Remaining implementation and release requirements

1. Resolve the trigger route, then implement its dispatch and completion adapter. A completion marker must refer to the same submission. Validate that the Messaging action has frozen the intended content before allowing another profile to change its tags.
2. Deployment is deferred at Lord James Follent's request (21 October 2026); he will handle Cloudflare authorization. After a later instruction to proceed, provision the custom-distribution app and Worker with the required Shopify permissions and server-side secrets. The shared Worker/Durable Object wrapper, token refresh provider, read-only review and disabled deployment configuration are prepared. Real operator authentication/permissions and customer-data deletion/retention handling remain release requirements.
3. Install the prepared separate Stage 2 section after backend/automation configuration, then verify actual sign-in return and unchecked native Shopify marketing signup; wait for the backend to observe `SUBSCRIBED`. Its controls are wired locally but generated disabled. The prototype and installed Stage 1 continue to show results without requesting sign-in or subscription.
4. Run actual authenticated customer writes and real customer-tag Messaging tests. Test signed-out, pending, declined, withdrawn consent, duplicate/retried requests, concurrent edits, partial updates, interrupted processing and automation errors. Verify recipient-specific unsubscribe and received content in the live automation.
5. Complete controlled-customer release checks before enabling email requests. The local release record remains disabled and is not a deployed runtime flag.

## Verification

The actual customer, tag-add/remove and metafield-write operations also pass Shopify's public GraphQL schema validator against **2026-10**. The two provisioning operations below were validated separately. [Schema evidence](../qa/shopify-schema-validation.json). This is not an authenticated permission or mutation test.

## Customer metafield provisioning

Before saving the first profile, use the named inspection query in [metafield-definitions.graphql](metafield-definitions.graphql). Both `snapshot` and `request` must be customer-owned JSON definitions in `chateau_wine_profile`, with Storefront and Customer Account access set to `NONE`. If a definition already exists, verify its type/access instead of replacing it. Create only missing definitions after the app is installed; check each mutation alias's `userErrors` and then inspect again. The two aliases are not an atomic installation. No provisioning operation has been executed.

This merchant-owned namespace is deliberate because the planned Flow completion step must access the request metadata across apps. Shopify's normal app-owned TOML namespace would change that access contract. Profile values are subsequently written using the existing compare-and-set `metafieldsSet` operation, then retrieved and fully checked before dispatch. [Metafield definitions and ownership](https://shopify.dev/docs/apps/build/metafields/definitions).

Deletion and timed retention remain unimplemented. [Data lifecycle checklist](data-lifecycle.md) records each stored surface, required coordination with pending email work and acceptance checks before customer collection. The current 50-record history bound is not a time-based retention policy.

## Local tests

```powershell
node --test --test-isolation=none tests/wine-profile-integration.test.mjs tests/wine-profile-operations.test.mjs
```

Twenty-five tests cover authentication tampering/expiry, CSRF binding, DOB/identity rejection, answer-only restoration, capacity, failed writes, complete saved-data verification, duplicate/concurrent submissions, subscription changes, persisted idempotency, interrupted/uncertain outcomes, HTTP/client behaviour, customer-scoped runtime routing, token refresh and disabled sending. Nine read-back corruption scenarios prove that changed/missing snapshots, request metadata or tags prevent dispatch. Shopify API calls and dispatch are mocked here; these tests do not establish deployed integration or actual API permission availability.

Seven further operator tests cover signed-token claims/tampering/expiry, the reviewer allowlist, bounded data projection, read-only HTTP/RPC behaviour, customer isolation, identity-only setup and the page security policy. The actual Cloudflare runtime test exercises an authenticated HTTP lookup through the real Durable Object review RPC, signed self-identity lookup, plus rejected unsigned/unlisted review requests, with zero outbound requests. Nonempty review histories and direct cross-customer review calls are covered in the local unit tests; real embedded Shopify authentication is still unverified.

## Request review and recovery

The default `WINE_PROFILE_REVIEWER_IDS` value is empty, so request-history access is closed. After the app is installed, configure its embedded app home at the deployed Worker root, the public `SHOPIFY_CLIENT_ID` and server-side `SHOPIFY_CLIENT_SECRET`. Open the setup screen inside Shopify and choose **Show my Shopify user ID**. `/operations/identity` verifies that signed-in admin session and returns only its own user ID; it does not allocate customer storage or grant review access. The owner can then configure a comma-separated reviewer allowlist using the verified intended operator IDs. These are operator IDs, not customer IDs; do not grant all staff access by default.

The page obtains a fresh App Bridge ID token for each lookup and posts it only to this Worker's `/operations/requests` endpoint in the Authorization header. It disables App Bridge's automatic fetch interceptor because the client handles authentication and timeouts explicitly. Tokens are not stored in cookies, browser storage, URLs or logs. The backend verifies HS256, audience, issuer/destination, validity times and the reviewer allowlist; query parameters or storefront app-proxy signatures cannot authorize this endpoint. [Shopify ID token validation](https://shopify.dev/docs/apps/build/authentication-authorization/id-tokens), [App Bridge configuration](https://shopify.dev/docs/api/app-home/latest/apis/authentication-and-data/config-api).

The public HTML shell contains no request data. Once the app client ID and shop are configured, its CSP allows framing only by this shop and Shopify admin, including the setup screen while the reviewer allowlist is empty. Without that app identity, framing is disabled. Neither a self-ID lookup nor the storefront sending flag authorizes request-history access. [Shopify iframe protection](https://shopify.dev/docs/apps/build/security/set-up-iframe-protection).

For a request needing review, enter its Shopify customer ID and match the returned submission reference to the Flow run. Check both automation and Messaging before resolving an uncertain outcome. `accepted` means requested, and `processed` does not establish inbox delivery. Preparing/dispatching may indicate an in-flight or interrupted request; viewing it does not change that state. Keep uncertain requests locked. This screen has no resend, unlock, consent-change or deletion controls; the approved completion adapter must release only the matching submission after content is frozen.

```powershell
node tools/build-wine-profile-operations-preview.mjs
```

Open `http://127.0.0.1:3087/shopify/wine-profile/qa/operations-preview.html` for the labelled synthetic UI simulation, or `operations-setup-preview.html` in the same directory for setup with request access closed. Chrome checks covered locked review, empty history, denied access, service failure, keyboard lookup, clearing previous-customer rows and self-ID lookup with no customer lookup form. These previews do not authenticate with Shopify or fetch customer data. [Screenshot](../qa/wine-profile-operations-review.png).

## Deployment preparation

The Shopify Dev Dashboard is accessible in the Chateau Follent organisation and currently has no apps. The existing Cloudflare Workers account is also accessible, with the `james-follent.workers.dev` subdomain. `wrangler.toml` explicitly targets that account and the new `chateau-wine-profile` service; it does not change the existing Workers or DNS. The intended service has not been created.

Install the pinned build/QA tools outside the repository, then build and test:

```powershell
npm install --prefix "$env:TEMP/chateau-wine-profile-build-qa" --no-save --package-lock=false esbuild@0.28.2 miniflare@4.20260730.0 wrangler@4.151.3
node tools/build-wine-profile-worker.mjs
node tools/check-wine-profile-worker.mjs
node "$env:TEMP/chateau-wine-profile-build-qa/node_modules/wrangler/bin/wrangler.js" deploy --dry-run --config shopify/wine-profile/integration/wrangler.toml
```

The actual Miniflare/workerd smoke test passes with SQLite-backed Durable Objects, signed requests, customer isolation and authenticated read-only review RPC. Outbound network access is blocked and zero outbound requests occur. Wrangler's dry run also passes; its upload bundle hash matches the exact artifact used by the runtime test. The configuration uses `no_bundle` so deployment uses this reviewed artifact. Rebuild and rerun these checks after changing backend source. Cloudflare's development skills were used for the review on 22 October 2026; current Workers types `5.20261021.1` were retrieved and Wrangler binding/runtime types were generated into the temporary QA directory. The runtime remains pinned to the tested compatibility date.

Evidence: [runtime smoke](../qa/worker-runtime.json), [deployment preflight](../qa/worker-deployment-preflight.json), [bundle metadata](dist/bundle-info.json).

Wrangler was still unauthenticated on 22 October 2026. The accessible Cloudflare dashboard listed only the two unrelated existing applications, and the Shopify Dev Dashboard still showed no apps. Automatic approval review previously rejected `wrangler login --scopes-list` as a possible authorization/credential change. The available scopes were inspected from local CLI source without opening authentication. On 21 October 2026, Lord James Follent chose to handle authorization himself and defer deployment. No authorization flow, API token, OAuth grant or Shopify permission was created during this work. Cloudflare requires CLI deployment for the Durable Object class setup. [Deployment requirements](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/).

When ready, Lord James Follent can run the following in PowerShell after installing the pinned tools above. This opens Cloudflare authorization and saves a local credential; it does not deploy the Worker. The requested account/user read and `workers_scripts:write` permissions apply across the account, although the prepared deployment targets only the new Worker.

```powershell
node "$env:TEMP/chateau-wine-profile-build-qa/node_modules/wrangler/bin/wrangler.js" login --scopes account:read user:read workers_scripts:write
node "$env:TEMP/chateau-wine-profile-build-qa/node_modules/wrangler/bin/wrangler.js" whoami
```

Authorization alone is not an instruction to deploy or enable sending. The Flow-route choice and remaining integration/release checks above still apply.

Keep `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` in Cloudflare's server-side secret storage. No credentials are embedded in the bundle. Local secret and Wrangler-state files are ignored by Git. The bootstrap cannot send even if `EMAIL_REQUESTS_ENABLED` is mistakenly set to true; the approved adapter and subsequent integration/release checks are still required.

Primary implementation references: [signed app proxies](https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies), [customer email marketing state](https://shopify.dev/docs/api/admin-graphql/latest/objects/CustomerEmailAddress), [atomic compare-and-set metafields](https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsSet), [Workers Node crypto support](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/), [own-organisation token grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant).
