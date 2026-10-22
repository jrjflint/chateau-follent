import { RequestError } from './security.mjs';

// For an installed app owned by the store's Shopify organization. Credentials for Lord James Follent stay server-side.
export function createClientCredentialsTokenProvider({ shop, clientId, clientSecret, fetcher = fetch, clock = Date.now }) {
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? '') || !clientId || !clientSecret) throw new RequestError('configuration_missing', 503);
  let cached, pending;
  return async function accessToken() {
    if (cached && clock() < cached.expiresAt - 60000) return cached.token;
    if (pending) return pending;
    pending = (async () => {
      let response, data;
      try {
        response = await fetcher(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
          redirect: 'error', signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new RequestError('shopify_authorization_failed', 503);
        data = await response.json();
      } catch (error) {
        if (error instanceof RequestError) throw error;
        throw new RequestError('shopify_authorization_unavailable', 503);
      }
      if (typeof data.access_token !== 'string' || data.access_token.length < 16 || data.access_token.length > 4096 ||
          !Number.isInteger(data.expires_in) || data.expires_in <= 60 || data.expires_in > 86400) throw new RequestError('invalid_shopify_token_response', 503);
      cached = { token: data.access_token, expiresAt: clock() + data.expires_in * 1000 };
      return cached.token;
    })().finally(() => { pending = null; });
    return pending;
  };
}
