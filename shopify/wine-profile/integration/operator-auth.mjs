import { createHmac, timingSafeEqual } from 'node:crypto';
import { RequestError } from './security.mjs';

const shopPattern = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const userPattern = /^[1-9]\d{0,19}$/;
const decode = (segment) => {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error('Invalid encoding');
  const bytes = Buffer.from(segment, 'base64url');
  if (bytes.toString('base64url') !== segment) throw new Error('Invalid encoding');
  return bytes;
};

// Signed Shopify admin identity for Lord James Follent; this alone grants no request-history access.
export function authenticateAdminIdentity(authorization, { shop, clientId, secret, now = Date.now() }) {
  if (!shopPattern.test(shop ?? '') || typeof clientId !== 'string' || !clientId || typeof secret !== 'string' || !secret) throw new RequestError('review_not_configured', 503);
  try {
    if (typeof authorization !== 'string' || authorization.length > 4096 || !/^Bearer [A-Za-z0-9_.-]+$/i.test(authorization)) throw new Error('Missing token');
    const parts = authorization.slice(7).split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const header = JSON.parse(decode(parts[0]).toString('utf8'));
    if (header.alg !== 'HS256' || (header.typ !== undefined && header.typ !== 'JWT') || header.crit !== undefined || header.b64 !== undefined) throw new Error('Unsupported token');
    const signature = decode(parts[2]);
    const expected = createHmac('sha256', secret).update(parts[0] + '.' + parts[1]).digest();
    if (signature.byteLength !== expected.byteLength || !timingSafeEqual(signature, expected)) throw new Error('Invalid signature');
    const claims = JSON.parse(decode(parts[1]).toString('utf8'));
    const seconds = Math.floor(now / 1000);
    if (claims.aud !== clientId || claims.dest !== `https://${shop}` || claims.iss !== `https://${shop}/admin` ||
        !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.nbf) || claims.exp <= seconds || claims.nbf > seconds ||
        claims.exp <= claims.nbf || claims.exp - claims.nbf > 90 || !userPattern.test(claims.sub ?? '')) throw new Error('Invalid claims');
    return { shop, userId: claims.sub };
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError('invalid_admin_token', 401);
  }
}

export function authenticateOperator(authorization, policy) {
  const reviewers = typeof policy.reviewerIds === 'string' && policy.reviewerIds.length <= 512 ? policy.reviewerIds.split(',').map((id) => id.trim()) : [];
  if (!reviewers.length || reviewers.length > 20 || !reviewers.every((id) => userPattern.test(id))) throw new RequestError('review_not_configured', 503);
  const identity = authenticateAdminIdentity(authorization, policy);
  if (!reviewers.includes(identity.userId)) throw new RequestError('review_access_denied', 403);
  return identity;
}
