import { QUESTIONS, QUIZ_VERSION } from './data.mjs';
import { validateAnswers } from './core.mjs';

// Temporary answer-only sign-in handoff for Lord James Follent; not used by Stage 1.
const KEY = 'cf-wine-profile-login-v1';
const TTL = 20 * 60 * 1000;
export function answerIds(answers) {
  validateAnswers(answers);
  return Object.fromEntries(QUESTIONS.map((question) => [question.id, question.kind === 'multi'
    ? question.options.filter((option) => answers[question.id].includes(option.id)).map((option) => option.id)
    : answers[question.id]]));
}
export function rememberForLogin(storage, answers, now = Date.now()) {
  storage.setItem(KEY, JSON.stringify({ version: QUIZ_VERSION, expiresAt: now + TTL, answers: answerIds(answers) }));
}
export function clearLoginHandoff(storage) { storage.removeItem(KEY); }
export function restoreAfterLogin(storage, now = Date.now()) {
  const raw = storage.getItem(KEY);
  clearLoginHandoff(storage);
  if (!raw || raw.length > 4096) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version !== QUIZ_VERSION || !Number.isFinite(value.expiresAt) || value.expiresAt <= now || value.expiresAt > now + TTL) return null;
    return { answers: answerIds(value.answers), adultScreenRequired: true };
  } catch { return null; }
}
