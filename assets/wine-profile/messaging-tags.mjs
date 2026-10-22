import { createHash } from 'node:crypto';
import { QUESTIONS, QUIZ_VERSION } from './data.mjs';
import { generateProfile, validateAnswers } from './core.mjs';

export const TAG_PREFIX = 'cfwp' + QUIZ_VERSION.replaceAll('.', '_');
export const fragmentId = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);
export const sentences = (text) => text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((value) => value.trim() + ' ') ?? [];
const numbered = (prefix, values, count) => Object.fromEntries(Array.from({ length: count }, (_, i) => [prefix + i, values[i] ?? '']));

export function canonicalAnswers(answers) {
  validateAnswers(answers);
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, q.kind === 'multi' ? q.options.filter((option) => answers[q.id].includes(option.id)).map((option) => option.id) : answers[q.id]]));
}

export function messagingParts(profile) {
  const summary = sentences(profile.summary);
  const first = summary[0].split(', with an interest in ');
  const second = summary[1].split(' and ');
  if (first.length !== 2 || second.length !== 2 || summary.length !== 6) throw new Error('The summary format changed; update the Messaging compiler.');
  const parts = {
    title: profile.title,
    ...numbered('summary', [first[0] + ', with an interest in ', first[1], second[0] + ' and ', second[1], ...summary.slice(2)], 8),
    ...numbered('preference', profile.preferences.map((pref) => pref.value), 5),
    exerciseTitle: profile.exercise.title,
    ...numbered('exercise', sentences(profile.exercise.text), 8),
    journalTitle: profile.journal.title, journalDetail: profile.journal.detail,
    styleHeading: profile.learningOnly ? 'Wine styles to learn about' : 'Styles worth exploring',
  };
  profile.recommendations.forEach((style, i) => Object.assign(parts, {
    ['style' + i]: style.name, ['sensory' + i]: style.sensory,
    ...numbered('reason' + i + '_', sentences(style.reason), 5),
  }));
  return parts;
}

export function buildMessagingTags(rawAnswers, registry) {
  const answers = canonicalAnswers(rawAnswers);
  const profile = generateProfile(answers);
  const parts = messagingParts(profile);
  const tags = Object.entries(parts).filter(([, text]) => text).map(([slot, text]) => {
    const id = fragmentId(text);
    if (registry && registry[id] !== text) throw new Error('Messaging content is not compiled for this result.');
    return `${TAG_PREFIX}:${slot}:${id}`;
  });
  for (const q of QUESTIONS) for (const value of Array.isArray(answers[q.id]) ? answers[q.id] : [answers[q.id]]) tags.push(`${TAG_PREFIX}:answer:${q.id}=${value}`);
  profile.recommendations.forEach((style, i) => tags.push(`${TAG_PREFIX}:recommendation:${i + 1}=${style.id}`));
  tags.push(`${TAG_PREFIX}:count:${Object.values(parts).filter(Boolean).length}`);
  tags.push(`${TAG_PREFIX}:version:${QUIZ_VERSION}`);
  return { profile, parts, tags };
}

export function decodeMessagingTags(tags, registry) {
  const parts = {};
  for (const tag of tags) {
    const [prefix, slot, id] = tag.split(':');
    if (prefix === TAG_PREFIX && Object.hasOwn(registry, id)) {
      if (Object.hasOwn(parts, slot)) throw new Error('Duplicate Messaging slot.');
      parts[slot] = registry[id];
    }
  }
  return parts;
}
