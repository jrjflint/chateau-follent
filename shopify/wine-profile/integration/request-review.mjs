import { RequestError } from './security.mjs';

const submissionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const statuses = new Set(['needs_subscription', 'preparing', 'dispatching', 'accepted', 'processed', 'skipped', 'failed', 'review']);
const codes = new Set(['configuration_missing', 'customer_not_found', 'customer_tag_capacity', 'invalid_tags', 'invalid_customer',
  'shopify_rate_limited', 'shopify_unavailable', 'shopify_authorization_failed', 'invalid_shopify_token_response', 'shopify_api_error',
  'customer_tags_failed', 'profile_update_conflict', 'profile_verification_failed', 'profile_preparation_failed',
  'dispatch_outcome_unknown', 'interrupted_request']);

export function validateReviewInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== 1 ||
      typeof input.customerId !== 'string' || !/^[1-9]\d{0,19}$/.test(input.customerId)) throw new RequestError('invalid_customer');
  return input.customerId;
}

// A read-only projection for Lord James Follent; no fingerprints, answers, names, email or DOB leave storage.
export function reviewRequestState(state) {
  const records = (Array.isArray(state?.records) ? state.records : []).slice(0, 50).map((record) => ({
    submissionId: submissionPattern.test(record?.submissionId ?? '') ? record.submissionId : null,
    status: statuses.has(record?.status) ? record.status : 'unknown',
    code: record?.code ? codes.has(record.code) ? record.code : 'unrecognised_error' : null,
    updatedAt: typeof record?.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.updatedAt) &&
      Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : null,
  }));
  const activeSubmissionId = records.some((record) => record.submissionId && record.submissionId === state?.active) ? state.active : null;
  return { activeSubmissionId, records };
}
