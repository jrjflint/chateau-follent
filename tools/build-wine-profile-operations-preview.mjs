import { writeFile } from 'node:fs/promises';
import { operationsPage } from '../shopify/wine-profile/integration/operations-page.mjs';

// Synthetic browser review for Lord James Follent; no real token or network request is used.
async function preview(reviewConfigured) {
let html = await operationsPage({ shop: 'tvump1-7j.myshopify.com', clientId: 'synthetic-client-id', reviewConfigured }).text();
html = html.replace('<body>', '<body><aside style="padding:1rem;background:#fff4ca;margin-bottom:2rem"><strong>Local operations simulation — synthetic data only</strong><p>No Shopify sign-in, customer lookup, email or profile changes occur here.</p><label>Scenario <select data-review-scenario><option value="review">Request held for review</option><option value="empty">No stored requests</option><option value="denied">Reviewer access denied</option><option value="unavailable">Service unavailable</option></select></label></aside>');
html = html.replace('<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>', `<script>
window.shopify = {idToken:async()=> 'synthetic-preview-token'};
window.fetch = async(path,options)=>{
  if(!['/operations/requests','/operations/identity'].includes(path)||options.method!=='POST')throw Error('Only synthetic review is available');
  if(path==='/operations/identity')return Response.json({userId:'9001'});
  const scenario=document.querySelector('[data-review-scenario]').value;
  if(scenario==='unavailable')throw Error('Synthetic service failure');
  if(scenario==='denied')return Response.json({error:'review_access_denied'},{status:403});
  const customerId=JSON.parse(options.body).customerId;
  const submissionId='b071de22-67bd-40fe-8dbb-abf906f2c122';
  return Response.json({customerId,activeSubmissionId:scenario==='empty'?null:submissionId,records:scenario==='empty'?[]:[{submissionId,status:'review',code:'dispatch_outcome_unknown',updatedAt:'2026-10-22T00:00:00.000Z'}]});
};
</script>`);
return html;
}
await writeFile(new URL('../shopify/wine-profile/qa/operations-preview.html', import.meta.url), await preview(true));
await writeFile(new URL('../shopify/wine-profile/qa/operations-setup-preview.html', import.meta.url), await preview(false));
console.log('Built synthetic operations and setup previews; no authentication or network access is used.');
