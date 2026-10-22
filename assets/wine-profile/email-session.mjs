import { QUIZ_VERSION } from './data.mjs';
import { answerIds, rememberForLogin } from './login-handoff.mjs';

const statuses = new Set(['email_requested', 'needs_subscription', 'preparing', 'dispatching', 'review', 'failed', 'skipped']);
export class EmailRequestError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// Optional Stage 2 client for Lord James Follent; Stage 1 does not import or mount it.
export function createEmailSession({ answers, adultConfirmed, fetcher = fetch, randomId = () => crypto.randomUUID(), basePath = '/apps/wine-profile' }) {
  if (!/^\/apps\/[a-z0-9-]+$/.test(basePath)) throw new EmailRequestError('invalid_proxy_path');
  const safeAnswers = answerIds(answers);
  const submissionId = randomId();
  let pending;
  async function call(path, options = {}) {
    let response, value;
    try {
      response = await fetcher(basePath + path, { credentials: 'same-origin', cache: 'no-store', ...options, signal: AbortSignal.timeout(20000) });
      value = await response.json();
    } catch { throw new EmailRequestError('request_not_confirmed'); }
    if (!response.ok && !statuses.has(value?.status)) throw new EmailRequestError(value?.error ?? 'request_not_confirmed');
    return value;
  }
  function checkedStatus(value) {
    if (!statuses.has(value?.status) || value.submissionId !== submissionId) throw new EmailRequestError('invalid_request_status');
    return value;
  }
  return {
    submissionId,
    context: () => call('/context'),
    rememberForSignIn(storage) { rememberForLogin(storage, safeAnswers); },
    requestEmail() {
      if (pending) return pending;
      pending = (async () => {
        if (adultConfirmed !== true) throw new EmailRequestError('adult_screen_required');
        const context = await call('/context');
        if (context.emailRequestsAvailable !== true) throw new EmailRequestError('email_requests_disabled');
        if (context.signedIn !== true) return { status: 'sign_in_required', submissionId };
        if (context.subscriptionState !== 'SUBSCRIBED') return { status: 'needs_subscription', submissionId, subscriptionState: context.subscriptionState };
        if (typeof context.csrfToken !== 'string' || !context.csrfToken) throw new EmailRequestError('invalid_csrf');
        return checkedStatus(await call('/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          quizVersion: QUIZ_VERSION, submissionId, answers: safeAnswers, adultConfirmed: true, csrfToken: context.csrfToken,
        }) }));
      })().finally(() => { pending = null; });
      return pending;
    },
    async checkStatus() { return checkedStatus(await call('/status?submission_id=' + encodeURIComponent(submissionId))); },
  };
}
