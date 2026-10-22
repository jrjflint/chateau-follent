import { QUESTIONS } from './data.mjs';
import { screenAge, updateSelection, validateAnswer, generateProfile } from './core.mjs';
import { escapeHtml as e, profileMarkup } from './presentation.mjs';

// Each Shopify section owns its state and listeners, including theme-editor reloads.
export function mountWineProfile(root, { restoredAnswers, mountResultAction, privacyNotice, onRestart,
  restartLabel = 'Restart and clear my details', restartAnnouncement = 'Your entered details have been cleared.',
  readyAnnouncement = 'Your Wine Profile is ready. Your answers have not been saved or emailed.' } = {}) {
  const app = root.querySelector('[data-wp-app]');
  const status = root.querySelector('[data-wp-status]');
  if (!app || !status) return () => {};
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const fresh = () => ({ view: 'welcome', question: 0, name: '', dob: { day: '', month: '', year: '' }, answers: {}, profile: null });
  let state = fresh();
  let restoring = Boolean(restoredAnswers);
  if (restoring) { state.answers = structuredClone(restoredAnswers); state.view = 'intro'; }
  let cleanResultAction;
  const notice = privacyNotice ?? '<p class="wp-note">Your entries stay in this page while you explore. This quiz does not save your answers or send email.</p>';
  const restart = `<button type="button" class="wp-text-button" data-action="restart">${e(restartLabel)}</button>`;
  const back = () => '<button type="button" class="wp-back" data-action="back">← Back</button>';
  const error = '<p class="wp-error" role="alert" data-wp-error></p>';
  const privacy = root.dataset.privacyUrl || '/policies/privacy-policy';
  const journal = root.dataset.journalUrl || '/pages/vintages';

  function announce(text) { status.textContent = text; }
  function showError(text, target) {
    app.querySelector('[data-wp-error]').textContent = text;
    if (target) { target.setAttribute('aria-invalid', 'true'); target.focus(); }
  }
  function clearError() {
    const target = app.querySelector('[data-wp-error]');
    if (target) target.textContent = '';
    app.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  }
  function intro() {
    return `${restoring ? '<p role="status">Your answer choices have been restored. Enter your name and complete adult screening again to return to your results.</p>' : ''}<section aria-labelledby="intro-title"><p class="wp-eyebrow">Before we begin</p><h2 id="intro-title" tabindex="-1" data-step-heading>A proper introduction.</h2><p>What should we call you? First, a little information to keep this an adults-only experience.</p><form data-form="intro" novalidate><label class="wp-label" for="wp-first-name">First name</label><input id="wp-first-name" name="first_name" autocomplete="given-name" maxlength="80" required value="${e(state.name)}"><fieldset class="wp-dob"><legend>Date of birth</legend><div class="wp-date-fields">${[['day', 'Day', 'DD', 2], ['month', 'Month', 'MM', 2], ['year', 'Year', 'YYYY', 4]].map(([key, label, placeholder, length]) => `<div><label for="wp-${key}">${label}</label><input id="wp-${key}" name="${key}" type="text" inputmode="numeric" autocomplete="bday-${key}" maxlength="${length}" placeholder="${placeholder}" required value="${e(state.dob[key])}" aria-describedby="wp-dob-note"></div>`).join('')}</div></fieldset><p class="wp-note" id="wp-dob-note">You must be 18 or older to continue. Your date of birth is used only for adult screening in this page and is not saved. This is self-declared screening, not independent age or identity verification.</p>${notice}<p class="wp-note"><a href="${e(privacy)}" target="_blank" rel="noopener noreferrer">Privacy Policy (opens in a new tab)</a></p>${error}<div class="wp-actions">${back()}<button class="wp-primary" type="submit">Begin my profile →</button></div></form></section>`;
  }
  function question() {
    const q = QUESTIONS[state.question];
    const selected = state.answers[q.id];
    const hint = q.kind === 'single' ? 'Choose one answer.' : q.max ? 'Choose up to three. “I’m not sure yet” is an answer on its own.' : q.exclusive === 'non_drinker' ? 'Choose all that apply. Not drinking or purchasing wine is an answer on its own.' : 'Choose all that apply. “I’m still exploring” is an answer on its own.';
    return `<section aria-labelledby="question-title"><div class="wp-progress-copy"><p class="wp-eyebrow">Question ${state.question + 1} of ${QUESTIONS.length}</p><span>${Math.round((state.question + 1) / QUESTIONS.length * 100)}%</span></div><progress class="wp-progress" value="${state.question + 1}" max="${QUESTIONS.length}" aria-label="Question progress"></progress><h2 id="question-title" tabindex="-1" data-step-heading>${e(q.title)}</h2><p class="wp-note" id="question-help">${hint}</p><form data-form="question" novalidate><fieldset class="wp-options" aria-describedby="question-help"><legend class="sr-only">${e(q.title)}</legend>${q.options.map((item) => `<label class="wp-option"><input type="${q.kind === 'single' ? 'radio' : 'checkbox'}" name="answer" value="${e(item.id)}" ${Array.isArray(selected) ? selected.includes(item.id) ? 'checked' : '' : selected === item.id ? 'checked' : ''}><span>${e(item.label)}</span></label>`).join('')}</fieldset>${q.max ? `<p class="wp-note wp-selection-count" data-wp-count>${Array.isArray(selected) ? selected.length : 0} of 3 selected</p>` : ''}${error}<div class="wp-actions">${back()}<button class="wp-primary" type="submit">${state.question === QUESTIONS.length - 1 ? 'Discover my profile' : 'Continue'} →</button></div></form></section>`;
  }
  function result() {
    const profile = { ...state.profile, journal: { ...state.profile.journal, href: journal } };
    return `${profileMarkup(profile)}<div class="wp-result-actions"><button class="wp-primary" type="button" data-action="print">Print / save my profile</button><button class="wp-back" type="button" data-action="edit">Edit my answers</button></div>${mountResultAction ? '<div data-wp-result-action></div>' : ''}${notice}`;
  }
  function render(focus = true) {
    cleanResultAction?.(); cleanResultAction = null;
    root.dataset.phase = state.view;
    status.textContent = '';
    app.innerHTML = (state.view === 'welcome' ? `<section class="wp-welcome"><p class="wp-kicker" tabindex="-1" data-step-heading>Every palate has a story.<br><em>Discover yours.</em></p><p class="wp-lede">Answer seven simple questions to discover your personalised Chateau Follent Wine Profile, including wine styles to explore, tasting suggestions and insights from the winery.</p><div class="wp-facts"><span>About two minutes</span><span>Seven simple questions</span><span>For adults 18+</span></div><button class="wp-primary" type="button" data-action="start">Discover My Wine Profile →</button><p class="wp-note">Free to explore. No purchase, account or subscription required.</p>${notice}</section>` : state.view === 'intro' ? intro() : state.view === 'question' ? question() : result()) + (state.view === 'welcome' ? '' : `<div class="wp-clear-row">${restart}</div>`);
    if (state.view === 'result' && mountResultAction) cleanResultAction = mountResultAction(app.querySelector('[data-wp-result-action]'), structuredClone(state.answers));
    if (focus) {
      const heading = app.querySelector('[data-step-heading], #profile-title');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }
  function readIdentity(form) {
    const fields = new FormData(form);
    state.name = String(fields.get('first_name') ?? '').trim();
    state.dob = Object.fromEntries(['day', 'month', 'year'].map((key) => [key, String(fields.get(key) ?? '').trim()]));
  }
  root.addEventListener('input', (event) => {
    if (event.target.closest('[data-form="intro"]')) readIdentity(event.target.form);
    clearError();
  }, options);
  root.addEventListener('change', (event) => {
    if (!event.target.matches('input[name="answer"]')) return;
    const q = QUESTIONS[state.question];
    const next = updateSelection(q, state.answers[q.id], event.target.value, event.target.checked);
    state.answers[q.id] = next.value;
    state.profile = null;
    app.querySelectorAll('input[name="answer"]').forEach((input) => { input.checked = Array.isArray(next.value) ? next.value.includes(input.value) : next.value === input.value; });
    if (q.max) { app.querySelector('[data-wp-count]').textContent = `${next.value.length} of 3 selected`; announce(`${next.value.length} of 3 selected`); }
    if (next.error) showError(next.error); else clearError();
  }, options);
  root.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form.matches('[data-form]')) return;
    event.preventDefault();
    clearError();
    if (form.dataset.form === 'intro') {
      readIdentity(form);
      if (!state.name || state.name.length > 80) return showError('Enter your first name (up to 80 characters).', form.elements.first_name);
      if (!/^\d{1,2}$/.test(state.dob.day) || !/^\d{1,2}$/.test(state.dob.month) || !/^\d{4}$/.test(state.dob.year)) return showError('Enter your complete date of birth as day, month and four-digit year.', form.elements.day);
      const age = screenAge(`${state.dob.year}-${state.dob.month.padStart(2, '0')}-${state.dob.day.padStart(2, '0')}`);
      if (!age.eligible) return showError(age.error, form.elements.day);
      if (restoring) { state.profile = generateProfile(state.answers); state.view = 'result'; restoring = false; }
      else { state.question = 0; state.view = 'question'; }
    } else {
      const q = QUESTIONS[state.question];
      const message = validateAnswer(q, state.answers[q.id]);
      if (message) return showError(message, form.querySelector('input'));
      if (state.question === QUESTIONS.length - 1) { state.profile = generateProfile(state.answers); state.view = 'result'; }
      else state.question += 1;
    }
    render();
    if (state.view === 'result') announce(readyAnnouncement);
  }, options);
  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'print') return window.print();
    if (action === 'restart') { onRestart?.(); state = fresh(); restoring = false; render(); announce(restartAnnouncement); return; }
    if (action === 'start') state.view = 'intro';
    if (action === 'edit') { state.view = 'question'; state.question = 0; state.profile = null; }
    if (action === 'back') {
      if (state.view === 'intro') state.view = 'welcome';
      else if (state.question > 0) state.question -= 1;
      else state.view = 'intro';
    }
    render();
  }, options);
  window.addEventListener('pagehide', () => { cleanResultAction?.(); cleanResultAction = null; restoring = false; state = fresh(); app.replaceChildren(); status.textContent = ''; }, options);
  window.addEventListener('pageshow', (event) => { if (event.persisted) render(false); }, options);
  render(false);
  return () => { controller.abort(); cleanResultAction?.(); state = fresh(); app.replaceChildren(); status.textContent = ''; };
}

if (typeof customElements !== 'undefined' && !customElements.get('cf-wine-profile')) {
  customElements.define('cf-wine-profile', class extends HTMLElement {
    connectedCallback() { this.cleanup ??= mountWineProfile(this); }
    disconnectedCallback() { this.cleanup?.(); this.cleanup = null; }
  });
}
