import { QUESTIONS, DISCOVERY_SOURCES, CONSENT } from './data.mjs';
import { screenAge, updateSelection, validateAnswer, generateProfile, validEmail, captureAttribution, createLead } from './core.mjs';
import { escapeHtml as e, profileMarkup, renderEmail } from './presentation.mjs';
import { submitLead } from './submission.mjs';

const app = document.getElementById('wp-app');
const status = document.getElementById('wp-status');
let state;
let submitting = false;
let generation = 0;
const freshState = () => ({ view: 'welcome', question: 0, identity: { first_name: '', date_of_birth: '' }, dob: { day: '', month: '', year: '' }, answers: {}, contact: { email: '', discovery_source: '', marketing_consent: false, birthday_messages_opt_in: false }, attribution: captureAttribution(location.href, document.referrer), profile: null, lead: null });
const prototypeNotice = '<p class="wp-prototype"><strong>Prototype preview only.</strong> No email is sent and your entered details are not submitted. They stay in this page until you leave or restart.</p>';
const back = (text = 'Back') => `<button type="button" class="wp-back" data-action="back"><span aria-hidden="true">←</span> ${text}</button>`;
const error = '<p id="wp-error" class="wp-error" role="alert" aria-atomic="true"></p>';
const restart = '<button type="button" class="wp-text-button" data-action="restart">Restart and clear my details</button>';

function announce(message) { status.textContent = message; }
function showError(message, target) {
  document.getElementById('wp-error').textContent = message;
  if (target) { target.setAttribute('aria-invalid', 'true'); target.focus(); }
}
function clearError() {
  const element = document.getElementById('wp-error');
  if (element) element.textContent = '';
  app.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
}
function focusStep() {
  const heading = app.querySelector('[data-step-heading]') ?? document.getElementById('profile-title');
  if (heading) { heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start', behavior: 'auto' }); }
}

function welcomeMarkup() {
  return `<section class="wp-welcome" aria-labelledby="welcome-title"><p class="wp-kicker" id="welcome-title" tabindex="-1" data-step-heading>Every palate has a story.<br><em>Discover yours.</em></p><p class="wp-lede">Answer seven simple questions and receive your personalised Chateau Follent Wine Profile, including wine styles to explore, tasting suggestions and insights from the winery.</p><div class="wp-facts"><span>About two minutes</span><span>Seven simple questions</span><span>For adults 18+</span></div><button class="cta-button wp-primary" data-action="start">Discover My Wine Profile <span aria-hidden="true">→</span></button><p class="wp-note">Free to explore. No purchase, account or membership commitment.</p><div class="wp-welcome-bottom"><span class="wp-line" aria-hidden="true"></span><p>Get to know your palate.<br>Get to know the beginning of our winery.</p></div>${prototypeNotice}</section>`;
}

function introMarkup() {
  return `<section aria-labelledby="intro-title"><p class="wp-eyebrow">Before we begin</p><h2 id="intro-title" tabindex="-1" data-step-heading>A proper introduction.</h2><p>What should we call you? First, a little information to keep this an adults-only experience.</p><form id="intro-form" novalidate><label class="wp-label" for="first-name">First name</label><input id="first-name" name="first_name" autocomplete="given-name" maxlength="80" required value="${e(state.identity.first_name)}" aria-describedby="wp-error"><fieldset class="wp-dob"><legend>Date of birth</legend><div class="wp-date-fields"><div><label for="dob-day">Day</label><input id="dob-day" name="day" type="text" inputmode="numeric" autocomplete="bday-day" maxlength="2" placeholder="DD" value="${e(state.dob.day)}" aria-describedby="dob-note wp-error" required></div><div><label for="dob-month">Month</label><input id="dob-month" name="month" type="text" inputmode="numeric" autocomplete="bday-month" maxlength="2" placeholder="MM" value="${e(state.dob.month)}" aria-describedby="dob-note wp-error" required></div><div><label for="dob-year">Year</label><input id="dob-year" name="year" type="text" inputmode="numeric" autocomplete="bday-year" maxlength="4" placeholder="YYYY" value="${e(state.dob.year)}" aria-describedby="dob-note wp-error" required></div></div></fieldset><p class="wp-note" id="dob-note">You must be 18 or older to continue. Your date of birth supports adult eligibility screening, age-band analysis and, only if you choose later, a birthday message. Self-declared birth details are not independent age or identity verification.</p><p class="wp-note">In this prototype, your details stay in temporary page memory. You can leave without submitting anything. <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy <span class="sr-only">(opens in a new tab)</span></a></p>${error}<div class="wp-actions">${back()}<button class="cta-button wp-primary" type="submit">Begin my profile <span aria-hidden="true">→</span></button></div></form></section>`;
}

function questionMarkup() {
  const question = QUESTIONS[state.question];
  const selected = state.answers[question.id];
  const hint = question.kind === 'single' ? 'Choose one answer.' : question.max ? 'Choose up to three. “I’m not sure yet” is an answer on its own.' : question.exclusive === 'non_drinker' ? 'Choose all that apply. Not drinking or purchasing wine is an answer on its own.' : 'Choose all that apply. “I’m still exploring” is an answer on its own.';
  return `<section aria-labelledby="question-title"><div class="wp-progress-copy"><p class="wp-eyebrow">Question ${state.question + 1} of 7</p><span>${Math.round((state.question + 1) / 7 * 100)}%</span></div><progress class="wp-progress" value="${state.question + 1}" max="7" aria-label="Question progress">${state.question + 1} of 7</progress><h2 id="question-title" tabindex="-1" data-step-heading>${e(question.title)}</h2><p class="wp-note" id="question-help">${hint}</p><form id="question-form" novalidate><fieldset class="wp-options" aria-describedby="question-help wp-error"><legend class="sr-only">${e(question.title)}</legend>${question.options.map((option) => `<label class="wp-option"><input type="${question.kind === 'single' ? 'radio' : 'checkbox'}" name="answer" value="${e(option.id)}" ${Array.isArray(selected) ? selected.includes(option.id) ? 'checked' : '' : selected === option.id ? 'checked' : ''}><span>${e(option.label)}</span></label>`).join('')}</fieldset>${question.max ? `<p class="wp-note wp-selection-count" id="selection-count">${Array.isArray(selected) ? selected.length : 0} of 3 selected</p>` : ''}${error}<div class="wp-actions">${back()}<button class="cta-button wp-primary" type="submit">${state.question === 6 ? 'Discover my profile' : 'Continue'} <span aria-hidden="true">→</span></button></div></form><div class="wp-clear-row">${restart}</div></section>`;
}

function captureMarkup() {
  const profile = state.profile;
  const preview = profile.summary.split(/(?<=[.!?])\s/)[0];
  return `<section aria-labelledby="capture-title"><p class="wp-eyebrow">Seven answers. A new starting point.</p><h2 id="capture-title" tabindex="-1" data-step-heading>Your Wine Profile is ready.</h2><div class="wp-result-teaser"><span class="wp-eyebrow">A first look</span><h3>${e(profile.title)}</h3><p>${e(preview)}</p><p class="wp-note">Your complete profile includes three style suggestions, an exercise of your own and a topic from the winery.</p></div><p>Enter your email address and we'll send you your personalised Chateau Follent Wine Profile.</p>${prototypeNotice}<form id="contact-form" novalidate><label class="wp-label" for="profile-email">Email address</label><input id="profile-email" name="email" type="email" autocomplete="email" maxlength="254" required value="${e(state.contact.email)}" aria-describedby="wp-error email-purpose"><p id="email-purpose" class="wp-note">Here, a valid email opens your full profile and a mock email preview. It is not sent to Chateau Follent or added to a mailing list.</p><label class="wp-label" for="discovery-source">Where did you first hear about Chateau Follent? <span class="wp-optional">Optional</span></label><select id="discovery-source" name="discovery_source"><option value="">Choose a source, or skip</option>${DISCOVERY_SOURCES.map((s) => `<option value="${s.id}" ${state.contact.discovery_source === s.id ? 'selected' : ''}>${e(s.label)}</option>`).join('')}</select><fieldset class="wp-consents"><legend>Your preferences <span class="wp-optional">Both optional</span></legend><label class="wp-check"><input type="checkbox" name="marketing_consent" ${state.contact.marketing_consent ? 'checked' : ''}><span>${e(CONSENT.marketing)}</span></label><label class="wp-check"><input type="checkbox" name="birthday_messages_opt_in" ${state.contact.birthday_messages_opt_in ? 'checked' : ''}><span>${e(CONSENT.birthday)}</span></label></fieldset><p class="wp-note">Receiving your requested profile is separate from ongoing marketing. You can leave both boxes unchecked. These prototype choices are not submitted. <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy <span class="sr-only">(opens in a new tab)</span></a></p>${error}<div class="wp-actions">${back('My answers')}<button class="cta-button wp-primary" type="submit">Preview My Wine Profile <span aria-hidden="true">→</span></button></div><p class="wp-note wp-submit-note">Preview only. No email is sent and no details are submitted.</p></form><div class="wp-clear-row">${restart}</div></section>`;
}

function resultMarkup() {
  return `${prototypeNotice}${profileMarkup(state.profile)}<div class="wp-result-actions"><button class="cta-button wp-primary" data-action="print">Print / save my profile</button><button type="button" class="wp-back" data-action="edit">Edit my answers</button></div><section class="wp-section wp-email-section" aria-labelledby="email-title"><p class="wp-eyebrow">The letter to your inbox · Preview only</p><h3 id="email-title">Your personalised email</h3><p class="wp-note">Prepared for ${e(state.identity.first_name)} · ${e(state.contact.email)}<br>No email has been sent. No subscription has been created.</p><details id="email-details"><summary>Open the email preview</summary><iframe id="email-preview" title="Your personalised Chateau Follent Wine Profile email preview" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe></details><p class="wp-note">${state.contact.marketing_consent ? 'Winery updates selected' : 'Winery updates not selected'} · ${state.contact.birthday_messages_opt_in ? 'Birthday message selected' : 'Birthday message not selected'}. Preferences are for this mock preview only.</p></section><div class="wp-clear-row">${restart}</div>`;
}

function render(focus = true) {
  status.textContent = '';
  document.body.dataset.phase = state.view;
  const markup = { welcome: welcomeMarkup, intro: introMarkup, question: questionMarkup, capture: captureMarkup, result: resultMarkup }[state.view];
  app.innerHTML = markup() + (state.view === 'intro' ? `<div class="wp-clear-row">${restart}</div>` : '');
  if (state.view === 'result') document.getElementById('email-preview').srcdoc = renderEmail(state.profile, state.identity.first_name);
  if (focus) focusStep();
}

function readIdentity(form) {
  const fields = new FormData(form);
  state.identity.first_name = String(fields.get('first_name') ?? '').trim();
  state.dob = Object.fromEntries(['day', 'month', 'year'].map((k) => [k, String(fields.get(k) ?? '').trim()]));
  const { year, month, day } = state.dob;
  state.identity.date_of_birth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
function readContact(form) {
  const fields = new FormData(form);
  state.contact = { email: String(fields.get('email') ?? '').trim(), discovery_source: String(fields.get('discovery_source') ?? ''), marketing_consent: fields.has('marketing_consent'), birthday_messages_opt_in: fields.has('birthday_messages_opt_in') };
}

app.addEventListener('input', (event) => {
  if (event.target.closest('#intro-form')) readIdentity(event.target.form);
  if (event.target.closest('#contact-form')) readContact(event.target.form);
  clearError();
});
app.addEventListener('change', (event) => {
  if (!event.target.matches('input[name="answer"]')) return;
  const question = QUESTIONS[state.question];
  const result = updateSelection(question, state.answers[question.id], event.target.value, event.target.checked);
  state.answers[question.id] = result.value;
  state.profile = null;
  state.lead = null;
  app.querySelectorAll('input[name="answer"]').forEach((input) => { input.checked = Array.isArray(result.value) ? result.value.includes(input.value) : input.value === result.value; });
  if (question.max) {
    const message = `${result.value.length} of 3 selected`;
    document.getElementById('selection-count').textContent = message;
    announce(message);
  }
  if (result.error) showError(result.error);
  else clearError();
});

app.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  clearError();
  if (form.id === 'intro-form') {
    readIdentity(form);
    if (!state.identity.first_name || state.identity.first_name.length > 80) return showError('Enter your first name (up to 80 characters).', form.elements.first_name);
    if (!/^\d{1,2}$/.test(state.dob.day) || !/^\d{1,2}$/.test(state.dob.month) || !/^\d{4}$/.test(state.dob.year)) return showError('Enter your complete date of birth as day, month and four-digit year.', form.elements.day);
    const screened = screenAge(state.identity.date_of_birth);
    if (!screened.eligible) return showError(screened.error, form.elements.day);
    state.view = 'question'; state.question = 0; render();
  } else if (form.id === 'question-form') {
    const question = QUESTIONS[state.question];
    const message = validateAnswer(question, state.answers[question.id]);
    if (message) return showError(message, form.querySelector('input'));
    if (state.question === QUESTIONS.length - 1) { state.profile = generateProfile(state.answers); state.view = 'capture'; }
    else state.question += 1;
    render();
  } else if (form.id === 'contact-form' && !submitting) {
    readContact(form);
    if (!validEmail(state.contact.email) || form.elements.email.validity.typeMismatch) return showError('Enter a valid email address, such as name@example.com.', form.elements.email);
    const button = form.querySelector('[type="submit"]');
    const token = generation;
    submitting = true; button.disabled = true; button.textContent = 'Preparing preview…';
    try {
      const lead = createLead(state);
      const response = await submitLead(lead);
      if (token !== generation) return;
      if (response.status !== 'preview') throw new Error('This prototype supports previews only.');
      state.lead = lead;
      state.profile = generateProfile(state.answers);
      state.view = 'result';
      render(); announce('Your profile preview is ready. No email was sent and no details were submitted.');
    } catch {
      if (token === generation) showError('We could not prepare the preview. No email delivery has been confirmed. Please try again.');
    } finally {
      if (token === generation) { submitting = false; button.disabled = false; button.textContent = 'Preview My Wine Profile →'; }
    }
  }
});

app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'print') return window.print();
  if (action === 'restart') {
    generation += 1; submitting = false; state = freshState(); render(); announce('Your entered details have been cleared.'); return;
  }
  if (submitting) return;
  if (action === 'start') state.view = 'intro';
  if (action === 'edit') { state.view = 'question'; state.question = 0; state.lead = null; }
  if (action === 'back') {
    if (state.view === 'intro') state.view = 'welcome';
    else if (state.view === 'question' && state.question > 0) state.question -= 1;
    else if (state.view === 'question') state.view = 'intro';
    else if (state.view === 'capture') { state.view = 'question'; state.question = 6; }
  }
  render();
});

// Clear both in-memory data and rendered form values before a page enters the back/forward cache.
window.addEventListener('pagehide', () => {
  generation += 1; submitting = false; state = freshState(); app.replaceChildren(); status.textContent = '';
});
window.addEventListener('pageshow', (event) => { if (event.persisted) render(false); });
state = freshState();
render(false);
