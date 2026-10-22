import { createHash } from 'node:crypto';
import { QUESTIONS, QUIZ_VERSION } from '../../../assets/wine-profile/data.mjs';
import { canonicalAnswers, buildMessagingTags } from '../../../assets/wine-profile/messaging-tags.mjs';
import { RequestError } from './security.mjs';

export function validateProfileRequest(input, registry) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new RequestError('invalid_request');
  const fields = ['quizVersion', 'submissionId', 'answers', 'adultConfirmed', 'csrfToken'];
  if (Object.keys(input).some((key) => !fields.includes(key))) throw new RequestError('unexpected_field');
  if (input.quizVersion !== QUIZ_VERSION) throw new RequestError('quiz_version_changed', 409);
  if (input.adultConfirmed !== true) throw new RequestError('adult_screen_required', 403);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input.submissionId ?? '')) throw new RequestError('invalid_submission_id');
  if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers) ||
      Object.keys(input.answers).length !== QUESTIONS.length || Object.keys(input.answers).some((key) => !QUESTIONS.some((question) => question.id === key))) throw new RequestError('invalid_answers');
  let answers, result;
  try { answers = canonicalAnswers(input.answers); result = buildMessagingTags(answers, registry); }
  catch { throw new RequestError('invalid_answers'); }
  const fingerprint = createHash('sha256').update(JSON.stringify({ quizVersion: QUIZ_VERSION, answers })).digest('hex');
  return { quizVersion: QUIZ_VERSION, submissionId: input.submissionId, answers, fingerprint, profile: result.profile, tags: result.tags };
}

export function planProfileTags(existingTags, nextTags, reservedSlots = 1) {
  if (!Array.isArray(existingTags) || !Array.isArray(nextTags)) throw new RequestError('invalid_tags');
  const isProfileTag = (tag) => /^cfwp\d+_\d+_\d+:/.test(tag);
  if (nextTags.some((tag) => typeof tag !== 'string' || !isProfileTag(tag))) throw new RequestError('invalid_tags');
  const remove = existingTags.filter(isProfileTag);
  const unrelated = existingTags.filter((tag) => !isProfileTag(tag));
  if (unrelated.length + new Set(nextTags).size + reservedSlots > 250) throw new RequestError('customer_tag_capacity', 409);
  return { remove, add: [...new Set(nextTags)], unrelated };
}
