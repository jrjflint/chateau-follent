// Read-only request review for Lord James Follent; ID tokens are fetched per lookup and never persisted.
export function mountRequestReview({ document, getToken, fetcher = fetch }) {
  const form = document.querySelector('[data-review-form]');
  const status = document.querySelector('[data-review-status]');
  const result = document.querySelector('[data-review-result]');
  const labels = { needs_subscription: 'Waiting for subscription', preparing: 'Preparing', dispatching: 'Dispatching', accepted: 'Email requested',
    processed: 'Automation processed; delivery unconfirmed', skipped: 'Skipped', failed: 'Preparation failed', review: 'Review required', unknown: 'Unknown' };
  const errors = { review_not_configured: 'Review access has not been configured.', invalid_admin_token: 'Open this app in Shopify admin and try again.',
    review_access_denied: 'Your Shopify user is not on the request-review allowlist.', invalid_customer: 'Enter a numeric Shopify customer ID.' };
  async function call(path, body) {
    let tokenTimeout;
    try {
      const token = await Promise.race([getToken(), new Promise((resolve, reject) => {
        tokenTimeout = setTimeout(() => reject(new Error('invalid_admin_token')), 10000);
      })]);
      clearTimeout(tokenTimeout);
      if (typeof token !== 'string' || !token) throw new Error('invalid_admin_token');
      const response = await fetcher(path, { method: 'POST', credentials: 'omit', redirect: 'error', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      return data;
    } finally { clearTimeout(tokenTimeout); }
  }
  const identityButton = document.querySelector('[data-review-identity]');
  const identityStatus = document.querySelector('[data-review-identity-status]');
  identityButton?.addEventListener('click', async () => {
    if (identityButton.disabled) return;
    identityButton.disabled = true; identityStatus.textContent = 'Verifying your Shopify identity…';
    try {
      const data = await call('/operations/identity');
      if (typeof data.userId !== 'string' || !/^[1-9]\d{0,19}$/.test(data.userId)) throw new Error('invalid_response');
      identityStatus.textContent = 'Your verified Shopify user ID is ' + data.userId + '. The owner can use this ID when configuring reviewer access.';
    } catch (error) { identityStatus.textContent = errors[error.message] ?? 'Your Shopify identity is unavailable. Open this app in Shopify admin and try again.'; }
    finally { identityButton.disabled = false; identityStatus.focus({ preventScroll: true }); }
  });
  if (!form || !status || !result) return;
  let pending = false;
  form.elements.customer_id.addEventListener('input', () => {
    result.replaceChildren(); status.textContent = 'Look up the entered customer ID to load request history.';
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    const customerId = form.elements.customer_id.value.trim();
    result.replaceChildren();
    if (!/^[1-9]\d{0,19}$/.test(customerId)) { status.textContent = errors.invalid_customer; return; }
    pending = true; form.querySelector('button').disabled = true; form.elements.customer_id.disabled = true; status.textContent = 'Loading stored request status…';
    try {
      const data = await call('/operations/requests', { customerId });
      if (data.customerId !== customerId || !Array.isArray(data.records)) throw new Error('invalid_response');
      status.textContent = data.records.length ? 'Stored request history loaded. No delivery confirmation is implied.' : 'No stored requests for this customer.';
      const caption = document.createElement('p'); caption.textContent = 'Customer ID: ' + customerId; result.append(caption);
      if (data.records.length) {
        const table = document.createElement('table');
        const head = document.createElement('thead'); const header = document.createElement('tr');
        for (const title of ['Request reference', 'Stored status', 'Error code', 'Updated (UTC)', 'Profile lock']) {
          const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = title; header.append(cell);
        }
        head.append(header); table.append(head);
        const body = document.createElement('tbody');
        for (const record of data.records.slice(0, 50)) {
          const row = document.createElement('tr');
          for (const value of [record.submissionId ?? 'Unavailable', labels[record.status] ?? labels.unknown, record.code ?? '—', record.updatedAt ?? 'Unavailable',
            record.submissionId && record.submissionId === data.activeSubmissionId ? 'Locked' : '—']) {
            const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
          }
          body.append(row);
        }
        table.append(body); result.append(table);
      }
    } catch (error) { status.textContent = errors[error.message] ?? 'Request status is unavailable. Try the lookup again; no email was resent.'; }
    finally { pending = false; form.querySelector('button').disabled = false; form.elements.customer_id.disabled = false; status.focus({ preventScroll: true }); }
  });
}
