import { QUESTIONS, STYLES, JOURNAL_TOPICS, DISCOVERY_SOURCES, QUIZ_VERSION, CONSENT_VERSION } from './data.mjs';

export function labelFor(questionId, value) {
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.id === value)?.label ?? '';
}

export function sydneyDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function screenAge(dob, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return { eligible: false, error: 'Enter your complete date of birth.' };
  const [year, month, day] = dob.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) return { eligible: false, error: 'Enter a real calendar date.' };
  const today = sydneyDate(now);
  if (dob > today) return { eligible: false, error: 'Your date of birth must be in the past.' };
  const [currentYear, currentMonth, currentDay] = today.split('-').map(Number);
  // Calendar comparison treats 29 February as reached on 1 March in a non-leap year.
  const age = currentYear - year - (currentMonth < month || (currentMonth === month && currentDay < day) ? 1 : 0);
  if (age < 18) return { eligible: false, error: 'This experience is for adults aged 18 and over. No details have been submitted.' };
  const band = age < 25 ? '18–24' : age < 35 ? '25–34' : age < 45 ? '35–44' : age < 55 ? '45–54' : age < 65 ? '55–64' : '65+';
  return { eligible: true, age, age_band: band };
}

export function updateSelection(question, current, value, checked = true) {
  if (!question.options.some((o) => o.id === value)) throw new Error('Unknown response.');
  if (question.kind === 'single') return { value, error: '' };
  const previous = Array.isArray(current) ? current : [];
  let next = !checked ? previous.filter((v) => v !== value) : value === question.exclusive ? [value] : [...new Set([...previous.filter((v) => v !== question.exclusive), value])];
  if (question.max && next.length > question.max) return { value: previous, error: `Choose up to ${question.max} descriptions. Unselect one before adding another.` };
  // Canonical option order makes outcomes independent of the order options were clicked.
  next = question.options.filter((o) => next.includes(o.id)).map((o) => o.id);
  return { value: next, error: '' };
}

export function validateAnswer(question, value) {
  if (question.kind === 'single') return question.options.some((o) => o.id === value) ? '' : 'Choose an answer to continue.';
  if (!Array.isArray(value) || !value.length) return 'Choose at least one answer to continue.';
  if (new Set(value).size !== value.length || value.some((v) => !question.options.some((o) => o.id === v))) return 'Choose from the available answers.';
  if (question.max && value.length > question.max) return `Choose up to ${question.max} descriptions.`;
  if (value.includes(question.exclusive) && value.length !== 1) return 'Choose this answer on its own.';
  return '';
}

export function validateAnswers(answers) {
  for (const question of QUESTIONS) {
    const error = validateAnswer(question, answers[question.id]);
    if (error) throw new Error(`${question.id}: ${error}`);
  }
}

const flavourWords = { crisp: 'freshness', delicate: 'delicate flavours', aromatic: 'expressive aromas', rich: 'richness', savoury: 'savoury flavours', smooth: 'sweet, smooth flavours' };
const join = (items) => items.length < 2 ? items[0] : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
const categoryWords = { red: 'red wine', white: 'white wine', rose: 'rosé', sparkling: 'sparkling wine', mead: 'mead', experimental: 'small-batch experiments' };

function recommend(answers) {
  const categories = answers.wine_interests.filter((v) => v !== 'exploring');
  const flavours = answers.flavour_preferences.filter((v) => v !== 'unsure');
  const introductory = !categories.length && !flavours.length && ['unsure', 'varied'].includes(answers.body_preference) && ['unsure', 'varied'].includes(answers.sweetness_preference);
  const candidates = STYLES.filter((s) => !categories.length || s.categories.some((c) => categories.includes(c)));
  const ranked = candidates.map((s, index) => ({
    style: s, index,
    score: (s.categories.some((c) => categories.includes(c)) ? 6 : 0)
      + s.flavours.filter((f) => flavours.includes(f)).length * 3
      + (s.body === answers.body_preference ? 2 : 0)
      + (s.sweetness === answers.sweetness_preference ? 3 : ['dry', 'off_dry', 'sweet'].includes(answers.sweetness_preference) ? -3 : 0)
      + (introductory && ['pinot_noir', 'riesling', 'brut'].includes(s.id) ? 2 : 0)
      + (s.unfamiliar ? answers.discovery_interest === 'adventurous' ? 1 : answers.discovery_interest === 'familiar' ? -2 : 0 : 0),
  }));
  const chosen = [];
  const covered = new Set();
  while (chosen.length < 3) {
    const score = (candidate) => candidate.score + (candidate.style.categories.some((c) => categories.includes(c) && !covered.has(c)) ? 4 : 0);
    ranked.sort((a, b) => score(b) - score(a) || a.index - b.index);
    const next = ranked.shift();
    if (!next) throw new Error('The style catalogue needs at least three matching styles.');
    next.style.categories.forEach((c) => covered.add(c));
    chosen.push(next.style);
  }
  return chosen.map((s) => describeStyle(s, answers));
}

export function describeStyle(s, answers) {
  const categories = answers.wine_interests.filter((v) => v !== 'exploring');
  const flavours = answers.flavour_preferences.filter((v) => v !== 'unsure');
  const category = s.categories.find((c) => categories.includes(c));
  const matches = s.flavours.filter((f) => flavours.includes(f));
  let reason = category ? `You included ${categoryWords[category]}; this is one expression to learn about.` : 'An introductory style to help you compare and discover what interests you.';
  if (matches.length) reason += ` It offers a starting point for your interest in ${flavourWords[matches[0]]}.`;
  if (s.sweetness === answers.sweetness_preference) reason += ` Look for a ${s.sweetness.replace('_', '-')} example to match your sweetness preference.`;
  else if (['dry', 'off_dry', 'sweet'].includes(answers.sweetness_preference)) reason += ` Its ${s.sweetness.replace('_', '-')} finish offers a contrast to the sweetness you selected.`;
  if (['light', 'medium', 'full'].includes(answers.body_preference) && s.body !== answers.body_preference) reason += ` This ${s.body}-bodied expression also offers a contrast to your ${answers.body_preference}-bodied preference.`;
  return { id: s.id, name: s.name, reason, sensory: s.sensory };
}

function titleFor(answers) {
  const flavours = answers.flavour_preferences;
  if (flavours.includes('unsure') && ['unsure', 'varied'].includes(answers.body_preference)) return 'Discovering Your Wine Preferences';
  const first = flavours.includes('rich') || answers.body_preference === 'full' ? 'Bold' : flavours.includes('crisp') ? 'Fresh' : flavours.includes('delicate') || answers.body_preference === 'light' ? 'Elegant' : flavours.includes('aromatic') ? 'Aromatic' : flavours.includes('smooth') ? 'Soft' : 'Exploring';
  const second = flavours.includes('savoury') ? 'Savoury' : flavours.includes('aromatic') && first !== 'Aromatic' ? 'Aromatic' : flavours.includes('crisp') && first !== 'Fresh' ? 'Fresh' : null;
  const curiosity = { familiar: 'Familiar', occasional: 'Curious', adventurous: 'Adventurous', learning: 'Explorative' }[answers.discovery_interest];
  return `${first}${second ? `, ${second}` : ''} & ${curiosity}`;
}

function summaryFor(answers) {
  const categories = answers.wine_interests.filter((v) => v !== 'exploring');
  const category = categories.length > 2 ? 'a broad range of wine styles' : categories.length ? join(categories.map((c) => categoryWords[c])) : 'the possibility of finding new favourites';
  const flavours = answers.flavour_preferences.filter((v) => v !== 'unsure');
  const flavour = flavours.length ? join(flavours.map((f) => flavourWords[f])) : 'room to discover the flavours you enjoy';
  const body = { light: 'a lighter body', medium: 'a medium body', full: 'a fuller body', varied: 'different body styles', unsure: 'exploring wine body' }[answers.body_preference];
  const sweetness = { dry: 'a dry finish', off_dry: 'a little sweetness', sweet: 'a sweet finish', varied: 'varying sweetness', unsure: 'exploring sweetness' }[answers.sweetness_preference];
  const curiosity = {
    familiar: 'Familiar styles can be a comfortable starting point, with small comparisons helping you notice differences.',
    occasional: 'An occasional change of style can offer a gentle way to broaden your own reference points.',
    adventurous: 'Your curiosity about unfamiliar styles leaves space to explore different grapes and ways of making wine.',
    learning: 'There is no need to have settled preferences; noticing what interests you is a useful beginning.',
  }[answers.discovery_interest];
  const occasion = answers.wine_occasions.includes('non_drinker') ? 'You can explore these ideas through aromas, food and reading, without drinking or purchasing wine.' : answers.wine_occasions.includes('meals') ? 'At the table, familiar foods can give you a simple way to notice texture and freshness.' : answers.wine_occasions.includes('cellaring') ? 'For your interest in cellaring, remember that ageing potential depends on the individual bottle and storage.' : 'Your preferred occasions can guide which styles feel useful to explore at your own pace.';
  return `Your answers point towards ${category}, with an interest in ${flavour}. Your choices around ${body} and ${sweetness} help shape the suggestions below, rather than fixing you into a single wine personality. ${curiosity} ${occasion} This is a starting point based on what you shared, not a measurement of tasting ability. Your preferences can change as you learn.`;
}

function exerciseFor(answers) {
  if (answers.wine_occasions.includes('non_drinker')) return { title: 'Build an aroma vocabulary, without a glass', text: 'Place a piece of citrus peel, a few berries and a small cup of black tea on the table. Smell each separately and write down one word for each aroma. Compare your words with the suggested styles. No alcohol or wine purchase is needed.' };
  let text;
  let title;
  if (['sweet', 'off_dry'].includes(answers.sweetness_preference) || answers.flavour_preferences.includes('smooth')) {
    title = 'Separate fruitiness from sweetness';
    text = 'If you choose to taste, compare small samples of a clearly labelled dry and off-dry wine from the same grape. Smell first, then notice sweetness on the palate and mouth-watering acidity. A fruity aroma does not necessarily mean a wine is sweet.';
  } else if (['light', 'full'].includes(answers.body_preference)) {
    title = 'Notice the weight of a wine';
    text = 'If you choose to taste, compare small samples of a lighter and fuller-bodied wine. Notice how each feels in your mouth, rather than how strong its aroma seems. Write one texture word for each; neither needs to be better.';
  } else {
    title = 'Find three words of your own';
    text = 'If you choose to taste, focus on one small sample. Smell it before tasting, then note one aroma, one texture and one impression of freshness. Everyday words are enough. Compare your notes with the label afterwards, rather than searching for a correct answer.';
  }
  const occasions = answers.wine_occasions;
  text += occasions.includes('meals') ? ' Try a bite of your meal and notice whether the impression changes.' : occasions.includes('sharing') ? ' Compare notes with a friend; different impressions are welcome.' : occasions.includes('celebrations') ? ' Save the comparison for a celebration you already have planned.' : occasions.includes('gifts') ? ' Use your notes to explain a style when choosing a gift.' : occasions.includes('cellaring') ? ' Date your notes so you can compare them with a future tasting.' : ' Keep a short note for your next discovery.';
  return { title, text: `${text} Tasting is optional; you can smell, read or spit instead.` };
}

export function generateProfile(answers) {
  validateAnswers(answers);
  return {
    title: titleFor(answers), summary: summaryFor(answers),
    preferences: ['wine_interests', 'flavour_preferences', 'body_preference', 'sweetness_preference', 'discovery_interest'].map((id) => ({
      label: { wine_interests: 'Wine categories', flavour_preferences: 'Flavour characteristics', body_preference: 'Wine body', sweetness_preference: 'Sweetness', discovery_interest: 'New styles' }[id],
      value: Array.isArray(answers[id]) ? answers[id].map((v) => labelFor(id, v)).join(', ') : labelFor(id, answers[id]),
    })),
    recommendations: recommend(answers), exercise: exerciseFor(answers),
    journal: { ...JOURNAL_TOPICS[answers.education_interest] },
    learningOnly: answers.wine_occasions.includes('non_drinker'),
  };
}

export function validEmail(value) {
  if (typeof value !== 'string' || value.trim().length > 254) return false;
  const [local, domain, extra] = value.trim().split('@');
  if (extra !== undefined || !local || !domain || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  const labels = domain.split('.');
  return labels.length > 1 && labels.every((part) => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(part));
}

export function captureAttribution(url, referrer = '') {
  const utm = {};
  const params = new URL(url).searchParams;
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  }
  let source = null;
  try {
    const parsed = new URL(referrer);
    if (['http:', 'https:'].includes(parsed.protocol)) source = `${parsed.origin}${parsed.pathname}`;
  } catch { /* An absent or blocked referrer is expected. */ }
  return { utm, referrer: source };
}

export function createLead({ identity, contact, answers, attribution }, now = new Date()) {
  const name = identity.first_name.trim();
  if (!name || name.length > 80) throw new Error('Enter a first name of up to 80 characters.');
  const age = screenAge(identity.date_of_birth, now);
  if (!age.eligible) throw new Error(age.error);
  if (!validEmail(contact.email)) throw new Error('Enter a valid email address, such as name@example.com.');
  if (contact.discovery_source && !DISCOVERY_SOURCES.some((o) => o.id === contact.discovery_source)) throw new Error('Choose an available discovery source.');
  if (typeof contact.marketing_consent !== 'boolean' || typeof contact.birthday_messages_opt_in !== 'boolean') throw new Error('Consent choices must be true or false.');
  const profile = generateProfile(answers);
  const timestamp = now.toISOString();
  return {
    first_name: name, email: contact.email.trim(), date_of_birth: identity.date_of_birth,
    age_band: age.age_band, age_screening_method: 'self_declared_date_of_birth',
    ...Object.fromEntries(QUESTIONS.map((q) => [q.id, Array.isArray(answers[q.id]) ? [...answers[q.id]] : answers[q.id]])),
    discovery_source: contact.discovery_source || null,
    wine_profile_title: profile.title, recommended_styles: profile.recommendations.map((s) => ({ ...s })),
    marketing_consent: contact.marketing_consent, birthday_messages_opt_in: contact.birthday_messages_opt_in,
    consent_timestamp: timestamp, consent_copy_version: CONSENT_VERSION,
    quiz_version: QUIZ_VERSION, created_at: timestamp,
    attribution: structuredClone(attribution ?? { utm: {}, referrer: null }),
  };
}
