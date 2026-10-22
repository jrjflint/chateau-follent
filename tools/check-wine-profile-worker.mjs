import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { createHmac, createHash } from 'node:crypto';

// Actual local Cloudflare runtime QA for Lord James Follent; all bindings and credentials are synthetic.
const { Miniflare } = createRequire(join(tmpdir(), 'chateau-wine-profile-build-qa', 'package.json'))('miniflare');
const bundle = new URL('../shopify/wine-profile/integration/dist/worker.js', import.meta.url);
const shop = 'tvump1-7j.myshopify.com';
const secret = 'synthetic-worker-smoke-secret';
let outboundRequests = 0;
const mf = new Miniflare({
  modules: true, scriptPath: fileURLToPath(bundle), cf: false,
  compatibilityDate: '2026-07-30', compatibilityFlags: ['nodejs_compat'],
  durableObjects: { PROFILE_REQUESTS: { className: 'WineProfileRequests', useSQLite: true } },
  bindings: { SHOPIFY_SHOP: shop, SHOPIFY_CLIENT_ID: 'synthetic-client-id', SHOPIFY_CLIENT_SECRET: secret, WINE_PROFILE_REVIEWER_IDS: '9001', EMAIL_REQUESTS_ENABLED: 'true' },
  outboundService: async () => { outboundRequests += 1; throw new Error('Outbound access is blocked during the smoke test.'); },
});
function signed(path, customerId = '') {
  const url = new URL(path, 'https://wine-profile.synthetic.invalid');
  url.searchParams.set('shop', shop);
  url.searchParams.set('timestamp', String(Math.floor(Date.now() / 1000)));
  url.searchParams.set('logged_in_customer_id', customerId);
  url.searchParams.set('path_prefix', '/apps/wine-profile');
  const message = [...url.searchParams].map(([key, value]) => `${key}=${value}`).sort().join('');
  url.searchParams.set('signature', createHmac('sha256', secret).update(message).digest('hex'));
  return url;
}
const checks = [];
function operatorAuthorization(changes = {}) {
  const seconds = Math.floor(Date.now() / 1000);
  const payload = { iss: `https://${shop}/admin`, dest: `https://${shop}`, aud: 'synthetic-client-id', sub: '9001', nbf: seconds, exp: seconds + 60, ...changes };
  const message = [ { alg: 'HS256', typ: 'JWT' }, payload ].map((value) => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return 'Bearer ' + message + '.' + createHmac('sha256', secret).update(message).digest('base64url');
}
try {
  const landing = await mf.dispatchFetch('https://wine-profile.synthetic.invalid/');
  assert.equal(landing.status, 200);
  assert.match(await landing.text(), /Email requests are disabled/);
  assert.match(landing.headers.get('content-security-policy'), /frame-ancestors https:\/\/tvump1-7j.myshopify.com https:\/\/admin.shopify.com/);
  assert.equal((await (await mf.dispatchFetch('https://wine-profile.synthetic.invalid/health')).json()).email_requests_enabled, false);
  checks.push('closed landing and health');
  assert.equal((await mf.dispatchFetch('https://wine-profile.synthetic.invalid/proxy/context')).status, 401);
  checks.push('unsigned requests rejected');
  assert.deepEqual(await (await mf.dispatchFetch(signed('/proxy/context'))).json(), { signedIn: false, emailRequestsAvailable: false });
  assert.deepEqual(await (await mf.dispatchFetch(signed('/proxy/context', '12345'))).json(), { signedIn: true, emailRequestsAvailable: false });
  assert.equal((await mf.dispatchFetch(signed('/proxy/request', '12345'), { method: 'POST' })).status, 503);
  checks.push('environment flag cannot enable an unconfigured delivery adapter');
  const namespace = await mf.getDurableObjectNamespace('PROFILE_REQUESTS');
  const actor = namespace.getByName(`${shop}:12345`);
  const statusPath = '/proxy/status?submission_id=b071de22-67bd-40fe-8dbb-abf906f2c122';
  const missing = await actor.fetch(signed(statusPath, '12345'));
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error, 'submission_not_found');
  const crossed = await actor.fetch(signed(statusPath, '67890'));
  assert.equal(crossed.status, 403);
  assert.equal((await crossed.json()).error, 'customer_scope_mismatch');
  checks.push('real SQLite-backed Durable Object and customer-name isolation');
  const reviewRequest = (authorization) => mf.dispatchFetch('https://wine-profile.synthetic.invalid/operations/requests', { method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authorization ? { authorization } : {}) }, body: JSON.stringify({ customerId: '12345' }) });
  assert.equal((await reviewRequest()).status, 401);
  assert.equal((await reviewRequest(operatorAuthorization({ sub: '9002' }))).status, 403);
  const reviewed = await reviewRequest(operatorAuthorization());
  assert.equal(reviewed.status, 200);
  assert.deepEqual(await reviewed.json(), { customerId: '12345', activeSubmissionId: null, records: [] });
  const identityResponse = await mf.dispatchFetch('https://wine-profile.synthetic.invalid/operations/identity', { method: 'POST', headers: { authorization: operatorAuthorization() } });
  assert.deepEqual(await identityResponse.json(), { userId: '9001' });
  // Exercise review RPC through the Worker; the Node binding proxy does not implement direct RPC inspection.
  checks.push('admin-token authentication, reviewer allowlist and read-only Durable Object RPC');
  assert.equal(outboundRequests, 0);
  const report = {
    checked_at: new Date().toISOString(), runtime: 'Miniflare 4.20260730.0 / workerd',
    compatibility_date: '2026-07-30', bundle_sha256: createHash('sha256').update(await readFile(bundle)).digest('hex'),
    passed: true, checks, outbound_requests: 0, deployed: false,
  };
  await writeFile(new URL('../shopify/wine-profile/qa/worker-runtime.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log('Cloudflare runtime smoke passed: closed sending, signed proxy routes, customer isolation and authenticated read-only review RPC; zero outbound requests.');
} finally {
  await mf.dispose();
}
