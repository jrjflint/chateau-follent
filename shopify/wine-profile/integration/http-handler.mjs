import { authenticateProxy, issueCsrf, verifyCsrf, readJson, RequestError } from './security.mjs';
import { validateProfileRequest } from './profile-input.mjs';

const json = (body, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' },
});

// Transport shared by the eventual Worker routes for Lord James Follent; disabled by default.
export function createHandler({ shop, secret, registry, admin, coordinatorFor, enabled = false, clock = () => new Date() }) {
  return async (request) => {
    try {
      const url = new URL(request.url);
      if (!['/proxy/context', '/proxy/request', '/proxy/status'].includes(url.pathname)) return json({ error: 'not_found' }, 404);
      const now = clock().getTime();
      const identity = authenticateProxy(url, { secret, shop, now });
      if (url.pathname === '/proxy/context' && request.method === 'GET') {
        if (!identity.customerId || !enabled) return json({ signedIn: Boolean(identity.customerId), emailRequestsAvailable: enabled });
        const customer = await admin.customer(identity.customerId);
        return json({ signedIn: true, emailRequestsAvailable: true, subscriptionState: customer.defaultEmailAddress?.marketingState ?? 'NOT_SUBSCRIBED', csrfToken: issueCsrf(identity, secret, now) });
      }
      if (!identity.customerId) throw new RequestError('sign_in_required', 401);
      if (url.pathname === '/proxy/request' && request.method === 'POST') {
        if (!enabled) throw new RequestError('email_requests_disabled', 503);
        const input = await readJson(request);
        verifyCsrf(input?.csrfToken, identity, secret, now);
        const validated = validateProfileRequest(input, registry);
        const coordinator = await coordinatorFor(identity);
        const result = await coordinator.request(validated);
        const status = { email_requested: 202, review: 409, failed: 502 }[result.status] ?? 200;
        return json(result, status);
      }
      if (url.pathname === '/proxy/status' && request.method === 'GET') {
        const submissionId = url.searchParams.get('submission_id');
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(submissionId ?? '')) throw new RequestError('invalid_submission_id');
        const coordinator = await coordinatorFor(identity);
        return json(await coordinator.status(submissionId));
      }
      return json({ error: 'method_not_allowed' }, 405);
    } catch (error) {
      return error instanceof RequestError ? json({ error: error.code }, error.status) : json({ error: 'request_unavailable' }, 503);
    }
  };
}
