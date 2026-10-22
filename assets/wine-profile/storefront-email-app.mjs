import { mountWineProfile } from './storefront-app.mjs';
import { restoreAfterLogin, clearLoginHandoff } from './login-handoff.mjs';
import { mountEmailPanel } from './email-panel.mjs';

// Separate Stage 2 entry for Lord James Follent; generated disabled and never loaded by Stage 1.
export function mountEmailWineProfile(root, { sessionFor, navigate, storage = () => window.sessionStorage } = {}) {
  if (root.dataset.emailEnabled !== 'true') return mountWineProfile(root);
  let restored;
  try { restored = restoreAfterLogin(storage()); } catch { /* Storage can be disabled without affecting the quiz. */ }
  const signupForm = root.querySelector('[data-wp-native-signup]');
  return mountWineProfile(root, {
    restoredAnswers: restored?.answers,
    readyAnnouncement: 'Your Wine Profile is ready. Saving and emailing it is optional.',
    restartLabel: 'Restart this quiz',
    restartAnnouncement: 'Your entries on this page have been cleared. A profile already saved to your account remains saved.',
    onRestart: () => { try { clearLoginHandoff(storage()); } catch { /* The quiz still resets when storage is unavailable. */ } },
    privacyNotice: '<p class="wp-note">Your quiz entries stay in this page unless you choose to save and email your profile. That option requires sign-in and a confirmed marketing subscription. Only answer choices are kept temporarily when you choose sign-in or signup; your name and date of birth are excluded.</p>',
    mountResultAction: (host, answers) => mountEmailPanel(host, {
      answers, adultConfirmed: true, signupForm, loginUrl: root.dataset.loginUrl, storage,
      ...(navigate ? { navigate } : {}),
      ...(sessionFor ? { session: sessionFor(answers) } : {}),
    }),
  });
}

if (typeof customElements !== 'undefined' && !customElements.get('cf-wine-profile-email')) {
  customElements.define('cf-wine-profile-email', class extends HTMLElement {
    connectedCallback() { this.cleanup ??= mountEmailWineProfile(this); }
    disconnectedCallback() { this.cleanup?.(); this.cleanup = null; }
  });
}
