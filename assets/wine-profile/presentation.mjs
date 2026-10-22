const SITE = 'https://chateaufollent.com.au/';
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
const e = escapeHtml;

export function profileMarkup(profile) {
  return `<div class="wp-profile-content">
    <section class="wp-result-intro" aria-labelledby="profile-title"><p class="wp-eyebrow">Your Chateau Follent Wine Profile</p><h2 id="profile-title" tabindex="-1">${e(profile.title)}</h2><p>${e(profile.summary)}</p><p class="wp-note">A reflection of your stated preferences, with room to change.</p></section>
    <section class="wp-section" aria-labelledby="glance-title"><h3 id="glance-title">Preferences at a glance</h3><dl class="wp-preferences">${profile.preferences.map((p) => `<div><dt>${e(p.label)}</dt><dd>${e(p.value)}</dd></div>`).join('')}</dl></section>
    <section class="wp-section" aria-labelledby="styles-title"><p class="wp-eyebrow">Three paths to explore</p><h3 id="styles-title">${profile.learningOnly ? 'Wine styles to learn about' : 'Styles worth exploring'}</h3><p class="wp-note">Educational suggestions, not wines offered for sale by Chateau Follent. Styles vary by producer, region and vintage.</p><ol class="wp-recommendations">${profile.recommendations.map((s, i) => `<li><span class="wp-number" aria-hidden="true">0${i + 1}</span><div><h4>${e(s.name)}</h4><p>${e(s.reason)}</p><p class="wp-sensory"><strong>Look for</strong> ${e(s.sensory)}</p></div></li>`).join('')}</ol></section>
    <section class="wp-section wp-exercise" aria-labelledby="exercise-title"><p class="wp-eyebrow">A small discovery of your own</p><h3 id="exercise-title">${e(profile.exercise.title)}</h3><p>${e(profile.exercise.text)}</p></section>
    <section class="wp-section" aria-labelledby="journal-title"><p class="wp-eyebrow">From the winery</p><h3 id="journal-title">${e(profile.journal.title)}</h3><p>${e(profile.journal.detail)}</p><a href="${e(profile.journal.href)}" target="_blank" rel="noopener noreferrer">Explore the existing vintage archive <span class="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a><p class="wp-note">A topic inspired by your interests, rather than a newly published journal article.</p></section>
    <section class="wp-section"><h3>A place in the beginning</h3><p>Chateau Follent is a small Australian wine and mead project led by Lord James Follent. Each vintage is a chance to learn, refine and share the journey towards a vineyard and winery. Thank you for bringing your curiosity to its next chapter.</p></section>
  </div>`;
}

// Email-safe structure adapted from the site's email-template.html. No scripts or tracking pixels.
export function renderEmail(profile, firstName) {
  const section = (title, body) => `<tr><td style="padding:24px 24px 0"><h2 style="font-family:Georgia,serif;font-size:22px;line-height:1.35;color:#0A0A0C;margin:0 0 12px">${e(title)}</h2>${body}</td></tr>`;
  const p = (text) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65">${e(text)}</p>`;
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Chateau Follent Wine Profile — preview</title><style>body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table{border-collapse:collapse}a{color:#4A002E} @media(max-width:480px){td{overflow-wrap:anywhere}.email-title{font-size:27px!important}}</style></head><body style="margin:0;background:#F2F0EA;color:#34343a;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" style="width:100%;background:#F2F0EA"><tr><td align="center" style="padding:16px 8px"><table role="presentation" style="width:100%;max-width:600px;background:#FCFBF8">
    <tr><td style="padding:14px 24px;background:#4A002E;color:#F2F0EA;font-size:13px;text-align:center">Prototype preview only · No email has been sent</td></tr>
    <tr><td style="padding:32px 24px 24px;text-align:center;border-bottom:1px solid #D2CDC4"><p style="font-family:Georgia,serif;font-size:24px;letter-spacing:3px;line-height:1.25;color:#0A0A0C;margin:0">CHATEAU<br>FOLLENT</p><p style="font-size:12px;letter-spacing:2px;margin:16px 0 0;color:#4A002E">EVERY PALATE HAS A STORY</p></td></tr>
    <tr><td style="padding:28px 24px 0">${p(`Dear ${firstName},`)}<h1 class="email-title" style="font-family:Georgia,serif;font-size:32px;line-height:1.3;color:#0A0A0C;margin:0 0 20px">${e(profile.title)}</h1>${p(profile.summary)}</td></tr>
    ${section('Preferences at a glance', `<ul style="padding-left:20px;font-size:16px;line-height:1.65">${profile.preferences.map((pref) => `<li style="margin-bottom:8px"><strong>${e(pref.label)}:</strong> ${e(pref.value)}</li>`).join('')}</ul>`)}
    ${section(profile.learningOnly ? 'Three wine styles to learn about' : 'Three styles worth exploring', p('Educational suggestions, not wines offered for sale by Chateau Follent. Styles vary by producer, region and vintage.') + profile.recommendations.map((s, i) => `<h3 style="font-family:Georgia,serif;font-size:19px;color:#4A002E;margin:24px 0 10px">${i + 1}. ${e(s.name)}</h3>${p(s.reason)}<p style="margin:0 0 20px;font-size:16px;line-height:1.65"><strong>Look for:</strong> ${e(s.sensory)}</p>`).join(''))}
    ${section(profile.exercise.title, p(profile.exercise.text))}
    ${section('From the winery: ' + profile.journal.title, p(profile.journal.detail) + `<p style="font-size:16px;line-height:1.65"><a href="${e(new URL(profile.journal.href, SITE).href)}" target="_blank" rel="noopener noreferrer">Explore the existing vintage archive</a></p>` + p('This is a suggested topic, rather than a newly published article.'))}
    ${section('A place in the beginning', p('Chateau Follent is a small Australian wine and mead project led by Lord James Follent. We are learning, refining and sharing each vintage on the journey towards a vineyard and winery. Thank you for being curious about its beginnings.') + p('With warm regards, The Chateau Follent Team'))}
    <tr><td style="padding:24px;background:#0A0A0C;color:#F2F0EA;font-size:14px;line-height:1.7"><a href="${SITE}" target="_blank" rel="noopener noreferrer" style="color:#F2F0EA">Chateau Follent website</a> · <a href="${SITE}privacy-policy.html" target="_blank" rel="noopener noreferrer" style="color:#F2F0EA">Privacy Policy</a><p style="margin:12px 0 0">A reflection of your stated preferences, not a measurement of tasting ability. For adults aged 18 and over.</p></td></tr>
    </table></td></tr></table></body></html>`;
}
