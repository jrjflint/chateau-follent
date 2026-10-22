import { randomBytes } from 'node:crypto';
import { mountRequestReview } from './operations-client.mjs';

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// The public shell contains no request data for Lord James Follent. Every lookup requires admin authentication.
export function operationsPage({ shop, clientId, reviewConfigured = false }) {
  const embedded = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop ?? '') && typeof clientId === 'string' && clientId.length > 0;
  const configured = embedded && reviewConfigured;
  const nonce = randomBytes(18).toString('base64');
  const identityControls = embedded ? '<section><h2>Reviewer setup</h2><p>Use your verified Shopify user ID when asking the owner to configure review access. Showing your ID does not grant access to customer request history.</p><button type="button" data-review-identity>Show my Shopify user ID</button><p role="status" tabindex="-1" data-review-identity-status></p></section>' : '';
  const content = configured ? `<h1>Wine Profile requests</h1><p>Look up stored request outcomes for a customer. Email requests are disabled while setup and verification are completed.</p><form method="post" action="/operations/requests" data-review-form><label for="customer-id">Shopify customer ID</label><input id="customer-id" name="customer_id" type="text" inputmode="numeric" pattern="[1-9][0-9]{0,19}" maxlength="20" required autocomplete="off"><button type="submit">Look up requests</button></form><p role="status" tabindex="-1" data-review-status>Open this app in Shopify admin with an authorised reviewer account.</p><div class="history" role="region" aria-label="Stored request history" tabindex="0" data-review-result></div><h2>When a request needs review</h2><p>Match the request reference to its Flow run before taking action. Preparing or dispatching may indicate an in-flight or interrupted request. An uncertain outcome stays locked to avoid duplicate emails.</p><p>This screen reads stored status only. It does not resend emails, change consent or unlock profiles.</p>` : '<h1>Wine Profile integration</h1><p>Email requests are disabled while setup and verification are completed.</p><p>Request review is not configured yet.</p>';
  return new Response(`<!doctype html><html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Wine Profile request review</title>
${embedded ? `<meta name="shopify-api-key" content="${escape(clientId)}"><meta name="shopify-disabled-features" content="fetch"><script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>` : ''}
<style nonce="${nonce}">body{margin:0;padding:2rem;background:#f7f7f5;color:#21211f;font:16px/1.5 Arial,sans-serif}main{max-width:75rem;margin:auto}form{display:flex;flex-wrap:wrap;gap:.7rem;align-items:center;margin-block:2rem}input,button{font:inherit;padding:.6rem}button{background:#4a002e;color:white;border:0;border-radius:.25rem}button:disabled{opacity:.6}th,td{text-align:left;padding:.7rem;border-bottom:1px solid #ccc;vertical-align:top;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;min-width:40rem}.history{overflow:auto}h1{font-size:1.8rem}h2{font-size:1.2rem;margin-top:2rem}[role=status]:focus{outline:2px solid #4a002e;outline-offset:.3rem}</style>
</head><body><main>${content}${identityControls}</main>
${embedded ? `<script nonce="${nonce}">(${mountRequestReview.toString()})({document,getToken:()=>shopify.idToken()});</script>` : ''}
</body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}' https://cdn.shopify.com; style-src 'nonce-${nonce}'; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors ${embedded ? `https://${shop} https://admin.shopify.com` : "'none'"}` },
  });
}
