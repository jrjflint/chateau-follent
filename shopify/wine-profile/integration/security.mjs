import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Server-side Shopify authentication for Lord James Follent. Never import into the storefront.
export class RequestError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
const hmac = (text, secret) => createHmac('sha256', secret).update(text).digest('hex');
const equalHex = (left, right) => /^[a-f0-9]{64}$/.test(left ?? '') && timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));

export function proxyMessage(params) {
  const keys = [...new Set(params.keys())].filter((key) => key !== 'signature');
  return keys.map((key) => `${key}=${params.getAll(key).join(',')}`).sort().join('');
}

export function authenticateProxy(url, { secret, shop, now = Date.now(), maxAgeSeconds = 300 }) {
  if (!secret || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? '')) throw new RequestError('configuration_missing', 503);
  const params = new URL(url).searchParams;
  for (const key of ['signature', 'shop', 'timestamp', 'logged_in_customer_id']) {
    if (params.getAll(key).length !== 1) throw new RequestError('invalid_proxy', 401);
  }
  if (!equalHex(params.get('signature'), hmac(proxyMessage(params), secret))) throw new RequestError('invalid_proxy', 401);
  if (params.get('shop') !== shop) throw new RequestError('wrong_shop', 403);
  const timestamp = params.get('timestamp');
  if (!/^\d{10}$/.test(timestamp) || Math.abs(Math.floor(now / 1000) - Number(timestamp)) > maxAgeSeconds) throw new RequestError('expired_proxy', 401);
  const customerId = params.get('logged_in_customer_id');
  if (customerId && !/^[1-9]\d{0,19}$/.test(customerId)) throw new RequestError('invalid_customer', 401);
  return { shop, customerId: customerId || null };
}

export function issueCsrf(identity, secret, now = Date.now()) {
  if (!identity.customerId) throw new RequestError('sign_in_required', 401);
  const nonce = `${Math.floor(now / 1000)}.${randomBytes(16).toString('hex')}`;
  return `${nonce}.${hmac(`wine-profile-csrf:${identity.shop}:${identity.customerId}:${nonce}`, secret)}`;
}

export function verifyCsrf(token, identity, secret, now = Date.now()) {
  if (typeof token !== 'string' || !/^\d{10}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) throw new RequestError('invalid_csrf', 403);
  if (!identity.customerId || !secret) throw new RequestError('invalid_csrf', 403);
  const [timestamp, random, signature] = token.split('.');
  if (Number(timestamp) > Math.floor(now / 1000) + 30 || now / 1000 - Number(timestamp) > 600 ||
      !equalHex(signature, hmac(`wine-profile-csrf:${identity.shop}:${identity.customerId}:${timestamp}.${random}`, secret))) throw new RequestError('invalid_csrf', 403);
}

export async function readJson(request, maxBytes = 8192) {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) throw new RequestError('json_required', 415);
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RequestError('request_too_large', 413);
  if (!request.body) throw new RequestError('invalid_json');
  const reader = request.body.getReader();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new RequestError('request_too_large', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new RequestError('invalid_json'); }
}
