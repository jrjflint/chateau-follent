import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { QUESTIONS } from '../assets/wine-profile/data.mjs';
import { generateProfile } from '../assets/wine-profile/core.mjs';
import { escapeHtml } from '../assets/wine-profile/presentation.mjs';
import { buildMessagingTags, canonicalAnswers, decodeMessagingTags, messagingParts } from '../assets/wine-profile/messaging-tags.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const registry = JSON.parse(await read('shopify/wine-profile/messaging/content-registry.json'));
const fixtures = JSON.parse(await read('shopify/wine-profile/messaging/proof-fixtures.json'));
const email = await read('shopify/wine-profile/messaging/wine-profile-email.liquid');
const { Liquid } = createRequire(join(tmpdir(), 'chateau-wine-profile-qa', 'package.json'))('liquidjs');
const engine = new Liquid({ strictVariables: true, strictFilters: true });
const parsed = engine.parse(email);
const context = (tags) => ({ customer: { tags, first_name: '<Alex & Co>' }, shop: { url: 'https://example.com' }, unsubscribe_url: 'https://example.com/unsubscribe', open_tracking_block: '' });
let seed = 719;
const random = (n) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
function varied() {
  return Object.fromEntries(QUESTIONS.map((q) => {
    if (q.kind === 'single') return [q.id, q.options[random(q.options.length)].id];
    if (random(5) === 0) return [q.id, [q.exclusive]];
    const options = q.options.filter((option) => option.id !== q.exclusive);
    const count = 1 + random(q.max ?? options.length);
    const selected = new Set();
    while (selected.size < count) selected.add(options[random(options.length)].id);
    return [q.id, [...selected]];
  }));
}

test('Shopify section has valid inline JavaScript and page-template wiring', async () => {
  const section = await read('shopify/wine-profile/sections/wine-profile.liquid');
  const script = section.match(/<script>([\s\S]+)<\/script>/)[1];
  assert.doesNotThrow(() => new Script(script));
  const schema = JSON.parse(section.match(/{% schema %}([\s\S]+){% endschema %}/)[1]);
  assert.deepEqual(schema.enabled_on.templates, ['page']);
  assert.equal(schema.limit, 1);
  assert.equal(JSON.parse(await read('shopify/wine-profile/templates/page.wine-profile.json')).sections.main.type, 'wine-profile');
});

test('Stage 1 controller does not collect contact details, persist data or invoke transport', async () => {
  const source = await read('assets/wine-profile/storefront-app.mjs');
  assert.doesNotMatch(source, /fetch\(|localStorage|sessionStorage|XMLHttpRequest|submitLead|contact-form|type="email"|marketing_consent|renderEmail/);
  assert.match(source, /AbortController/);
  assert.match(source, /disconnectedCallback\(\)/);
  assert.match(source, /pagehide/);
  assert.match(source, /state\.view = 'result'/);
});

test('separate Stage 2 section is disabled and native signup requires an unchecked choice', async () => {
  const section = await read('shopify/wine-profile/sections/wine-profile-email.liquid');
  assert.doesNotThrow(() => new Script(section.match(/<script>([\s\S]+)<\/script>/)[1]));
  assert.match(section, /data-email-enabled="false"/);
  assert.match(section, /routes\.storefront_login_url/);
  assert.match(section, /{% form 'customer'/);
  const checkbox = section.match(/<input[^>]+type="checkbox"[^>]+data-wp-signup-consent[^>]*>/)[0];
  assert.match(checkbox, /required/);
  assert.doesNotMatch(checkbox, /\bchecked\b/);
  assert.equal(JSON.parse(await read('shopify/wine-profile/templates/page.wine-profile-email.json')).sections.main.type, 'wine-profile-email');
  const stageOne = await read('shopify/wine-profile/sections/wine-profile.liquid');
  assert.doesNotMatch(stageOne, /data-email-enabled|data-wp-native-signup|createEmailSession|mountEmailPanel/);
});

test('Messaging tags round-trip full profiles for 10000 varied valid questionnaires', () => {
  for (let i = 0; i < 10000; i++) {
    const answers = varied();
    const result = buildMessagingTags(answers, registry);
    const decoded = decodeMessagingTags(result.tags, registry);
    for (const [slot, text] of Object.entries(result.parts)) assert.equal(decoded[slot] ?? '', text, slot);
    assert.equal(Array.from({ length: 8 }, (_, n) => decoded['summary' + n] ?? '').join('').trim(), result.profile.summary);
    assert.equal(Array.from({ length: 8 }, (_, n) => decoded['exercise' + n] ?? '').join('').trim(), result.profile.exercise.text);
    for (let n = 0; n < 3; n++) assert.equal(Array.from({ length: 5 }, (_, j) => decoded['reason' + n + '_' + j] ?? '').join('').trim(), result.profile.recommendations[n].reason);
    assert.ok(result.tags.length < 100);
    assert.ok(result.tags.every((tag) => tag.length < 255 && !tag.includes('@')));
  }
});

test('selection permutations have identical tags and invalid or uncompiled content is rejected', () => {
  const answers = fixtures.red.answers;
  const reversed = { ...answers, flavour_preferences: [...answers.flavour_preferences].reverse() };
  assert.deepEqual(buildMessagingTags(answers, registry).tags, buildMessagingTags(reversed, registry).tags);
  assert.throws(() => buildMessagingTags({ ...answers, wine_interests: ['forged'] }, registry));
  assert.throws(() => buildMessagingTags(answers, {}), /not compiled/);
  const tags = buildMessagingTags(answers, registry).tags;
  assert.throws(() => decodeMessagingTags([...tags, tags[0]], registry), /Duplicate/);
});

test('real Liquid rendering reproduces complete contrasting and varied profiles', async () => {
  const examples = [...Object.values(fixtures).map((fixture) => fixture.answers), ...Array.from({ length: 60 }, varied)];
  for (const answers of examples) {
    const result = buildMessagingTags(answers, registry);
    const html = await engine.render(parsed, context(result.tags));
    assert.ok(html.includes(escapeHtml(result.profile.title)));
    assert.ok(html.includes(escapeHtml(result.profile.summary)));
    assert.ok(html.includes(escapeHtml(result.profile.exercise.text)));
    for (const style of result.profile.recommendations) {
      assert.ok(html.includes(escapeHtml(style.name)));
      assert.ok(html.includes(escapeHtml(style.reason)));
      assert.ok(html.includes(escapeHtml(style.sensory)));
    }
    for (const preference of result.profile.preferences) assert.ok(html.includes(escapeHtml(preference.value)));
    assert.ok(html.includes(escapeHtml(result.profile.journal.title)));
    assert.ok(html.includes(escapeHtml(result.profile.journal.detail)));
    assert.ok(html.includes('&lt;Alex &amp; Co&gt;'));
    assert.doesNotMatch(html, /Your personalised profile could not be loaded|Prototype preview|date_of_birth|birthday|1990-05-12/);
    assert.ok(html.includes('https://example.com/unsubscribe'));
  }
});

test('Liquid finds profile tags beyond the first 50 existing customer tags', async () => {
  const result = buildMessagingTags(fixtures.white.answers, registry);
  const tags = [...Array.from({ length: 190 }, (_, i) => 'unrelated-' + i), ...result.tags];
  assert.ok(tags.length <= 250);
  const html = await engine.render(parsed, context(tags));
  assert.ok(html.includes(escapeHtml(result.profile.summary)));
  assert.ok(html.includes(escapeHtml(result.profile.recommendations[2].reason)));
});

test('missing personalisation renders a clear fallback and release gate remains closed', async () => {
  const html = await engine.render(parsed, context([]));
  assert.match(html, /Your personalised profile could not be loaded/);
  assert.doesNotMatch(html, /Full-bodied Shiraz/);
  assert.ok(Buffer.byteLength(email) < 500000);
  assert.doesNotMatch(email, /customer\.metafields|<script|tracking_pixel/);
  const gate = JSON.parse(await read('shopify/wine-profile/messaging/release-gate.json'));
  assert.equal(gate.email_sending_enabled, false);
  assert.ok(Array.isArray(gate.received_proofs));
  if (gate.messaging_proof_passed) {
    assert.deepEqual(gate.received_proofs.map((proof) => proof.profile).sort(), ['red', 'white']);
    assert.match(gate.reason, /integration.*incomplete/);
  }
});

test('a partially missing report fails closed instead of displaying incomplete results', async () => {
  const result = buildMessagingTags(fixtures.red.answers, registry);
  const tags = result.tags.filter((tag) => !tag.includes(':summary0:'));
  const html = await engine.render(parsed, context(tags));
  assert.match(html, /Your personalised profile could not be loaded/);
  assert.doesNotMatch(html, /Full-bodied Shiraz/);
});

test('compiled email follows the tokens and parser restrictions verified in Messaging', () => {
  assert.match(email, /{{ open_tracking_block }}/);
  assert.doesNotMatch(email, /{{ open_tracking }}|\{%[-\s]*comment/);
});
