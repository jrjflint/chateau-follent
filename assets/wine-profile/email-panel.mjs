import { createEmailSession, EmailRequestError } from './email-session.mjs';

const messages = {
  email_requests_disabled: 'Email requests are not available yet. Your complete profile is still here to read or print.',
  profile_request_processing: 'An earlier profile request is still processing. Please wait before requesting a changed profile.',
  customer_tag_capacity: 'Your profile could not be prepared for email. Please contact Chateau Follent for help.',
  adult_screen_required: 'Please complete the adult screening again before requesting an email.',
  submission_not_found: 'No accepted request was found for this attempt. You can retry with the same request reference.',
};

// Optional results controls for Lord James Follent. No request runs before an explicit action.
export function mountEmailPanel(host, { answers, adultConfirmed, signupForm, loginUrl, storage = () => window.sessionStorage,
  navigate = (url) => window.location.assign(url), session = createEmailSession({ answers, adultConfirmed }) }) {
  const listeners = new AbortController();
  let alive = true, pending = false, mode = 'idle', message = '';
  const originalParent = signupForm?.parentNode;
  const originalNext = signupForm?.nextSibling;
  function parkForm() {
    if (!signupForm || !originalParent) return;
    signupForm.hidden = true;
    const consent = signupForm.querySelector('[data-wp-signup-consent]');
    if (consent) consent.checked = false;
    originalParent.insertBefore(signupForm, originalNext?.parentNode === originalParent ? originalNext : null);
  }
  function button(action, text, primary = false) {
    const item = host.ownerDocument.createElement('button');
    item.type = 'button'; item.dataset.emailAction = action;
    item.className = primary ? 'wp-primary' : 'wp-back'; item.textContent = text; item.disabled = pending;
    return item;
  }
  function render() {
    if (!alive) return;
    parkForm();
    host.replaceChildren(); host.className = 'wp-section wp-email-panel';
    const title = host.ownerDocument.createElement('h3'); title.textContent = 'Keep your Wine Profile'; host.append(title);
    const description = host.ownerDocument.createElement('p');
    description.textContent = 'Optional: save this profile to your customer account and request an email with your full results. Sign-in and a confirmed email-marketing subscription are required. You can keep reading or printing without either.';
    host.append(description);
    const status = host.ownerDocument.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    status.tabIndex = -1;
    status.textContent = pending ? 'Checking your request…' : message; host.append(status);
    const actions = host.ownerDocument.createElement('div'); actions.className = 'wp-actions';
    if (mode === 'idle' || mode === 'failed') actions.append(button('request', mode === 'failed' ? 'Retry email request' : 'Email my profile', true));
    if (mode === 'signin') actions.append(button('signin', 'Sign in to email my profile', true));
    if (mode === 'subscribe') {
      if (signupForm) { signupForm.hidden = false; host.append(signupForm); }
      else {
        const note = host.ownerDocument.createElement('p'); note.textContent = 'Please sign in again to load the subscription form.'; host.append(note);
        actions.append(button('signin', 'Sign in again'));
      }
      actions.append(button('subscription', 'Check my subscription'));
    }
    if (mode === 'confirmation') actions.append(button('subscription', 'Check my subscription'));
    if (mode === 'accepted' || mode === 'review' || mode === 'unknown') actions.append(button('status', 'Check request status'));
    if (!['accepted', 'review', 'declined'].includes(mode)) actions.append(button('decline', 'Keep my on-page results'));
    host.append(actions); host.setAttribute('aria-busy', String(pending));
  }
  function showResult(result) {
    switch (result.status) {
      case 'email_requested': mode = 'accepted'; message = 'Email requested. Delivery has not been confirmed.'; break;
      case 'sign_in_required': mode = 'signin'; message = 'Sign in to save and email your results. Only your answer choices will be kept temporarily for your return; enter your name and complete adult screening again.'; break;
      case 'needs_subscription':
        mode = result.subscriptionState === 'PENDING' ? 'confirmation' : 'subscribe';
        message = mode === 'confirmation' ? 'Your subscription is awaiting confirmation. Check your inbox, then check your subscription here. No profile email has been requested.' : 'Subscribe only if you would like email marketing from Chateau Follent. The signup option is separate and unchecked. No profile email has been requested.';
        break;
      case 'failed': mode = 'failed'; message = 'Your profile could not be prepared for email. You can retry this request.'; break;
      case 'skipped': mode = 'skipped'; message = 'The email request was skipped. Your results remain here. After checking your subscription, you can edit your answers and make a new request.'; break;
      case 'review': mode = 'review'; message = 'We could not confirm the outcome of your request. It has been held for review to avoid duplicate emails.'; break;
      default: mode = 'unknown'; message = 'Your request is still processing. You can check its status.';
    }
  }
  async function perform(operation) {
    if (pending || !alive) return;
    pending = true; render();
    try { const result = await operation(); if (alive && result) showResult(result); }
    catch (error) {
      if (!alive) return;
      mode = error.code === 'email_requests_disabled' ? 'disabled' : error.code === 'submission_not_found' ? 'failed' : error.code === 'sign_in_required' ? 'signin' : 'unknown';
      message = messages[error.code] ?? 'We could not confirm this request. Check its status before trying again; it may already have been accepted.';
    } finally { pending = false; render(); if (alive) host.querySelector('[role="status"]')?.focus({ preventScroll: true }); }
  }
  async function checkSubscription() {
    const context = await session.context();
    if (!context.emailRequestsAvailable) throw new EmailRequestError('email_requests_disabled');
    if (!context.signedIn) return { status: 'sign_in_required' };
    if (context.subscriptionState !== 'SUBSCRIBED') return { status: 'needs_subscription', subscriptionState: context.subscriptionState };
    mode = 'idle'; message = 'Your subscription is confirmed. Choose “Email my profile” to request your results.';
  }
  host.addEventListener('click', (event) => {
    const action = event.target.closest('[data-email-action]')?.dataset.emailAction;
    if (!action || pending) return;
    if (action === 'decline') { mode = 'declined'; message = 'Your results remain available on this page. No new email request has been made.'; render(); return; }
    if (action === 'request') return perform(() => session.requestEmail());
    if (action === 'status') return perform(() => session.checkStatus());
    if (action === 'subscription') return perform(checkSubscription);
    if (action === 'signin') {
      try {
        const url = new URL(loginUrl, window.location.origin);
        if (url.origin !== window.location.origin || !/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:account\/login|customer_authentication\/login)$/i.test(url.pathname)) throw new Error('Invalid sign-in route');
        session.rememberForSignIn(storage());
        navigate(url.href);
      } catch { message = 'Your browser could not prepare sign-in. Your results remain here; allow temporary session storage and try again.'; render(); }
    }
  }, { signal: listeners.signal });
  signupForm?.addEventListener('submit', (event) => {
    if (!signupForm.querySelector('[data-wp-signup-consent]')?.checked || pending) { event.preventDefault(); return; }
    try { session.rememberForSignIn(storage()); }
    catch { event.preventDefault(); message = 'Your browser could not keep your answer choices for the signup return. Your results remain here; allow temporary session storage and try again.'; render(); }
  }, { signal: listeners.signal });
  render();
  return () => { alive = false; listeners.abort(); parkForm(); host.replaceChildren(); };
}
