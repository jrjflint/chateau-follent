import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { QUESTIONS, STYLES, QUIZ_VERSION } from '../assets/wine-profile/data.mjs';
import { generateProfile, describeStyle } from '../assets/wine-profile/core.mjs';
import { escapeHtml } from '../assets/wine-profile/presentation.mjs';
import { fragmentId, messagingParts, sentences, buildMessagingTags, TAG_PREFIX } from '../assets/wine-profile/messaging-tags.mjs';

const out = new URL('../shopify/wine-profile/messaging/', import.meta.url);
await mkdir(out, { recursive: true });
const registry = {};
const add = (text) => {
  if (!text) return;
  const id = fragmentId(text);
  if (registry[id] && registry[id] !== text) throw new Error('Content ID collision.');
  registry[id] = text;
};
const base = { wine_interests: ['red'], flavour_preferences: ['rich', 'savoury'], body_preference: 'full', sweetness_preference: 'dry', wine_occasions: ['meals'], discovery_interest: 'adventurous', education_interest: 'journey' };
const choices = (q) => {
  if (q.kind === 'single') return q.options.map((option) => option.id);
  const regular = q.options.filter((option) => option.id !== q.exclusive).map((option) => option.id);
  return [[q.exclusive], ...Array.from({ length: 2 ** regular.length - 1 }, (_, i) => regular.filter((_, n) => (i + 1) & (1 << n))).filter((items) => !q.max || items.length <= q.max)];
};
const domains = Object.fromEntries(QUESTIONS.map((q) => [q.id, choices(q)]));
const collect = (change) => Object.values(messagingParts(generateProfile({ ...base, ...change }))).forEach(add);
collect({});
for (const q of QUESTIONS) for (const value of domains[q.id]) collect({ [q.id]: value });
for (const wine_interests of domains.wine_interests) for (const flavour_preferences of domains.flavour_preferences) collect({ wine_interests, flavour_preferences });
for (const flavour_preferences of domains.flavour_preferences) for (const body_preference of domains.body_preference) for (const discovery_interest of domains.discovery_interest) collect({ flavour_preferences, body_preference, discovery_interest });
for (const body_preference of domains.body_preference) for (const sweetness_preference of domains.sweetness_preference) collect({ body_preference, sweetness_preference });
for (const flavour_preferences of [['smooth'], ['rich']]) for (const body_preference of domains.body_preference) for (const sweetness_preference of domains.sweetness_preference) for (const wine_occasions of domains.wine_occasions) collect({ flavour_preferences, body_preference, sweetness_preference, wine_occasions });
for (const style of STYLES) {
  add(style.name); add(style.sensory);
  for (const wine_interests of [['exploring'], ...style.categories.map((id) => [id])]) for (const flavour_preferences of domains.flavour_preferences) for (const body_preference of domains.body_preference) for (const sweetness_preference of domains.sweetness_preference) {
    sentences(describeStyle(style, { ...base, wine_interests, flavour_preferences, body_preference, sweetness_preference }).reason).forEach(add);
  }
}
const slots = Object.keys(messagingParts(generateProfile(base)));
const literal = (value) => JSON.stringify(escapeHtml(value));
// Messaging's current editor rejects leading Liquid comments; keep metadata in this generator.
const setup = `${slots.map((slot) => `{%- assign wp_${slot} = '' -%}`).join('\n')}
{%- assign wp_expected = 0 -%}
{%- assign wp_resolved = 0 -%}
{%- for wp_page in (0..4) -%}
{%- assign wp_offset = wp_page | times: 50 -%}
{%- for wp_tag in customer.tags limit: 50 offset: wp_offset -%}
{%- assign wp_fields = wp_tag | split: ':' -%}
{%- if wp_fields[0] == '${TAG_PREFIX}' -%}
{%- if wp_fields[1] == 'count' -%}{%- assign wp_expected = wp_fields[2] | plus: 0 -%}{%- endif -%}
{%- assign wp_text = '' -%}
{%- case wp_fields[2] -%}
${Object.entries(registry).map(([id, value]) => `{%- when '${id}' -%}{%- assign wp_text = ${literal(value)} -%}`).join('\n')}
{%- endcase -%}
{%- case wp_fields[1] -%}
${slots.map((slot) => `{%- when '${slot}' -%}{%- assign wp_${slot} = wp_text -%}{%- if wp_text != blank -%}{%- assign wp_resolved = wp_resolved | plus: 1 -%}{%- endif -%}`).join('\n')}
{%- endcase -%}
{%- endif -%}
{%- endfor -%}
{%- endfor -%}`;
const value = (slot) => `{{ wp_${slot} }}`;
const series = (prefix, count) => Array.from({ length: count }, (_, i) => value(prefix + i)).join('');
const p = (content) => `<p style="font-size:16px;line-height:1.7;margin:0 0 18px">${content}</p>`;
const h2 = (content) => `<h2 style="font:400 24px/1.4 Georgia,serif;color:#4a002e;margin:28px 0 14px">${content}</h2>`;
const labels = ['Wine categories', 'Flavour characteristics', 'Wine body', 'Sweetness', 'New styles'];
const content = `${p('Dear {{ customer.first_name | default: "wine explorer" | escape }},')}<h1 style="font:400 32px/1.3 Georgia,serif">${value('title')}</h1>${p(series('summary', 8))}${h2('Preferences at a glance')}${labels.map((label, i) => p(`<strong>${label}:</strong> ${value('preference' + i)}`)).join('')}${h2(value('styleHeading'))}${p('Educational suggestions, not wines offered for sale by Chateau Follent. Styles vary by producer, region and vintage.')}${Array.from({ length: 3 }, (_, i) => `<h3 style="font:400 21px/1.4 Georgia,serif;color:#4a002e">${i + 1}. ${value('style' + i)}</h3>${p(series('reason' + i + '_', 5))}${p('<strong>Look for:</strong> ' + value('sensory' + i))}`).join('')}${h2(value('exerciseTitle'))}${p(series('exercise', 8))}${h2('From the winery: ' + value('journalTitle'))}${p(value('journalDetail'))}${p('<a style="color:#4a002e" href="{{ shop.url }}">Explore Chateau Follent</a>')}${p('This is a suggested topic, rather than a newly published journal article.')}${h2('A place in the beginning')}${p('Chateau Follent is a small Australian wine and mead project led by Lord James Follent. We are learning, refining and sharing each vintage on the journey towards a vineyard and winery. Thank you for bringing your curiosity to its next chapter.')}${p('With warm regards,<br>The Chateau Follent Team')}`;
let email = `${setup}
<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Chateau Follent Wine Profile</title></head><body style="margin:0;background:#f2f0ea;font-family:Arial,Helvetica,sans-serif;color:#34343a"><table role="presentation" width="100%" style="background:#f2f0ea"><tr><td align="center" style="padding:16px 8px"><table role="presentation" width="100%" style="max-width:600px;background:#fcfbf8;border-collapse:collapse"><tr><td style="padding:32px 24px;text-align:center;border-bottom:1px solid #d2cdc4"><p style="font:400 26px/1.2 Georgia,serif;letter-spacing:3px;margin:0">CHATEAU<br>FOLLENT</p></td></tr><tr><td style="padding:24px">{% if wp_title != blank and wp_style0 != blank and wp_style1 != blank and wp_style2 != blank %}${content}{% else %}${h2('Your Wine Profile')}${p('Your personalised profile could not be loaded for this message. Please return to the quiz to view your results.')}<a href="{{ shop.url }}/pages/wine-profile">Open the Wine Profile</a>{% endif %}</td></tr><tr><td style="padding:24px;background:#0a0a0c;color:#f2f0ea;font-size:13px;line-height:1.7">For adults aged 18 and over. A reflection of your stated preferences, not a measurement of tasting ability.<br><a style="color:#f2f0ea" href="{{ shop.url }}">Chateau Follent</a> · <a style="color:#f2f0ea" href="{{ shop.url }}/policies/privacy-policy">Privacy Policy</a><br><a style="color:#f2f0ea" href="{{ unsubscribe_url }}">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`;
email = email.replace('{% if wp_title != blank', '{% if wp_resolved == wp_expected and wp_expected > 0 and wp_title != blank');
email = email.replace('</body>', '{{ open_tracking_block }}</body>');
if (Buffer.byteLength(email) > 500000) throw new Error('Messaging email exceeds the custom-coded template limit.');
await writeFile(new URL('wine-profile-email.liquid', out), email);
await writeFile(new URL('content-registry.json', out), JSON.stringify(registry, null, 2) + '\n');
const fixtures = {};
for (const [name, change] of Object.entries({ red: {}, white: { wine_interests: ['white'], flavour_preferences: ['crisp', 'delicate'], body_preference: 'light' }, mead: { wine_interests: ['mead'], flavour_preferences: ['smooth'], sweetness_preference: 'sweet' }, exploring: { wine_interests: ['exploring'], flavour_preferences: ['unsure'], body_preference: 'unsure', sweetness_preference: 'unsure' }, nonDrinker: { wine_occasions: ['non_drinker'] } })) {
  const answers = { ...base, ...change };
  fixtures[name] = { answers, ...buildMessagingTags(answers, registry) };
}
await writeFile(new URL('proof-fixtures.json', out), JSON.stringify(fixtures, null, 2) + '\n');
let evidence;
try { evidence = JSON.parse(await readFile(new URL('proof-evidence.json', out), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const currentHash = createHash('sha256').update(email).digest('hex');
const receivedProofs = evidence?.template_sha256 === currentHash && evidence.quiz_version === QUIZ_VERSION
  ? evidence.proofs.filter((proof) => proof.expected_content_fields === 20 && proof.missing_content_fields.length === 0 && !proof.fallback_present && !proof.dob_present)
  : [];
const proofPassed = ['red', 'white'].every((profile) => receivedProofs.some((proof) => proof.profile === profile));
await writeFile(new URL('release-gate.json', out), JSON.stringify({
  email_sending_enabled: false,
  messaging_proof_passed: proofPassed,
  received_proofs: receivedProofs.map(({ profile, received_at, mail_client }) => ({ profile, received_at, mail_client })),
  reason: proofPassed ? 'Received synthetic Messaging proofs passed. Authenticated integration, plan-compatible Flow routing and release tests remain incomplete.' : 'Contrasting received Shopify Messaging emails for the current template have not yet been verified.',
}, null, 2) + '\n');
console.log(`Built Messaging email: ${Buffer.byteLength(email)} bytes, ${Object.keys(registry).length} text fragments. Automatic sending is disabled.`);
