import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Script } from 'node:vm';
import { authenticateOperator } from '../shopify/wine-profile/integration/operator-auth.mjs';
import { reviewRequestState, validateReviewInput } from '../shopify/wine-profile/integration/request-review.mjs';
import { createWorkerRuntime } from '../shopify/wine-profile/integration/worker-runtime.mjs';
import { operationsPage } from '../shopify/wine-profile/integration/operations-page.mjs';

const shop = 'tvump1-7j.myshopify.com', secret = 'synthetic-operator-secret', clientId = 'synthetic-client-id';
const now = Date.UTC(2026, 9, 22, 0, 0), seconds = now / 1000;
const submissionId = 'b071de22-67bd-40fe-8dbb-abf906f2c122';
const errorCode = (code) => (error) => error.code === code;
function token(changes = {}, header = { alg: 'HS256', typ: 'JWT' }) {
  const payload = { iss: `https://${shop}/admin`, dest: `https://${shop}`, aud: clientId, sub: '9001', nbf: seconds, iat: seconds,
    exp: seconds + 60, sid: 'synthetic-session', jti: 'synthetic-token-id', ...changes };
  const message = [header, payload].map((value) => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return message + '.' + createHmac('sha256', secret).update(message).digest('base64url');
}
const authorization = (changes, header) => 'Bearer ' + token(changes, header);
const policy = { shop, secret, clientId, reviewerIds: '9001, 9002', now };

test('request review accepts only fresh signed admin identity for this app, shop and allowlisted user', () => {
  assert.deepEqual(authenticateOperator(authorization({ email: 'private@example.invalid' }), policy), { shop, userId: '9001' });
  assert.deepEqual(authenticateOperator(authorization({ sub: '9002' }), policy), { shop, userId: '9002' });
  for (const change of [{ aud: 'other-app' }, { aud: [clientId] }, { dest: 'https://other.myshopify.com' },
    { iss: `https://${shop}.attacker.invalid/admin` }, { iss: `http://${shop}/admin` }, { exp: seconds }, { nbf: seconds + 1 },
    { exp: seconds + 91 }, { nbf: String(seconds) }, { sub: '' }]) {
    assert.throws(() => authenticateOperator(authorization(change), policy), errorCode('invalid_admin_token'));
  }
  for (const header of [{ alg: 'none' }, { alg: 'RS256' }, { alg: 'HS256', crit: ['unsupported'] }, { alg: 'HS256', b64: false }]) {
    assert.throws(() => authenticateOperator(authorization({}, header), policy), errorCode('invalid_admin_token'));
  }
  const signed = authorization();
  for (const invalid of [null, '', signed + '=', signed + 'x', signed.replace('Bearer ', ''), 'Bearer ' + 'x'.repeat(4097)]) {
    assert.throws(() => authenticateOperator(invalid, policy), errorCode('invalid_admin_token'));
  }
  assert.throws(() => authenticateOperator(signed, { ...policy, secret: 'wrong-secret' }), errorCode('invalid_admin_token'));
  assert.throws(() => authenticateOperator(authorization({ sub: '9003' }), policy), errorCode('review_access_denied'));
});

test('review defaults closed and refuses unconfigured authorization or broader lookup payloads', () => {
  for (const change of [{ reviewerIds: '' }, { reviewerIds: '9001,not-a-user' }, { reviewerIds: undefined }, { clientId: '' }, { secret: '' }]) {
    assert.throws(() => authenticateOperator(authorization(), { ...policy, ...change }), errorCode('review_not_configured'));
  }
  assert.equal(validateReviewInput({ customerId: '12345' }), '12345');
  for (const input of [null, [], { customerId: 12345 }, { customerId: 'gid://shopify/Customer/12345' },
    { customerId: '12345', shop: 'other.myshopify.com' }, { customerId: '12345', email: 'private@example.invalid' }]) {
    assert.throws(() => validateReviewInput(input), errorCode('invalid_customer'));
  }
});

test('review projection is bounded, redacts private fields and never mutates the persisted outcome', () => {
  const state = { active: submissionId, records: Array.from({ length: 70 }, () => ({ submissionId, status: 'review', code: 'dispatch_outcome_unknown',
    updatedAt: new Date(now).toISOString(), fingerprint: 'private-fingerprint', answers: { dob: '1990-05-12' }, email: 'private@example.invalid' })) };
  const before = structuredClone(state);
  const result = reviewRequestState(state);
  assert.equal(result.activeSubmissionId, submissionId);
  assert.equal(result.records.length, 50);
  assert.doesNotMatch(JSON.stringify(result), /fingerprint|1990|dob|email|private/);
  assert.deepEqual(state, before);
  assert.deepEqual(reviewRequestState({ active: 'private-data', records: [{ submissionId: 'private-data', status: 'private-data', code: 'private-data', updatedAt: 'private-data' }] }),
    { activeSubmissionId: null, records: [{ submissionId: null, status: 'unknown', code: 'unrecognised_error', updatedAt: null }] });
});

function runtimeFixture() {
  const actors = new Map(), data = new Map();
  let writes = 0, adminCalls = 0;
  const env = { SHOPIFY_SHOP: shop, SHOPIFY_CLIENT_ID: clientId, SHOPIFY_CLIENT_SECRET: secret, WINE_PROFILE_REVIEWER_IDS: '9001', EMAIL_REQUESTS_ENABLED: 'false' };
  const runtime = createWorkerRuntime({ DurableObject: class { constructor(ctx, bindings) { this.ctx = ctx; this.env = bindings; } }, registry: {},
    clock: () => new Date(now), createAdmin: () => { adminCalls++; throw new Error('Review must not call Shopify'); } });
  env.PROFILE_REQUESTS = { getByName(name) {
    if (!actors.has(name)) actors.set(name, new runtime.WineProfileRequests({ id: { name }, storage: {
      get: async () => structuredClone(data.get(name)), put: async () => { writes++; },
    } }, env));
    return actors.get(name);
  } };
  const request = (body = { customerId: '12345' }, auth = authorization(), method = 'POST') => new Request('https://synthetic.invalid/operations/requests', {
    method, headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
  });
  return { env, runtime, actors, data, request, counts: () => ({ writes, adminCalls }) };
}

test('operator HTTP and RPC review stay read-only, customer-scoped and independent of sending', async () => {
  const fixture = runtimeFixture();
  const state = { active: submissionId, records: [{ submissionId, status: 'dispatching', fingerprint: 'not-for-review', updatedAt: new Date(now).toISOString() }] };
  fixture.data.set(`${shop}:12345`, structuredClone(state));
  const response = await fixture.runtime.worker.fetch(fixture.request(), fixture.env);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const result = await response.json();
  assert.equal(result.customerId, '12345');
  assert.equal(result.records[0].status, 'dispatching');
  assert.doesNotMatch(JSON.stringify(result), /fingerprint|not-for-review/);
  assert.deepEqual(fixture.data.get(`${shop}:12345`), state);
  assert.deepEqual(fixture.counts(), { writes: 0, adminCalls: 0 });
  const actor = fixture.env.PROFILE_REQUESTS.getByName(`${shop}:12345`);
  await assert.rejects(actor.review({ authorization: authorization(), customerId: '67890' }), errorCode('customer_scope_mismatch'));
  await assert.rejects(actor.review({ authorization: authorization({ sub: '9002' }), customerId: '12345' }), errorCode('review_access_denied'));
  fixture.actors.clear();
  assert.equal((await fixture.runtime.worker.fetch(fixture.request(), fixture.env)).status, 200);
  assert.deepEqual(fixture.data.get(`${shop}:12345`), state);
});

test('operator failures reject before allocating a customer actor', async () => {
  const fixture = runtimeFixture();
  for (const [request, expected] of [[fixture.request({}, ''), 401], [fixture.request({}, authorization({ sub: '9002' })), 403],
    [fixture.request({ customerId: '12345', dob: '1990-05-12' }), 400], [fixture.request({}, authorization(), 'GET'), 405]]) {
    assert.equal((await fixture.runtime.worker.fetch(request, fixture.env)).status, expected);
    assert.equal(fixture.actors.size, 0);
  }
  fixture.env.WINE_PROFILE_REVIEWER_IDS = '';
  assert.equal((await fixture.runtime.worker.fetch(fixture.request(), fixture.env)).status, 503);
  assert.equal(fixture.actors.size, 0);
});

test('setup reveals only the signed-in admin subject and never grants request-history access', async () => {
  const fixture = runtimeFixture();
  fixture.env.WINE_PROFILE_REVIEWER_IDS = '';
  const request = (auth) => new Request('https://synthetic.invalid/operations/identity', { method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: '9002', customerId: '12345' }) });
  const response = await fixture.runtime.worker.fetch(request(authorization()), fixture.env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { userId: '9001' });
  assert.equal(fixture.actors.size, 0);
  assert.deepEqual(fixture.counts(), { writes: 0, adminCalls: 0 });
  assert.equal((await fixture.runtime.worker.fetch(fixture.request(), fixture.env)).status, 503);
  assert.equal(fixture.env.WINE_PROFILE_REVIEWER_IDS, '');
  assert.equal((await fixture.runtime.worker.fetch(request(authorization({ aud: 'other-app' })), fixture.env)).status, 401);
});

test('operations shell is safe to frame only in this store admin and contains no private reviewer data', async () => {
  const page = operationsPage({ shop, clientId: 'public-key"><script>bad()</script>', reviewConfigured: true });
  assert.match(page.headers.get('content-security-policy'), new RegExp(`frame-ancestors https://${shop} https://admin.shopify.com`));
  assert.match(page.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.equal(page.headers.get('referrer-policy'), 'no-referrer');
  const html = await page.text();
  assert.match(html, /shopify-disabled-features" content="fetch"/);
  assert.match(html, /public-key&quot;&gt;&lt;script&gt;/);
  assert.doesNotMatch(html, /9001|synthetic-operator-secret|private@example/);
  const scripts = [...html.matchAll(/<script nonce="[^"]+">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0][1]));
  const closed = operationsPage({ shop, clientId });
  const closedHtml = await closed.text();
  assert.match(closedHtml, /Request review is not configured/);
  assert.match(closedHtml, /Show my Shopify user ID/);
  assert.doesNotMatch(closedHtml, /<form method="post"/);
  assert.match(closed.headers.get('content-security-policy'), /frame-ancestors https:\/\/tvump1-7j.myshopify.com https:\/\/admin.shopify.com/);
  assert.match(operationsPage({ shop }).headers.get('content-security-policy'), /frame-ancestors 'none'/);
});
