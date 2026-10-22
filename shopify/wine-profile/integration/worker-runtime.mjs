import { authenticateProxy, readJson, RequestError } from './security.mjs';
import { authenticateAdminIdentity, authenticateOperator } from './operator-auth.mjs';
import { validateReviewInput, reviewRequestState } from './request-review.mjs';
import { createHandler } from './http-handler.mjs';
import { ProfileRequestCoordinator } from './request-coordinator.mjs';

const paths = new Set(['/proxy/context', '/proxy/request', '/proxy/status']);
const respond = (error, status) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store, private' } });
const actorName = ({ shop, customerId }) => `${shop}:${customerId}`;

// Cloudflare composition for Lord James Follent. The entry point supplies the approved delivery adapter.
export function createWorkerRuntime({ DurableObject, registry, createAdmin, createDispatch, clock = () => new Date() }) {
  if (typeof DurableObject !== 'function' || typeof createAdmin !== 'function' || !registry) throw new Error('Runtime dependencies are required.');
  const enabled = (env) => env.EMAIL_REQUESTS_ENABLED === 'true' && typeof createDispatch === 'function';
  const operatorIdentity = (authorization, env) => authenticateOperator(authorization, {
    shop: env.SHOPIFY_SHOP, clientId: env.SHOPIFY_CLIENT_ID, secret: env.SHOPIFY_CLIENT_SECRET,
    reviewerIds: env.WINE_PROFILE_REVIEWER_IDS, now: clock().getTime(),
  });
  class WineProfileRequests extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
      this.coordinator = null;
    }
    async review({ authorization, customerId }) {
      const identity = operatorIdentity(authorization, this.env);
      validateReviewInput({ customerId });
      if (this.ctx.id.name !== actorName({ shop: identity.shop, customerId })) throw new RequestError('customer_scope_mismatch', 403);
      return reviewRequestState(await this.ctx.storage.get('requests'));
    }
    async fetch(request) {
      try {
        const env = this.env;
        const identity = authenticateProxy(request.url, { secret: env.SHOPIFY_CLIENT_SECRET, shop: env.SHOPIFY_SHOP, now: clock().getTime() });
        if (!identity.customerId || this.ctx.id.name !== actorName(identity)) throw new RequestError('customer_scope_mismatch', 403);
        this.admin ??= createAdmin(env);
        this.coordinator ??= new ProfileRequestCoordinator({
          storage: this.ctx.storage, admin: this.admin, customerId: identity.customerId, clock,
          dispatch: createDispatch ? createDispatch(env, this.admin) : undefined,
        });
        this.coordinator.enabled = enabled(env);
        return createHandler({ shop: env.SHOPIFY_SHOP, secret: env.SHOPIFY_CLIENT_SECRET, registry, admin: this.admin,
          coordinatorFor: () => this.coordinator, enabled: enabled(env), clock })(request);
      } catch (error) {
        return error instanceof RequestError ? respond(error.code, error.status) : respond('request_unavailable', 503);
      }
    }
  }
  const worker = {
    async fetch(request, env) {
      try {
        const path = new URL(request.url).pathname;
        if (path === '/operations/identity') {
          const identity = authenticateAdminIdentity(request.headers.get('authorization'), {
            shop: env.SHOPIFY_SHOP, clientId: env.SHOPIFY_CLIENT_ID, secret: env.SHOPIFY_CLIENT_SECRET, now: clock().getTime(),
          });
          if (request.method !== 'POST') return respond('method_not_allowed', 405);
          return Response.json({ userId: identity.userId }, { headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } });
        }
        if (path === '/operations/requests') {
          const authorization = request.headers.get('authorization');
          const identity = operatorIdentity(authorization, env);
          if (request.method !== 'POST') return respond('method_not_allowed', 405);
          const customerId = validateReviewInput(await readJson(request, 256));
          if (!env.PROFILE_REQUESTS) throw new RequestError('configuration_missing', 503);
          const result = await env.PROFILE_REQUESTS.getByName(actorName({ shop: identity.shop, customerId })).review({ authorization, customerId });
          return Response.json({ customerId, ...result }, { headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' } });
        }
        if (!paths.has(path)) return respond('not_found', 404);
        const identity = authenticateProxy(request.url, { secret: env.SHOPIFY_CLIENT_SECRET, shop: env.SHOPIFY_SHOP, now: clock().getTime() });
        if (!identity.customerId || (!enabled(env) && path !== '/proxy/status')) {
          return createHandler({ shop: env.SHOPIFY_SHOP, secret: env.SHOPIFY_CLIENT_SECRET, registry, enabled: enabled(env), clock })(request);
        }
        if (!env.PROFILE_REQUESTS) throw new RequestError('configuration_missing', 503);
        return await env.PROFILE_REQUESTS.getByName(actorName(identity)).fetch(request);
      } catch (error) {
        return error instanceof RequestError ? respond(error.code, error.status) : respond('request_unavailable', 503);
      }
    },
  };
  return { worker, WineProfileRequests };
}
