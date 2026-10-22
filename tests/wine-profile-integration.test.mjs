import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { authenticateProxy, proxyMessage, issueCsrf, verifyCsrf, readJson } from '../shopify/wine-profile/integration/security.mjs';
import { validateProfileRequest, planProfileTags } from '../shopify/wine-profile/integration/profile-input.mjs';
import { rememberForLogin, restoreAfterLogin } from '../assets/wine-profile/login-handoff.mjs';
import { ShopifyAdmin } from '../shopify/wine-profile/integration/shopify-admin.mjs';
import { ProfileRequestCoordinator } from '../shopify/wine-profile/integration/request-coordinator.mjs';
import { createHandler } from '../shopify/wine-profile/integration/http-handler.mjs';
import { createEmailSession } from '../assets/wine-profile/email-session.mjs';
import { createWorkerRuntime } from '../shopify/wine-profile/integration/worker-runtime.mjs';
import { createClientCredentialsTokenProvider } from '../shopify/wine-profile/integration/access-token.mjs';

const fixtures = JSON.parse(await readFile(new URL('../shopify/wine-profile/messaging/proof-fixtures.json', import.meta.url), 'utf8'));
const registry = JSON.parse(await readFile(new URL('../shopify/wine-profile/messaging/content-registry.json', import.meta.url), 'utf8'));
const secret = 'synthetic-test-secret';
const shop = 'tvump1-7j.myshopify.com';
const now = Date.UTC(2026, 9, 21, 9, 30);
const identity = { shop, customerId: '12345' };
function signedUrl(change = {}) {
  const url = new URL('https://synthetic.invalid/proxy/context');
  for (const [key, value] of Object.entries({ shop, logged_in_customer_id: '12345', timestamp: String(now / 1000), path_prefix: '/apps/wine-profile', ...change })) url.searchParams.set(key, value);
  url.searchParams.append('extra', '1'); url.searchParams.append('extra', '2');
  url.searchParams.set('signature', createHmac('sha256', secret).update(proxyMessage(url.searchParams)).digest('hex'));
  return url;
}
const errorCode = (code) => (error) => error.code === code;

test('proxy verification matches Shopify signature construction and derives authenticated identity', () => {
  const official = new URLSearchParams('extra=1&extra=2&shop={shop}.myshopify.com&logged_in_customer_id=1&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555');
  assert.equal(proxyMessage(official), 'extra=1,2logged_in_customer_id=1path_prefix=/apps/awesome_reviewsshop={shop}.myshopify.comtimestamp=1317327555');
  // The documentation masks the shop name; this vector signs its literal placeholder.
  assert.equal(createHmac('sha256', 'hush').update(proxyMessage(official)).digest('hex'), 'e71d571c0a35d531ae367189d59afd33ae5b56be274c77c9e8bd6ce42e256304');
  assert.deepEqual(authenticateProxy(signedUrl(), { secret, shop, now }), identity);
  assert.equal(authenticateProxy(signedUrl({ logged_in_customer_id: '' }), { secret, shop, now }).customerId, null);
  const tampered = signedUrl(); tampered.searchParams.set('logged_in_customer_id', '67890');
  assert.throws(() => authenticateProxy(tampered, { secret, shop, now }), errorCode('invalid_proxy'));
  const duplicate = signedUrl(); duplicate.searchParams.append('logged_in_customer_id', '67890');
  assert.throws(() => authenticateProxy(duplicate, { secret, shop, now }), errorCode('invalid_proxy'));
  assert.throws(() => authenticateProxy(signedUrl({ shop: 'other.myshopify.com' }), { secret, shop, now }), errorCode('wrong_shop'));
  assert.throws(() => authenticateProxy(signedUrl(), { secret, shop, now: now + 301000 }), errorCode('expired_proxy'));
});

test('CSRF token is bounded, expires and cannot be transferred between customers or shops', () => {
  const token = issueCsrf(identity, secret, now);
  assert.doesNotThrow(() => verifyCsrf(token, identity, secret, now + 1000));
  for (const changed of [{ ...identity, customerId: '67890' }, { ...identity, shop: 'other.myshopify.com' }, { shop, customerId: null }]) {
    assert.throws(() => verifyCsrf(token, changed, secret, now), errorCode('invalid_csrf'));
  }
  assert.throws(() => verifyCsrf(token, identity, secret, now + 601000), errorCode('invalid_csrf'));
  assert.throws(() => verifyCsrf(token + 'x', identity, secret, now), errorCode('invalid_csrf'));
});

test('backend regenerates results and rejects identity, DOB, forged answers and unscreened requests', () => {
  const input = { quizVersion: '1.0.0', submissionId: 'b071de22-67bd-40fe-8dbb-abf906f2c122', adultConfirmed: true, answers: fixtures.red.answers, csrfToken: 'separately-verified' };
  const result = validateProfileRequest(input, registry);
  assert.deepEqual(result.profile, fixtures.red.profile);
  assert.deepEqual(result.tags, fixtures.red.tags);
  for (const field of ['customerId', 'email', 'name', 'dob', 'date_of_birth', 'profile']) assert.throws(() => validateProfileRequest({ ...input, [field]: 'forged' }, registry), errorCode('unexpected_field'));
  assert.throws(() => validateProfileRequest({ ...input, adultConfirmed: false }, registry), errorCode('adult_screen_required'));
  assert.throws(() => validateProfileRequest({ ...input, answers: { ...input.answers, dob: '1990-05-12' } }, registry), errorCode('invalid_answers'));
  assert.throws(() => validateProfileRequest({ ...input, answers: { ...input.answers, wine_interests: ['forged'] } }, registry), errorCode('invalid_answers'));
  assert.equal(validateProfileRequest({ ...input, answers: { ...input.answers, flavour_preferences: [...input.answers.flavour_preferences].reverse() } }, registry).fingerprint, result.fingerprint);
});

test('tag operations preserve unrelated data and reject insufficient capacity before any write', () => {
  const existing = ['VIP', 'manual-note', 'cfwp0_9_0:title:old', ...fixtures.white.tags];
  const operations = planProfileTags(existing, fixtures.red.tags);
  assert.deepEqual(operations.unrelated, ['VIP', 'manual-note']);
  assert.ok(operations.remove.includes('cfwp0_9_0:title:old'));
  assert.deepEqual(operations.add, fixtures.red.tags);
  assert.throws(() => planProfileTags(Array.from({ length: 220 }, (_, i) => 'other-' + i), fixtures.red.tags), errorCode('customer_tag_capacity'));
});

test('login handoff stores only answer IDs, clears on restoration and requires repeat adult screening', () => {
  const saved = new Map();
  const storage = { setItem: (key, value) => saved.set(key, value), getItem: (key) => saved.get(key) ?? null, removeItem: (key) => saved.delete(key) };
  rememberForLogin(storage, { ...fixtures.white.answers, name: 'Sensitive name', email: 'private@example.com', dob: '1990-05-12' }, now);
  assert.doesNotMatch([...saved.values()][0], /Sensitive|private|1990|email|dob|name/);
  const restored = restoreAfterLogin(storage, now + 1000);
  assert.deepEqual(restored.answers, fixtures.white.answers);
  assert.equal(restored.adultScreenRequired, true);
  assert.equal(saved.size, 0);
  assert.equal(restoreAfterLogin(storage, now), null);
  rememberForLogin(storage, fixtures.red.answers, now);
  assert.equal(restoreAfterLogin(storage, now + 21 * 60000), null);
  assert.equal(saved.size, 0);
  saved.set('cf-wine-profile-login-v1', '{invalid');
  assert.equal(restoreAfterLogin(storage, now), null);
  assert.equal(saved.size, 0);
});

test('JSON reader rejects unexpected content, malformed data and oversized streamed bodies', async () => {
  const request = (body, headers = {}) => new Request('https://synthetic.invalid', { method: 'POST', body, headers: { 'content-type': 'application/json', ...headers } });
  assert.deepEqual(await readJson(request('{"test":true}')), { test: true });
  await assert.rejects(readJson(request('{bad')), errorCode('invalid_json'));
  await assert.rejects(readJson(request('{}', { 'content-type': 'text/plain' })), errorCode('json_required'));
  await assert.rejects(readJson(request('x'.repeat(8193))), errorCode('request_too_large'));
});

test('customer persistence uses compare-and-set metadata, preserves unrelated tags and verifies readiness', async () => {
  const validated = validateProfileRequest({ quizVersion: '1.0.0', submissionId: 'b071de22-67bd-40fe-8dbb-abf906f2c122', adultConfirmed: true, answers: fixtures.red.answers }, registry);
  const calls = [];
  const current = { id: 'gid://shopify/Customer/12345', tags: ['VIP', ...fixtures.white.tags], profile: { compareDigest: 'old-profile' }, request: { compareDigest: 'old-request' } };
  const admin = new ShopifyAdmin({ shop, accessToken: 'synthetic-token', fetcher: async (url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    assert.equal(url, `https://${shop}/admin/api/2026-10/graphql.json`);
    assert.equal(options.headers['X-Shopify-Access-Token'], 'synthetic-token');
    let data;
    if (body.query.includes('metafieldsSet')) data = { metafieldsSet: { metafields: [], userErrors: [] } };
    else if (body.query.includes('tagsRemove')) data = { tagsRemove: { userErrors: [] } };
    else if (body.query.includes('tagsAdd')) data = { tagsAdd: { userErrors: [] } };
    else data = { customer: { ...current, tags: ['VIP', ...validated.tags], ...Object.fromEntries(calls[0].variables.metafields.map((field) => [field.key === 'snapshot' ? 'profile' : field.key, { value: field.value }])) } };
    return Response.json({ data });
  } });
  const saved = await admin.persistProfile('12345', validated, current, new Date(now));
  assert.ok(saved.tags.includes('VIP'));
  assert.equal(calls.length, 4);
  assert.deepEqual(calls[0].variables.metafields.map((field) => field.compareDigest), ['old-profile', 'old-request']);
  assert.doesNotMatch(JSON.stringify(calls[0].variables), /email|date_of_birth|dob|1990/);
  assert.ok(!calls[1].variables.tags.includes('VIP'));
  assert.deepEqual(calls[2].variables.tags, validated.tags);
  assert.ok(calls.every((call) => !call.query.includes('flowTriggerReceive')));
});

test('read-back corruption prevents dispatch even when the submission ID and tags match', async () => {
  const validated = profileRequest();
  const corruptionCases = [
    (saved) => { saved.profile = undefined; },
    (saved) => { saved.profile.value = '{invalid'; },
    (saved) => { const value = JSON.parse(saved.profile.value); delete value.answers; saved.profile.value = JSON.stringify(value); },
    (saved) => { const value = JSON.parse(saved.profile.value); value.profile = fixtures.white.profile; saved.profile.value = JSON.stringify(value); },
    (saved) => { const value = JSON.parse(saved.profile.value); value.quiz_version = '0.9.0'; saved.profile.value = JSON.stringify(value); },
    (saved) => { saved.request = undefined; },
    (saved) => { const value = JSON.parse(saved.request.value); value.submission_id = 'different'; saved.request.value = JSON.stringify(value); },
    (saved) => { const value = JSON.parse(saved.request.value); value.status = 'processed'; saved.request.value = JSON.stringify(value); },
    (saved) => { saved.tags = saved.tags.slice(1); },
  ];
  for (const corrupt of corruptionCases) {
    const fixture = coordinatorFixture();
    let written;
    const admin = new ShopifyAdmin({ shop, accessToken: 'synthetic-token', fetcher: async (url, options) => {
      const { query, variables } = JSON.parse(options.body);
      if (query.includes('metafieldsSet')) {
        written = variables.metafields;
        return Response.json({ data: { metafieldsSet: { metafields: [], userErrors: [] } } });
      }
      const operation = ['tagsRemove', 'tagsAdd'].find((name) => query.includes(name));
      if (operation) return Response.json({ data: { [operation]: { userErrors: [] } } });
      const saved = { ...fixture.customer, tags: [...validated.tags], ...Object.fromEntries(written.map((field) => [field.key === 'snapshot' ? 'profile' : field.key, { value: field.value }])) };
      corrupt(saved);
      return Response.json({ data: { customer: saved } });
    } });
    fixture.dependencies.admin.persistProfile = (...args) => admin.persistProfile(...args);
    const result = await fixture.coordinator.request(validated);
    assert.equal(result.status, 'failed');
    assert.equal(result.code, 'profile_verification_failed');
    assert.equal(fixture.counters.dispatches, 0);
  }
});

test('failed metadata writes stop before tag mutation and API errors never expose returned private text', async () => {
  const validated = validateProfileRequest({ quizVersion: '1.0.0', submissionId: 'b071de22-67bd-40fe-8dbb-abf906f2c122', adultConfirmed: true, answers: fixtures.red.answers }, registry);
  let calls = 0;
  const admin = new ShopifyAdmin({ shop, accessToken: 'synthetic-token', fetcher: async () => {
    calls += 1;
    return Response.json({ data: { metafieldsSet: { userErrors: [{ message: 'private@example.com changed this field', code: 'INVALID_COMPARE_DIGEST' }] } } });
  } });
  await assert.rejects(admin.persistProfile('12345', validated, { tags: ['VIP'] }, new Date(now)), errorCode('profile_update_conflict'));
  assert.equal(calls, 1);
  const failed = new ShopifyAdmin({ shop, accessToken: 'synthetic-token', fetcher: async () => Response.json({ errors: [{ message: 'private@example.com' }] }) });
  await assert.rejects(failed.customer('12345'), (error) => error.code === 'shopify_api_error' && !error.message.includes('@'));
});

function coordinatorFixture({ subscribed = true, dispatch = async () => ({ accepted: true }), enabled = true } = {}) {
  let state;
  const counters = { reads: 0, writes: 0, dispatches: 0 };
  const customer = { id: 'gid://shopify/Customer/12345', tags: [], defaultEmailAddress: { marketingState: subscribed ? 'SUBSCRIBED' : 'PENDING' } };
  const storage = { get: async () => state ? structuredClone(state) : undefined, put: async (key, value) => { state = structuredClone(value); } };
  const admin = { customer: async () => { counters.reads += 1; return structuredClone(customer); }, persistProfile: async () => { counters.writes += 1; return structuredClone(customer); } };
  const dependencies = { storage, admin, customerId: '12345', enabled, clock: () => new Date(now), dispatch: async (payload) => { counters.dispatches += 1; return dispatch(payload); } };
  return { coordinator: new ProfileRequestCoordinator(dependencies), dependencies, counters, customer, getState: () => state };
}
const profileRequest = (submissionId = 'b071de22-67bd-40fe-8dbb-abf906f2c122') => validateProfileRequest({ quizVersion: '1.0.0', submissionId, adultConfirmed: true, answers: fixtures.red.answers }, registry);

test('concurrent duplicate clicks dispatch once and prevent changing a profile during processing', async () => {
  let finish, entered;
  const started = new Promise((resolve) => { entered = resolve; });
  const pending = new Promise((resolve) => { finish = resolve; });
  const fixture = coordinatorFixture({ dispatch: async () => { entered(); await pending; return { accepted: true }; } });
  const first = fixture.coordinator.request(profileRequest());
  await started;
  const duplicate = fixture.coordinator.request(profileRequest());
  const changed = fixture.coordinator.request(profileRequest('d071de22-67bd-40fe-8dbb-abf906f2c122'));
  finish();
  const results = await Promise.allSettled([first, duplicate, changed]);
  assert.equal(results[0].value.status, 'email_requested');
  assert.deepEqual(results[1].value, results[0].value);
  assert.equal(results[2].reason.code, 'profile_request_processing');
  assert.equal(fixture.counters.writes, 1);
  assert.equal(fixture.counters.dispatches, 1);
  const restarted = new ProfileRequestCoordinator(fixture.dependencies);
  assert.equal((await restarted.request(profileRequest())).status, 'email_requested');
  assert.equal(fixture.counters.dispatches, 1);
  assert.doesNotMatch(JSON.stringify(fixture.getState()), /wine_interests|profile"|email|dob|1990/);
});

test('pending or declined subscription does not save a profile or invoke delivery', async () => {
  const fixture = coordinatorFixture({ subscribed: false });
  assert.equal((await fixture.coordinator.request(profileRequest())).status, 'needs_subscription');
  assert.equal(fixture.counters.writes, 0);
  assert.equal(fixture.counters.dispatches, 0);
  fixture.customer.defaultEmailAddress.marketingState = 'SUBSCRIBED';
  assert.equal((await fixture.coordinator.request(profileRequest())).status, 'email_requested');
  assert.equal(fixture.counters.dispatches, 1);
  const withdrawn = coordinatorFixture();
  withdrawn.dependencies.admin.persistProfile = async () => ({ ...withdrawn.customer, defaultEmailAddress: { marketingState: 'UNSUBSCRIBED' } });
  assert.equal((await withdrawn.coordinator.request(profileRequest())).status, 'needs_subscription');
  assert.equal(withdrawn.counters.dispatches, 0);
});

test('failed saving can be retried but an uncertain automation outcome remains locked for review', async () => {
  const fixture = coordinatorFixture();
  fixture.dependencies.admin.persistProfile = async () => { throw Object.assign(new Error('redacted'), { code: 'customer_tags_failed' }); };
  assert.equal((await fixture.coordinator.request(profileRequest())).status, 'failed');
  assert.equal(fixture.counters.dispatches, 0);
  assert.equal(fixture.getState().active, null);
  fixture.dependencies.admin.persistProfile = async () => fixture.customer;
  assert.equal((await fixture.coordinator.request(profileRequest())).status, 'email_requested');
  const uncertain = coordinatorFixture({ dispatch: async () => { throw new Error('timeout after possible acceptance'); } });
  assert.equal((await uncertain.coordinator.request(profileRequest())).status, 'review');
  assert.equal((await uncertain.coordinator.request(profileRequest())).status, 'review');
  assert.equal(uncertain.counters.dispatches, 1);
  await assert.rejects(uncertain.coordinator.request(profileRequest('d071de22-67bd-40fe-8dbb-abf906f2c122')), errorCode('profile_request_processing'));
});

test('Flow processing outcome releases only the matching submission and never claims inbox delivery', async () => {
  const fixture = coordinatorFixture();
  const first = profileRequest();
  await fixture.coordinator.request(first);
  fixture.customer.request = { value: JSON.stringify({ submission_id: 'not-the-same-request', status: 'processed' }) };
  await assert.rejects(fixture.coordinator.request(profileRequest('d071de22-67bd-40fe-8dbb-abf906f2c122')), errorCode('profile_request_processing'));
  fixture.customer.request = { value: JSON.stringify({ submission_id: first.submissionId, status: 'processed' }) };
  assert.equal((await fixture.coordinator.status(first.submissionId)).status, 'email_requested');
  assert.equal(fixture.getState().active, null);
  assert.equal((await fixture.coordinator.request(profileRequest('d071de22-67bd-40fe-8dbb-abf906f2c122'))).status, 'email_requested');
  assert.equal(fixture.counters.dispatches, 2);
});

test('disabled integration performs no customer reads or writes', async () => {
  const fixture = coordinatorFixture({ enabled: false });
  await assert.rejects(fixture.coordinator.request(profileRequest()), errorCode('email_requests_disabled'));
  assert.deepEqual(fixture.counters, { reads: 0, writes: 0, dispatches: 0 });
});

test('HTTP requests derive customer identity from Shopify, require CSRF and never return delivery promises', async () => {
  const fixture = coordinatorFixture();
  const seenIdentities = [];
  const handler = createHandler({ shop, secret, registry, admin: fixture.dependencies.admin, enabled: true, clock: () => new Date(now), coordinatorFor: async (seen) => { seenIdentities.push(seen); return fixture.coordinator; } });
  const context = await handler(new Request(signedUrl()));
  assert.match(context.headers.get('cache-control'), /no-store/);
  const { csrfToken, subscriptionState } = await context.json();
  assert.equal(subscriptionState, 'SUBSCRIBED');
  const url = signedUrl(); url.pathname = '/proxy/request';
  const body = { quizVersion: '1.0.0', submissionId: profileRequest().submissionId, adultConfirmed: true, answers: fixtures.red.answers, csrfToken };
  const post = (input) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  const bad = await handler(post({ ...body, customerId: '67890' }));
  assert.equal(bad.status, 400);
  assert.equal(fixture.counters.writes, 0);
  const noCsrf = await handler(post({ ...body, csrfToken: '' }));
  assert.equal(noCsrf.status, 403);
  const accepted = await handler(post(body));
  assert.equal(accepted.status, 202);
  assert.deepEqual(await accepted.json(), { submissionId: body.submissionId, status: 'email_requested' });
  assert.deepEqual(seenIdentities, [identity]);
  assert.equal(fixture.counters.dispatches, 1);
});

test('signed-out and disabled HTTP requests cannot save or send', async () => {
  const fixture = coordinatorFixture();
  const handler = createHandler({ shop, secret, registry, admin: fixture.dependencies.admin, coordinatorFor: () => { throw new Error('Must not create a coordinator'); }, clock: () => new Date(now) });
  assert.deepEqual(await (await handler(new Request(signedUrl({ logged_in_customer_id: '' })))).json(), { signedIn: false, emailRequestsAvailable: false });
  const requestUrl = signedUrl(); requestUrl.pathname = '/proxy/request';
  assert.equal((await handler(new Request(requestUrl, { method: 'POST' }))).status, 503);
  const anonymous = signedUrl({ logged_in_customer_id: '' }); anonymous.pathname = '/proxy/request';
  assert.equal((await handler(new Request(anonymous, { method: 'POST' }))).status, 401);
  assert.deepEqual(fixture.counters, { reads: 0, writes: 0, dispatches: 0 });
});

test('storefront client sends only validated answer IDs and shares one request across duplicate clicks', async () => {
  const calls = [];
  const id = profileRequest().submissionId;
  const session = createEmailSession({ answers: { ...fixtures.red.answers, name: 'Private name', email: 'private@example.com', dob: '1990-05-12' }, adultConfirmed: true, randomId: () => id, fetcher: async (path, options) => {
    calls.push({ path, options });
    return path.endsWith('/context') ? Response.json({ signedIn: true, emailRequestsAvailable: true, subscriptionState: 'SUBSCRIBED', csrfToken: 'synthetic-csrf' }) : Response.json({ submissionId: id, status: 'email_requested' }, { status: 202 });
  } });
  const [first, second] = await Promise.all([session.requestEmail(), session.requestEmail()]);
  assert.deepEqual(first, second);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].path, '/apps/wine-profile/request');
  const body = JSON.parse(calls[1].options.body);
  assert.deepEqual(body.answers, fixtures.red.answers);
  assert.doesNotMatch(calls[1].options.body, /Private|private@example|1990|dob|email|name/);
  assert.equal(calls[1].options.credentials, 'same-origin');
});

test('storefront client retains one submission ID on retry and never converts a timeout into success', async () => {
  const ids = [];
  let requests = 0;
  const id = profileRequest().submissionId;
  const session = createEmailSession({ answers: fixtures.red.answers, adultConfirmed: true, randomId: () => id, fetcher: async (path, options) => {
    if (path.endsWith('/context')) return Response.json({ signedIn: true, emailRequestsAvailable: true, subscriptionState: 'SUBSCRIBED', csrfToken: 'synthetic-csrf' });
    requests += 1; ids.push(JSON.parse(options.body).submissionId);
    if (requests === 1) throw new Error('network outcome unknown');
    return Response.json({ status: 'email_requested', submissionId: id }, { status: 202 });
  } });
  await assert.rejects(session.requestEmail(), errorCode('request_not_confirmed'));
  assert.equal((await session.requestEmail()).status, 'email_requested');
  assert.deepEqual(ids, [id, id]);
});

test('storefront signed-out, pending and declined states never post a profile', async () => {
  for (const context of [
    { signedIn: false, emailRequestsAvailable: true },
    { signedIn: true, emailRequestsAvailable: true, subscriptionState: 'PENDING' },
    { signedIn: true, emailRequestsAvailable: true, subscriptionState: 'UNSUBSCRIBED' },
  ]) {
    let calls = 0;
    const session = createEmailSession({ answers: fixtures.red.answers, adultConfirmed: true, fetcher: async (path, options) => { calls += 1; assert.ok(!options.method); return Response.json(context); } });
    const result = await session.requestEmail();
    assert.ok(['sign_in_required', 'needs_subscription'].includes(result.status));
    if (context.signedIn) assert.equal(result.subscriptionState, context.subscriptionState);
    assert.equal(calls, 1);
  }
});

test('an interrupted persisted request becomes reviewable after restart and is never resent', async () => {
  const fixture = coordinatorFixture();
  const validated = profileRequest();
  await fixture.dependencies.storage.put('requests', { active: validated.submissionId, records: [{ submissionId: validated.submissionId, fingerprint: validated.fingerprint, status: 'dispatching' }] });
  const restarted = new ProfileRequestCoordinator(fixture.dependencies);
  const result = await restarted.status(validated.submissionId);
  assert.equal(result.status, 'review');
  assert.equal(result.code, 'interrupted_request');
  assert.equal((await restarted.request(validated)).status, 'review');
  assert.equal(fixture.counters.dispatches, 0);
  assert.equal(fixture.counters.writes, 0);
});

test('storefront-to-signed-HTTP integration keeps retries idempotent and blocks edits until the matching outcome', async () => {
  const fixture = coordinatorFixture();
  const handler = createHandler({ shop, secret, registry, admin: fixture.dependencies.admin, enabled: true, clock: () => new Date(now), coordinatorFor: async (seen) => { assert.deepEqual(seen, identity); return fixture.coordinator; } });
  const storefrontTransport = async (path, options) => {
    const storefrontUrl = new URL(path, `https://${shop}`);
    const proxyUrl = signedUrl(Object.fromEntries(storefrontUrl.searchParams));
    proxyUrl.pathname = storefrontUrl.pathname.replace('/apps/wine-profile', '/proxy');
    return handler(new Request(proxyUrl, options));
  };
  const first = createEmailSession({ answers: fixtures.red.answers, adultConfirmed: true, randomId: () => profileRequest().submissionId, fetcher: storefrontTransport });
  assert.equal((await first.requestEmail()).status, 'email_requested');
  assert.equal((await first.requestEmail()).status, 'email_requested');
  assert.equal(fixture.counters.dispatches, 1);
  const next = createEmailSession({ answers: fixtures.white.answers, adultConfirmed: true, randomId: () => 'd071de22-67bd-40fe-8dbb-abf906f2c122', fetcher: storefrontTransport });
  await assert.rejects(next.requestEmail(), errorCode('profile_request_processing'));
  fixture.customer.request = { value: JSON.stringify({ submission_id: first.submissionId, status: 'processed' }) };
  assert.equal((await first.checkStatus()).status, 'email_requested');
  assert.equal((await next.requestEmail()).status, 'email_requested');
  assert.equal(fixture.counters.dispatches, 2);
});

function workerFixture({ adapter = true, enabled = true } = {}) {
  const stores = new Map(), actors = new Map(), contexts = new Map();
  const owners = [], dispatches = [];
  const env = { SHOPIFY_SHOP: shop, SHOPIFY_CLIENT_SECRET: secret, EMAIL_REQUESTS_ENABLED: String(enabled) };
  const runtime = createWorkerRuntime({
    DurableObject: class { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }, registry, clock: () => new Date(now),
    createAdmin: () => ({
      customer: async (id) => ({ id: `gid://shopify/Customer/${id}`, tags: [], defaultEmailAddress: { marketingState: 'SUBSCRIBED' } }),
      persistProfile: async (id) => { owners.push(id); return { defaultEmailAddress: { marketingState: 'SUBSCRIBED' } }; },
    }),
    ...(adapter ? { createDispatch: () => async (input) => { dispatches.push(input.customerId); return { accepted: true }; } } : {}),
  });
  env.PROFILE_REQUESTS = { getByName(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    if (!contexts.has(name)) contexts.set(name, { id: { name }, storage: {
      get: async (key) => structuredClone(stores.get(name).get(key)),
      put: async (key, value) => stores.get(name).set(key, structuredClone(value)),
    } });
    if (!actors.has(name)) actors.set(name, new runtime.WineProfileRequests(contexts.get(name), env));
    return actors.get(name);
  } };
  return { runtime, env, owners, dispatches, actors, stores };
}

test('Cloudflare wrapper scopes persistent coordinators to the signed customer and survives restart', async () => {
  const fixture = workerFixture();
  const requestFor = async (customerId) => {
    const contextUrl = signedUrl({ logged_in_customer_id: customerId });
    const context = await (await fixture.runtime.worker.fetch(new Request(contextUrl), fixture.env)).json();
    const url = signedUrl({ logged_in_customer_id: customerId }); url.pathname = '/proxy/request';
    return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quizVersion: '1.0.0', submissionId: profileRequest().submissionId, answers: fixtures.red.answers, adultConfirmed: true, csrfToken: context.csrfToken }) });
  };
  const requestA = await requestFor('12345'), requestB = await requestFor('67890');
  assert.equal((await fixture.runtime.worker.fetch(requestA.clone(), fixture.env)).status, 202);
  assert.equal((await fixture.runtime.worker.fetch(requestB, fixture.env)).status, 202);
  assert.deepEqual(fixture.owners, ['12345', '67890']);
  assert.deepEqual(fixture.dispatches, ['12345', '67890']);
  const actorA = fixture.env.PROFILE_REQUESTS.getByName(`${shop}:12345`);
  const crossed = await actorA.fetch(new Request(signedUrl({ logged_in_customer_id: '67890' })));
  assert.equal(crossed.status, 403);
  assert.equal((await crossed.json()).error, 'customer_scope_mismatch');
  fixture.actors.clear();
  assert.equal((await fixture.runtime.worker.fetch(requestA, fixture.env)).status, 202);
  assert.equal(fixture.dispatches.length, 2);
});

test('Cloudflare wrapper does not allocate customer storage for unsigned, signed-out or disabled requests', async () => {
  for (const configuration of [{ enabled: false }, { adapter: false }]) {
    const fixture = workerFixture(configuration);
    const context = await fixture.runtime.worker.fetch(new Request(signedUrl()), fixture.env);
    assert.deepEqual(await context.json(), { signedIn: true, emailRequestsAvailable: false });
    assert.equal(fixture.actors.size, 0);
    const url = signedUrl(); url.pathname = '/proxy/request';
    assert.equal((await fixture.runtime.worker.fetch(new Request(url, { method: 'POST' }), fixture.env)).status, 503);
    assert.equal(fixture.actors.size, 0);
  }
  const fixture = workerFixture();
  const anonymous = await fixture.runtime.worker.fetch(new Request(signedUrl({ logged_in_customer_id: '' })), fixture.env);
  assert.deepEqual(await anonymous.json(), { signedIn: false, emailRequestsAvailable: true });
  assert.equal((await fixture.runtime.worker.fetch(new Request('https://synthetic.invalid/proxy/context'), fixture.env)).status, 401);
  assert.equal(fixture.actors.size, 0);
});

test('own-organization access tokens are cached, refreshed before expiry and deduplicated across concurrent calls', async () => {
  let calls = 0, timestamp = now;
  const provider = createClientCredentialsTokenProvider({ shop, clientId: 'synthetic-client-id', clientSecret: 'synthetic-client-secret', clock: () => timestamp, fetcher: async (url, options) => {
    calls += 1;
    assert.equal(url, `https://${shop}/admin/oauth/access_token`);
    assert.equal(options.redirect, 'error');
    assert.equal(options.body.get('grant_type'), 'client_credentials');
    assert.equal(options.body.get('client_secret'), 'synthetic-client-secret');
    return Response.json({ access_token: 'synthetic-access-token-' + calls, expires_in: 86399 });
  } });
  assert.deepEqual(await Promise.all([provider(), provider()]), ['synthetic-access-token-1', 'synthetic-access-token-1']);
  assert.equal(calls, 1);
  timestamp += 3600000;
  assert.equal(await provider(), 'synthetic-access-token-1');
  timestamp = now + 86340 * 1000;
  assert.equal(await provider(), 'synthetic-access-token-2');
  assert.equal(calls, 2);
});

test('token failures are redacted, not cached and cannot redirect credentials', async () => {
  let calls = 0;
  const provider = createClientCredentialsTokenProvider({ shop, clientId: 'synthetic-client-id', clientSecret: 'synthetic-client-secret', fetcher: async (url, options) => {
    calls += 1;
    assert.equal(options.redirect, 'error');
    if (calls === 1) return Response.json({ error: 'private credential detail' }, { status: 401 });
    return Response.json({ access_token: 'synthetic-access-token', expires_in: 86399 });
  } });
  await assert.rejects(provider(), (error) => error.code === 'shopify_authorization_failed' && !error.message.includes('credential'));
  assert.equal(await provider(), 'synthetic-access-token');
  const malformed = createClientCredentialsTokenProvider({ shop, clientId: 'synthetic-client-id', clientSecret: 'synthetic-client-secret', fetcher: async () => Response.json({ access_token: 'synthetic-access-token', expires_in: 'never' }) });
  await assert.rejects(malformed(), errorCode('invalid_shopify_token_response'));
});
