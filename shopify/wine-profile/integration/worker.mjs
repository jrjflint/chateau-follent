import { DurableObject } from 'cloudflare:workers';
import registry from '../messaging/content-registry.json' with { type: 'json' };
import { createWorkerRuntime } from './worker-runtime.mjs';
import { ShopifyAdmin } from './shopify-admin.mjs';
import { createClientCredentialsTokenProvider } from './access-token.mjs';
import { operationsPage } from './operations-page.mjs';

const providers = new WeakMap();
function createAdmin(env) {
  if (!providers.has(env)) providers.set(env, createClientCredentialsTokenProvider({
    shop: env.SHOPIFY_SHOP, clientId: env.SHOPIFY_CLIENT_ID, clientSecret: env.SHOPIFY_CLIENT_SECRET,
  }));
  return new ShopifyAdmin({ shop: env.SHOPIFY_SHOP, accessToken: providers.get(env) });
}

// Closed bootstrap for Lord James Follent. Add the approved delivery adapter only after the Flow-route decision.
const runtime = createWorkerRuntime({ DurableObject, registry, createAdmin });
export const WineProfileRequests = runtime.WineProfileRequests;
export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/') return operationsPage({ shop: env.SHOPIFY_SHOP, clientId: env.SHOPIFY_CLIENT_ID,
      reviewConfigured: typeof env.WINE_PROFILE_REVIEWER_IDS === 'string' && Boolean(env.WINE_PROFILE_REVIEWER_IDS.trim()) });
    if (request.method === 'GET' && path === '/health') return Response.json({ service: 'wine-profile', email_requests_enabled: false }, { headers: { 'Cache-Control': 'no-store' } });
    return runtime.worker.fetch(request, env);
  },
};
