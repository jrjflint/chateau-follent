import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { QUESTIONS, STYLES, CONSENT_VERSION, QUIZ_VERSION } from '../assets/wine-profile/data.mjs';
import { screenAge, sydneyDate, updateSelection, validateAnswer, validateAnswers, generateProfile, captureAttribution, validEmail, createLead } from '../assets/wine-profile/core.mjs';
import { renderEmail, profileMarkup, escapeHtml } from '../assets/wine-profile/presentation.mjs';
import { submitLead } from '../assets/wine-profile/submission.mjs';

const now = new Date('2026-10-20T01:00:00Z');
const baseline = () => ({ wine_interests: ['red'], flavour_preferences: ['rich', 'savoury'], body_preference: 'full', sweetness_preference: 'dry', wine_occasions: ['meals'], discovery_interest: 'adventurous', education_interest: 'journey' });
const draft = (changes = {}) => ({ identity: { first_name: 'Alex', date_of_birth: '1990-05-12' }, contact: { email: 'alex@example.com', discovery_source: '', marketing_consent: false, birthday_messages_opt_in: false }, answers: baseline(), attribution: { utm: { utm_source: 'test' }, referrer: null }, ...changes });

test('Sydney calendar date determines the eighteenth birthday, including the UTC date boundary', () => {
  assert.equal(sydneyDate(new Date('2026-10-19T13:30:00Z')), '2026-10-20');
  assert.equal(screenAge('2008-10-20', now).eligible, true);
  assert.equal(screenAge('2008-10-21', now).eligible, false);
  assert.equal(screenAge('2008-10-19', now).age, 18);
  assert.equal(screenAge('2008-10-20', new Date('2026-10-19T12:30:00Z')).eligible, false);
});

test('invalid dates, missing fields, non-numeric dates and future dates are rejected', () => {
  for (const dob of ['', '2000-2-29', '2001-02-29', '1900-02-29', '2000-04-31', '2000-13-01', '2000-00-01', '2000-01-00', '0000-01-01', '3000-01-01', 'abcd-ef-gh']) assert.equal(screenAge(dob, now).eligible, false, dob);
  assert.equal(screenAge('2000-02-29', now).eligible, true);
});

test('leap-day birthday reaches eighteen on 1 March in a non-leap year', () => {
  assert.equal(screenAge('2008-02-29', new Date('2026-02-28T01:00:00Z')).eligible, false);
  assert.equal(screenAge('2008-02-29', new Date('2026-03-01T01:00:00Z')).eligible, true);
});

test('age band boundaries are calculated rather than supplied by a client', () => {
  for (const [age, band] of [[18, '18–24'], [24, '18–24'], [25, '25–34'], [34, '25–34'], [35, '35–44'], [44, '35–44'], [45, '45–54'], [54, '45–54'], [55, '55–64'], [64, '55–64'], [65, '65+']]) assert.equal(screenAge(`${2026 - age}-10-20`, now).age_band, band);
});

test('all multi-select exclusive options replace other choices and are replaced by a specific choice', () => {
  for (const q of QUESTIONS.filter((q) => q.kind === 'multi')) {
    const specific = q.options[0].id;
    const chosen = updateSelection(q, [specific], q.exclusive).value;
    assert.deepEqual(chosen, [q.exclusive]);
    assert.deepEqual(updateSelection(q, chosen, specific).value, [specific]);
    assert.deepEqual(updateSelection(q, chosen, q.exclusive, false).value, []);
    assert.match(validateAnswer(q, [specific, q.exclusive]), /on its own/);
  }
});

test('flavour limit rejects a fourth choice while preserving prior selections', () => {
  const q = QUESTIONS[1];
  const current = ['crisp', 'delicate', 'aromatic'];
  const result = updateSelection(q, current, 'rich');
  assert.deepEqual(result.value, current);
  assert.match(result.error, /up to 3/);
  assert.equal(updateSelection(q, updateSelection(q, current, 'crisp', false).value, 'rich').value.length, 3);
  assert.deepEqual(current, ['crisp', 'delicate', 'aromatic']);
});

test('every question requires valid answers and rejects forged, duplicate or excessive selections', () => {
  for (const q of QUESTIONS) {
    assert.ok(validateAnswer(q, undefined));
    assert.ok(validateAnswer(q, q.kind === 'single' ? 'forged' : ['forged']));
    assert.equal(validateAnswer(q, q.kind === 'single' ? q.options[0].id : [q.options[0].id]), '');
  }
  assert.ok(validateAnswer(QUESTIONS[0], ['red', 'red']));
  assert.throws(() => validateAnswers({}), /wine_interests/);
  assert.throws(() => updateSelection(QUESTIONS[0], [], 'forged'), /Unknown/);
});

test('single answers replace earlier responses; multi-select storage uses canonical order', () => {
  assert.equal(updateSelection(QUESTIONS[2], 'light', 'full').value, 'full');
  assert.deepEqual(updateSelection(QUESTIONS[0], ['white'], 'red').value, ['red', 'white']);
});

const profiles = {
  red: baseline(),
  white: { ...baseline(), wine_interests: ['white'], flavour_preferences: ['crisp', 'delicate'], body_preference: 'light', discovery_interest: 'familiar' },
  sweet: { ...baseline(), wine_interests: ['white', 'rose'], flavour_preferences: ['aromatic', 'smooth'], sweetness_preference: 'sweet', body_preference: 'light', education_interest: 'pairing' },
  mead: { ...baseline(), wine_interests: ['mead'], flavour_preferences: ['smooth'], sweetness_preference: 'sweet' },
  experimental: { ...baseline(), wine_interests: ['experimental'], flavour_preferences: ['savoury'], body_preference: 'medium', education_interest: 'winemaking' },
  unsure: { ...baseline(), wine_interests: ['exploring'], flavour_preferences: ['unsure'], body_preference: 'unsure', sweetness_preference: 'unsure', discovery_interest: 'learning' },
  nonDrinker: { ...baseline(), wine_occasions: ['non_drinker'], education_interest: 'regions' },
};

for (const [name, answers] of Object.entries(profiles)) {
  test(`${name} profile has three distinct, relevant recommendations and an 80–120-word summary`, () => {
    const result = generateProfile(answers);
    const words = result.summary.split(/\s+/).length;
    assert.ok(words >= 80 && words <= 120, `${words} words`);
    assert.equal(new Set(result.recommendations.map((s) => s.id)).size, 3);
    assert.equal(result.preferences.length, 5);
    for (const rec of result.recommendations) {
      assert.ok(rec.reason.length > 25);
      assert.ok(rec.sensory.length > 20);
      if (!answers.wine_interests.includes('exploring')) assert.ok(STYLES.find((s) => s.id === rec.id).categories.some((c) => answers.wine_interests.includes(c)));
    }
    assert.deepEqual(generateProfile(answers), result);
  });
}

test('different answers and answer edits change results, exercise and suggested journal', () => {
  const red = generateProfile(profiles.red);
  const white = generateProfile(profiles.white);
  assert.notEqual(red.title, white.title);
  assert.notDeepEqual(red.recommendations, white.recommendations);
  assert.notDeepEqual(red.recommendations, generateProfile(profiles.sweet).recommendations);
  assert.notDeepEqual(red.journal, generateProfile(profiles.nonDrinker).journal);
  const edited = generateProfile({ ...profiles.red, sweetness_preference: 'off_dry', wine_interests: ['white'] });
  assert.notDeepEqual(edited.recommendations, red.recommendations);
  assert.match(edited.exercise.title, /sweetness/);
  assert.deepEqual(generateProfile(profiles.red), red);
});

test('uncertain preferences offer introductory categories; non-drinkers receive no drinking exercise', () => {
  const unsure = generateProfile(profiles.unsure);
  assert.equal(unsure.title, 'Discovering Your Wine Preferences');
  assert.deepEqual(new Set(unsure.recommendations.map((s) => s.id)), new Set(['pinot_noir', 'riesling', 'brut']));
  const learning = generateProfile(profiles.nonDrinker);
  assert.equal(learning.learningOnly, true);
  assert.match(learning.exercise.text, /No alcohol or wine purchase is needed/);
  assert.doesNotMatch(learning.exercise.text, /small sample|take a sip/);
});

test('selection order does not change recommendations', () => {
  const answers = { ...baseline(), wine_interests: ['white', 'red'], flavour_preferences: ['crisp', 'savoury', 'aromatic'] };
  assert.deepEqual(generateProfile(answers).recommendations, generateProfile({ ...answers, wine_interests: [...answers.wine_interests].reverse(), flavour_preferences: [...answers.flavour_preferences].reverse() }).recommendations);
});

test('600 varied valid questionnaires retain complete results and summary length limits', () => {
  let seed = 39;
  const random = (size) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % size; };
  for (let i = 0; i < 600; i++) {
    const answers = {};
    for (const q of QUESTIONS) {
      if (q.kind === 'single') answers[q.id] = q.options[random(q.options.length)].id;
      else {
        let selected = [];
        for (let j = 0; j < 1 + random(4); j++) selected = updateSelection(q, selected, q.options[random(q.options.length)].id).value;
        answers[q.id] = selected;
      }
    }
    const profile = generateProfile(answers);
    const count = profile.summary.split(/\s+/).length;
    assert.ok(count >= 80 && count <= 120, `${count}: ${profile.summary}`);
    assert.equal(profile.recommendations.length, 3);
    assert.ok(profile.title && profile.exercise.text && profile.journal.href);
  }
});

test('email validation rejects missing, malformed and oversized addresses', () => {
  for (const value of ['', 'alex', '@example.com', 'alex@', 'alex@example', 'a b@example.com', 'a@example..com ', `${'a'.repeat(255)}@example.com`]) {
    assert.equal(validEmail(value), false, value);
  }
  assert.equal(validEmail('  alex+profile@example.com '), true);
});

test('lead schema records all answers and independent consent combinations without mutating the draft', () => {
  for (const marketing of [false, true]) for (const birthday of [false, true]) {
    const source = draft();
    source.contact.marketing_consent = marketing;
    source.contact.birthday_messages_opt_in = birthday;
    const lead = createLead(source, now);
    assert.equal(lead.marketing_consent, marketing);
    assert.equal(lead.birthday_messages_opt_in, birthday);
    assert.equal(lead.consent_timestamp, now.toISOString());
    assert.equal(lead.created_at, now.toISOString());
    assert.equal(lead.consent_copy_version, CONSENT_VERSION);
    assert.equal(lead.quiz_version, QUIZ_VERSION);
    assert.equal(lead.age_screening_method, 'self_declared_date_of_birth');
    assert.equal(lead.age_band, '35–44');
    assert.equal(lead.discovery_source, null);
    assert.equal(lead.recommended_styles.length, 3);
    for (const q of QUESTIONS) assert.deepEqual(lead[q.id], source.answers[q.id]);
    lead.wine_interests.push('white');
    lead.attribution.utm.utm_source = 'changed';
    assert.deepEqual(source.answers.wine_interests, ['red']);
    assert.equal(source.attribution.utm.utm_source, 'test');
  }
});

test('lead creation revalidates age, name, email, answers, source and boolean consent', () => {
  const changes = [
    { identity: { first_name: 'Alex', date_of_birth: '2010-01-01' } },
    { identity: { first_name: ' ', date_of_birth: '1990-01-01' } },
    { identity: { first_name: 'x'.repeat(81), date_of_birth: '1990-01-01' } },
    { contact: { ...draft().contact, email: 'invalid' } },
    { contact: { ...draft().contact, discovery_source: 'forged' } },
    { contact: { ...draft().contact, marketing_consent: 'true' } },
    { answers: { ...baseline(), wine_interests: [] } },
  ];
  for (const change of changes) assert.throws(() => createLead(draft(change), now));
});

test('attribution is allowlisted, bounded, separate from self-report and strips referrer secrets', () => {
  const attribution = captureAttribution('https://example.com/wine-profile.html?utm_source=instagram&email=secret@example.com&token=private&utm_campaign=' + 'x'.repeat(220), 'https://ref.example/path?secret=token#private');
  assert.deepEqual(Object.keys(attribution.utm).sort(), ['utm_campaign', 'utm_source']);
  assert.equal(attribution.utm.utm_campaign.length, 200);
  assert.equal(attribution.referrer, 'https://ref.example/path');
  assert.equal(captureAttribution('https://example.com/', 'not a URL').referrer, null);
  assert.equal(captureAttribution('https://example.com/', 'javascript:alert(1)').referrer, null);
});

test('mock submissions, including repeated submissions, never send, persist or claim delivery', async () => {
  const lead = createLead(draft(), now);
  for (let i = 0; i < 3; i++) assert.deepEqual(await submitLead(lead), { status: 'preview', email_sent: false, submitted: false });
  await assert.rejects(submitLead(lead, async () => { throw new Error('Offline'); }), /Offline/);
  for (const response of [undefined, { status: 'success' }, { status: 'delivered', email_sent: false, delivery_id: '123' }, { status: 'delivered', email_sent: true }, { status: 'preview', email_sent: true }]) await assert.rejects(submitLead(lead, async () => response), /not confirmed/);
  assert.equal((await submitLead(lead, async () => ({ status: 'delivered', email_sent: true, delivery_id: 'confirmed-123' }))).status, 'delivered');
});

test('email and page render the actual profile, escape personal text and never include DOB', () => {
  const profile = generateProfile(baseline());
  const html = renderEmail(profile, '<img src=x onerror=alert(1)>');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
  assert.match(html, /No email has been sent/);
  assert.doesNotMatch(html, /<script|1990-05-12|\*\|FNAME\|\*|googletagmanager/i);
  assert.match(html, /https:\/\/chateaufollent\.com\.au\/vintages.html/);
  for (const rec of profile.recommendations) assert.ok(html.includes(escapeHtml(rec.name)));
  assert.ok(html.includes(escapeHtml(profile.summary)));
  assert.ok(profileMarkup(profile).includes(escapeHtml(profile.title)));
  assert.ok(profileMarkup(generateProfile(profiles.nonDrinker)).includes('Wine styles to learn about'));
});

test('quiz entry point and modules contain no tracking, persistence APIs or network submissions', async () => {
  const html = await readFile(new URL('../wine-profile.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /googletagmanager|fillout|<form/i);
  for (const file of ['app.mjs', 'core.mjs', 'submission.mjs', 'presentation.mjs']) {
    const source = await readFile(new URL(`../assets/wine-profile/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|console\.|\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
  }
});
