import { RequestError } from './security.mjs';
import { planProfileTags } from './profile-input.mjs';
import { isDeepStrictEqual } from 'node:util';

export const PROFILE_NAMESPACE = 'chateau_wine_profile';
const customerGid = (id) => {
  if (!/^[1-9]\d{0,19}$/.test(id ?? '')) throw new RequestError('invalid_customer', 401);
  return `gid://shopify/Customer/${id}`;
};
const CUSTOMER = `query WineProfileCustomer($id: ID!) {
  customer(id: $id) {
    id tags defaultEmailAddress { marketingState }
    profile: metafield(namespace: "${PROFILE_NAMESPACE}", key: "snapshot") { value compareDigest }
    request: metafield(namespace: "${PROFILE_NAMESPACE}", key: "request") { value compareDigest }
  }
}`;

export class ShopifyAdmin {
  constructor({ shop, accessToken, fetcher = fetch, apiVersion = '2026-10' }) {
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? '') || !/^\d{4}-(01|04|07|10)$/.test(apiVersion)) throw new RequestError('configuration_missing', 503);
    this.endpoint = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
    this.accessToken = accessToken;
    this.fetcher = fetcher;
  }
  async query(query, variables) {
    const token = typeof this.accessToken === 'function' ? await this.accessToken() : this.accessToken;
    if (!token) throw new RequestError('configuration_missing', 503);
    let response, result;
    try {
      response = await this.fetcher(this.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
        body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(10000), redirect: 'error',
      });
      if (!response.ok) throw new RequestError(response.status === 429 ? 'shopify_rate_limited' : 'shopify_unavailable', 503);
      result = await response.json();
    } catch (error) {
      if (error instanceof RequestError) throw error;
      throw new RequestError('shopify_unavailable', 503);
    }
    if (result.errors?.length || !result.data) throw new RequestError('shopify_api_error', 502);
    return result.data;
  }
  async customer(customerId) {
    const { customer } = await this.query(CUSTOMER, { id: customerGid(customerId) });
    if (!customer || customer.id !== customerGid(customerId)) throw new RequestError('customer_not_found', 404);
    return customer;
  }
  async tags(customerId, operation, tags) {
    if (!tags.length) return;
    if (!['tagsAdd', 'tagsRemove'].includes(operation)) throw new RequestError('invalid_operation');
    const data = await this.query(`mutation WineProfileTags($id: ID!, $tags: [String!]!) { ${operation}(id: $id, tags: $tags) { userErrors { field message } } }`, { id: customerGid(customerId), tags });
    if (!data[operation] || data[operation].userErrors?.length) throw new RequestError('customer_tags_failed', 502);
  }
  async metafields(customerId, values, previous = {}) {
    const metafields = Object.entries(values).map(([key, value]) => {
      if (!['snapshot', 'request'].includes(key)) throw new RequestError('invalid_metafield');
      return { ownerId: customerGid(customerId), namespace: PROFILE_NAMESPACE, key, type: 'json', value: JSON.stringify(value), compareDigest: previous[key]?.compareDigest ?? null };
    });
    const { metafieldsSet } = await this.query(`mutation WineProfileData($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { key compareDigest } userErrors { field message code } } }`, { metafields });
    if (!metafieldsSet || metafieldsSet.userErrors?.length) throw new RequestError('profile_update_conflict', 409);
    return metafieldsSet.metafields;
  }
  async persistProfile(customerId, validated, current, now = new Date()) {
    const operations = planProfileTags(current.tags, validated.tags);
    const snapshot = {
      quiz_version: validated.quizVersion, submission_id: validated.submissionId,
      answers: validated.answers, profile: validated.profile, created_at: now.toISOString(),
    };
    const request = { submission_id: validated.submissionId, status: 'preparing', updated_at: now.toISOString() };
    await this.metafields(customerId, { snapshot, request }, { snapshot: current.profile, request: current.request });
    await this.tags(customerId, 'tagsRemove', operations.remove);
    await this.tags(customerId, 'tagsAdd', operations.add);
    const saved = await this.customer(customerId);
    let savedSnapshot, savedRequest;
    try {
      savedSnapshot = JSON.parse(saved.profile?.value);
      savedRequest = JSON.parse(saved.request?.value);
    } catch { throw new RequestError('profile_verification_failed', 502); }
    const savedTags = saved.tags?.filter((tag) => /^cfwp\d+_\d+_\d+:/.test(tag)).sort();
    if (!isDeepStrictEqual(savedSnapshot, snapshot) || !isDeepStrictEqual(savedRequest, request) ||
        !isDeepStrictEqual(savedTags, [...validated.tags].sort())) throw new RequestError('profile_verification_failed', 502);
    // A delivery trigger may only run after this verification; no trigger is sent here.
    return saved;
  }
}
