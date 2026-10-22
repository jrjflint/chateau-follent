import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const withEmail = process.argv.includes('--with-email');
const sectionName = withEmail ? 'wine-profile-email' : 'wine-profile';
const elementName = withEmail ? 'cf-wine-profile-email' : 'cf-wine-profile';
const read = (path) => readFile(new URL(path, root), 'utf8');
const out = new URL('shopify/wine-profile/', root);
await mkdir(new URL('sections/', out), { recursive: true });
await mkdir(new URL('templates/', out), { recursive: true });
const strip = (code) => code.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
const data = await read('assets/wine-profile/data.mjs');
const core = await read('assets/wine-profile/core.mjs');
const presentation = (await read('assets/wine-profile/presentation.mjs')).split('// Email-safe structure')[0];
const app = await read('assets/wine-profile/storefront-app.mjs');
const commonJs = [data, core, presentation, app].map(strip).join('\n');
const emailModules = withEmail ? await Promise.all(['login-handoff', 'email-session', 'email-panel', 'storefront-email-app'].map((name) => read(`assets/wine-profile/${name}.mjs`))) : [];
const js = [commonJs, ...emailModules.map(strip)].join('\n');
let css = (await read('assets/wine-profile/wine-profile.css')).replaceAll('body.wine-profile-page', '.cf-wine-profile').replaceAll('.wine-profile-page', '.cf-wine-profile').replaceAll('.cf-wine-profile main', '.cf-wine-profile .wp-shell');
css = css.replaceAll('var(--color-background)', 'var(--color-background, #f2f0ea)').replaceAll('var(--color-border)', 'var(--wp-border)');
css += `
.cf-wine-profile { display:block; box-sizing:border-box; width:100%; --color-surface:var(--color-background,#fcfbf8); --color-text:var(--color-foreground,#0a0a0c); --color-muted:var(--color-foreground-muted,#5a6470); --wp-border:color-mix(in srgb,var(--color-foreground,#0a0a0c) 18%,transparent); --color-accent:var(--color-primary-button-background,#4a002e); --color-accent-soft:color-mix(in srgb,var(--color-primary-button-background,#4a002e) 8%,transparent); color:var(--color-text); font:400 16px/1.5 var(--font-body--family,Arial,Helvetica,sans-serif); }
.cf-wine-profile .wp-shell { width:min(100%,50rem); margin-inline:auto; background:var(--color-surface); }
.cf-wine-profile h1,.cf-wine-profile h2,.cf-wine-profile h3,.cf-wine-profile h4,.cf-wine-profile .wp-kicker { font-family:var(--font-heading--family,Georgia,serif); color:var(--color-text); font-weight:var(--font-heading--weight,400); }
.cf-wine-profile button { font-family:inherit; cursor:pointer; color:var(--color-text); }
.cf-wine-profile .wp-primary { border:1px solid var(--color-accent); background:var(--color-accent); color:var(--color-primary-button-text,#fcfbf8); text-decoration:none; }
.cf-wine-profile .wp-primary:hover { background:var(--color-primary-button-hover-background,#360022); color:var(--color-primary-button-hover-text,#fcfbf8); }
.cf-wine-profile a { color:var(--color-accent); text-decoration:underline; text-underline-offset:.2em; }
.cf-wine-profile .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media print { body:has(${elementName}[data-phase='result']) * { visibility:hidden; } body:has(${elementName}[data-phase='result']) ${elementName},body:has(${elementName}[data-phase='result']) ${elementName} * { visibility:visible; } body:has(${elementName}[data-phase='result']) ${elementName} { position:absolute; inset:0; width:100%; padding:0; } .cf-wine-profile:not([data-phase='result']) .wp-shell { display:none; } .cf-wine-profile .wp-note,.cf-wine-profile .wp-email-panel { display:none; } }
`;
css += '.cf-wine-profile [hidden]{display:none!important}.wp-email-panel{margin-top:2rem}.wp-email-panel button:disabled{opacity:.65;cursor:wait}.wp-email-panel input[type="checkbox"]{width:auto;margin-right:.5rem}.wp-email-panel label{display:block;margin-block:.7rem}';
const signupFields = `<label for="WineProfileEmail-{{ section.id }}">Your account email</label><input id="WineProfileEmail-{{ section.id }}" type="email" name="contact[email]" value="{{ customer.email | escape }}" readonly required><input type="hidden" name="contact[tags]" value="newsletter"><label><input type="checkbox" name="contact[accepts_marketing]" value="true" required data-wp-signup-consent>I would like to receive email marketing from Chateau Follent. I can unsubscribe at any time.</label><p class="wp-note">Signup is optional. If confirmation is required, confirm through your inbox before requesting your profile email.</p><button class="wp-primary" type="submit">Sign up for email marketing</button>`;
const nativeSignup = withEmail ? `{% if customer %}<div data-wp-native-signup hidden>{% assign wine_profile_signup_id = 'WineProfileSignup-' | append: section.id %}{% form 'customer', id: wine_profile_signup_id, return_to: request.path %}${signupFields}{% if form.errors %}<div role="alert">{{ form.errors | default_errors }}</div>{% endif %}{% if form.posted_successfully? %}<p>Signup submitted. Confirm through your inbox if required, then check your subscription.</p>{% endif %}{% endform %}</div>{% endif %}` : '';
const markup = `<${elementName} class="cf-wine-profile" data-privacy-url="{{ shop.privacy_policy.url | default: '/policies/privacy-policy' | escape }}" data-journal-url="{{ section.settings.journal_url | default: '/pages/vintages' | escape }}"${withEmail ? ' data-email-enabled="false" data-login-url="{{ routes.storefront_login_url | escape }}"' : ''}>
  <div class="wp-shell">
    <div class="wp-masthead"><p class="wp-eyebrow">A little curiosity. A personal discovery.</p><span class="wp-edition">The Wine Profile · No. 01</span></div>
    <h1 class="wp-page-title">Discover Your Wine Profile.</h1>
    <div data-wp-app><p>Preparing your Wine Profile…</p></div>
    <noscript><p>This quiz needs JavaScript. Your details have not been collected.</p></noscript>
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-wp-status></p>
  </div>
  ${nativeSignup}
</${elementName}>`;
const schemaName = withEmail ? 'Wine Profile email' : 't:names.wine_profile';
const liquid = `{% comment %}Wine Profile section for Lord James Follent: ${withEmail ? 'Stage 2 setup artifact; email controls disabled pending integration and release checks. Do not install as a working email service.' : 'seven questions and temporary on-page results; no customer writes or email transport.'} Self-contained custom element with abortable listeners. Generated from source modules with node tools/build-wine-profile-shopify.mjs${withEmail ? ' --with-email' : ''}.{% endcomment %}
{% stylesheet %}${css}{% endstylesheet %}
${markup}
<script>(() => {\n${js}\n})();</script>
{% schema %}
{"name":"${schemaName}","tag":"section","class":"wine-profile-section","limit":1,"enabled_on":{"templates":["page"]},"settings":[{"type":"url","id":"journal_url","label":"t:settings.wine_profile_journal_link"}],"presets":[{"name":"${schemaName}"}]}
{% endschema %}
`;
await writeFile(new URL(`sections/${sectionName}.liquid`, out), liquid);
await writeFile(new URL(`templates/page.${sectionName}.json`, out), JSON.stringify({ sections: { main: { type: sectionName, settings: {} } }, order: ['main'] }, null, 2) + '\n');
let previewMarkup = markup.replace(/{{ shop\.privacy_policy\.url[^}]+}}/, '/privacy-policy.html').replace(/{{ section\.settings\.journal_url[^}]+}}/, '/vintages.html');
let previewJs = js, qaControls = '';
if (withEmail) {
  previewMarkup = previewMarkup.replace(nativeSignup, `<div data-wp-native-signup hidden><form>${signupFields.replaceAll('{{ section.id }}', 'synthetic').replace('{{ customer.email | escape }}', 'synthetic@example.invalid')}</form></div>`).replace('data-email-enabled="false"', 'data-email-enabled="true"').replace('{{ routes.storefront_login_url | escape }}', '/account/login');
  qaControls = '<aside class="qa-only"><strong>Local Stage 2 simulation — no email or customer changes</strong><p>Only synthetic responses are used. Sign-in and signup simulate a return to this page.</p><label>Scenario <select data-qa-scenario><option value="signedout">Signed out</option><option value="subscribed">Subscribed</option><option value="unsubscribed">Not subscribed</option><option value="pending">Pending confirmation</option><option value="disabled">Sending disabled</option><option value="unknown">Uncertain request</option><option value="failed">Failed save</option><option value="delayed">Slow request</option></select></label><button type="button" data-qa-finish>Finish queued simulation</button><p data-qa-count>Profile requests: 0</p></aside>';
  previewJs = [commonJs, ...emailModules.slice(0, -1).map(strip), strip(emailModules.at(-1)).split('\nif (typeof customElements')[0], `
const scenario = document.querySelector('[data-qa-scenario]');
scenario.value = new URL(location.href).searchParams.get('scenario') || 'signedout';
let requests = 0;
const queued = [];
document.querySelector('[data-qa-finish]').addEventListener('click',()=>{for(const finish of queued.splice(0))finish();});
const sessionFor = (answers) => createEmailSession({ answers, adultConfirmed:true, fetcher:async(path,options={}) => {
  const state = scenario.value;
  if(path.endsWith('/context')) return Response.json({signedIn:state!=='signedout',emailRequestsAvailable:state!=='disabled',subscriptionState:state==='pending'?'PENDING':state==='unsubscribed'?'UNSUBSCRIBED':'SUBSCRIBED',csrfToken:'synthetic-only'});
  const id = options.body ? JSON.parse(options.body).submissionId : new URL(path,location.origin).searchParams.get('submission_id');
  if(options.method==='POST'){requests++;document.querySelector('[data-qa-count]').textContent='Profile requests: '+requests;}
  if(state==='unknown' && options.method==='POST') throw Error('synthetic timeout');
  if(state==='delayed' && options.method==='POST') await new Promise(resolve=>queued.push(resolve));
  return Response.json({submissionId:id,status:state==='unknown'?'review':state==='failed'?'failed':'email_requested'});
}});
customElements.define('cf-wine-profile-email',class extends HTMLElement{
 connectedCallback(){this.cleanup ??= mountEmailWineProfile(this,{sessionFor,navigate:()=>location.assign('?scenario=subscribed')});}
 disconnectedCallback(){this.cleanup?.();this.cleanup=null;}
});
document.addEventListener('submit',(event)=>{if(event.target.closest('[data-wp-native-signup]')&&!event.defaultPrevented){event.preventDefault();if(event.target.checkValidity())location.assign('?scenario=pending');}});
`].join('\n');
}
await writeFile(new URL(withEmail ? 'preview-email.html' : 'preview.html', out), `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shopify Wine Profile · Local verification</title><style>body{margin:0;background:#f2f0ea}header,footer{text-align:center;padding:1rem;font-family:Georgia,serif}.qa-only{padding:1rem;background:#fff5cd;font:16px/1.5 Arial,sans-serif}@media print{.qa-only{display:none}}${css}</style></head><body>${qaControls}<header>CHATEAU FOLLENT · Theme preview</header>${previewMarkup}<footer>Chateau Follent</footer><script>(()=>{${previewJs}})();</script></body></html>`);
console.log(`Built Shopify section, page template and local preview in ${fileURLToPath(out)}`);
