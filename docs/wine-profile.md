# Chateau Follent Wine Profile

A static, adult-only discovery prototype for Lord James Follent. Open `/wine-profile.html` using the existing local server. It deliberately has no navigation or sitemap entry and carries `noindex, nofollow` metadata. It does not load GTM or the existing Fillout form.

The original prototype remains unchanged. The separate Shopify implementation is documented in [the two-stage delivery plan](wine-profile-shopify-plan.md) and [installation and verification guide](../shopify/wine-profile/README.md). Its Stage 1 controller displays results without the prototype's email step; Messaging assets are local proof material until received emails pass the Stage 2 gate.

## Run and check

Use the repository's existing preview workflow, or start a loopback-only server:

```powershell
python -m http.server 3087 --bind 127.0.0.1
```

Open `http://127.0.0.1:3087/wine-profile.html`. Run the dependency-free tests with Node 24:

```powershell
node --test --test-isolation=none tests/wine-profile.test.mjs
```

The isolation flag avoids a child-process restriction in the Codex sandbox. No package installation or build is required. Serve over HTTP rather than opening the HTML with `file://`, so browser ES modules load normally.

## Modules and result rules

All feature styles and modules live in `assets/wine-profile/`:

- `data.mjs`: exact question copy, stable response IDs, discovery sources, consent text, the versioned style catalogue and suggested journal topics.
- `core.mjs`: Sydney-calendar age screening, selection validation, profile generation, attribution and lead construction. It has no DOM or transport dependency.
- `presentation.mjs`: escaped result markup and a standalone responsive HTML email adapted from the site's email template. The iframe allows links to open independently, but does not allow scripts or same-origin access.
- `submission.mjs`: asynchronous transport boundary, defaulting to a non-networked mock.
- `app.mjs`: in-memory wizard, validation, navigation, preview and print controls.
- `wine-profile.css`: page-scoped styles using the existing brand tokens and fonts, including reduced-motion and print layouts.

Screening validates Gregorian dates before calculating whole years against the date in `Australia/Sydney`. A leap-day birthday is reached on 1 March in a non-leap year. The bands are `18–24`, `25–34`, `35–44`, `45–54`, `55–64` and `65+`. This is self-declared screening, not independent identity or age verification.

Recommendations are deterministic. First restrict the catalogue to selected categories; “still exploring” leaves all categories available. Score each candidate with:

| Signal | Score |
| --- | --- |
| Selected category | +6 |
| Each matching flavour | +3 |
| Matching body | +2 |
| Matching stated sweetness | +3 |
| Different sweetness when a specific level was chosen | −3 |
| Unfamiliar style, adventurous visitor | +1 |
| Unfamiliar style, visitor prefers familiar styles | −2 |
| Previously unrepresented selected category | +4 during selection |

Choose three different styles, resolving ties by catalogue order. Completely open taste preferences give dry Riesling, light Pinot Noir and brut sparkling a +2 introductory bonus. Explanations refer to actual matches rather than implying a scientific assessment. Flavours are not treated as proof of sweetness; honey aromas do not necessarily mean sweet mead. A requested category always has at least three catalogue entries, so a mead-only result stays within mead.

The headline reflects flavour/body choices and discovery interest. The 80–120-word summary incorporates categories, flavour, body, sweetness, discovery and occasions. Occasions also shape the practical exercise; the learning interest selects a suggested journal topic. Non-drinkers receive an aroma/food exercise requiring no alcohol. Suggested topics link to the existing vintage archive and are explicitly not presented as published articles.

Style descriptions are illustrative and qualified for producer, regional and vintage variation. Educational references include Wine Australia's [Australian Wine Discovered variety modules](https://www.australianwine.com/australian-wine-discovered/varieties) and [Foundations guide](https://www.wineaustralia.com/getmedia/dd749185-c0a1-4211-aab0-8ef7a2c23f9d/AWD_Foundations_FacilitatorGuide.pdf?ext=.pdf). These sources inform general wine education; the questionnaire does not measure tasting ability or establish medical, legal or regulatory suitability.

## Lead schema

`createLead({ identity, contact, answers, attribution }, now)` returns a plain JavaScript object. It revalidates eligibility, required answers, email format, discovery-source IDs and boolean preferences. It does not submit, persist or log the object. The controller creates it only after valid mock submission.

Example shape using synthetic data:

```js
{
  first_name: 'Alex',
  email: 'alex@example.com',
  date_of_birth: '1990-05-12', // ISO calendar date, never shown in results/email
  age_band: '35–44',
  age_screening_method: 'self_declared_date_of_birth',
  wine_interests: ['red'],
  flavour_preferences: ['rich', 'savoury'],
  body_preference: 'full',
  sweetness_preference: 'dry',
  wine_occasions: ['meals'],
  discovery_interest: 'adventurous',
  education_interest: 'journey',
  discovery_source: null, // optional stable ID from DISCOVERY_SOURCES
  wine_profile_title: 'Bold, Savoury & Adventurous',
  recommended_styles: [
    {
      id: 'shiraz', name: 'Full-bodied Shiraz',
      reason: 'You included red wine; this is one expression to learn about. It offers a starting point for your interest in richness. Look for a dry example to match your sweetness preference.',
      sensory: 'Dark plum fruit with a hint of black pepper.'
    },
    {
      id: 'cabernet', name: 'Cabernet Sauvignon',
      reason: 'You included red wine; this is one expression to learn about. It offers a starting point for your interest in richness. Look for a dry example to match your sweetness preference.',
      sensory: 'Blackcurrant aromas and a firm, drying texture.'
    },
    {
      id: 'malbec', name: 'Full-bodied Malbec',
      reason: 'You included red wine; this is one expression to learn about. It offers a starting point for your interest in richness. Look for a dry example to match your sweetness preference.',
      sensory: 'Dark-berry aromas with a generous, rounded texture.'
    }
  ],
  marketing_consent: false,
  birthday_messages_opt_in: false,
  consent_timestamp: '2026-10-20T01:00:00.000Z',
  consent_copy_version: '2026-10-20',
  quiz_version: '1.0.0',
  created_at: '2026-10-20T01:00:00.000Z',
  attribution: {
    utm: { utm_source: 'instagram', utm_campaign: 'wine_profile' },
    referrer: 'https://example.com/article'
  }
}
```

Array responses use the IDs in `QUESTIONS`; single-choice responses are string IDs. `discovery_source` is `null` when skipped. Email and first name are trimmed; email case is preserved. Timestamps are UTC ISO strings. `consent_timestamp` records when the visitor's independent choices were recorded; `false` is not consent. Both checkboxes begin unchecked, and choosing birthday messages does not select marketing.

Attribution is separate from the self-reported source. Only `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` and `utm_content` are captured, each limited to 200 characters. Referrer collection accepts HTTP(S) URLs and discards credentials, query and fragment; absent or blocked referrers are `null`. Attribution is not used for quiz tracking or personalisation.

## Mock submission and privacy

The form always identifies the prototype before asking for email and beside its submit control. A valid email opens the complete profile and a generated email preview; it is not delivered or added to a list.

The transport contract is:

```js
async function adapter(lead) {
  // Shipped adapter: no network request and no persistence.
  return { status: 'preview', email_sent: false, submitted: false };
}

// Only a future backend-confirmed delivery can return:
// { status: 'delivered', email_sent: true, delivery_id: 'provider-confirmation-id' }
```

`submitLead(lead, adapter)` rejects ambiguous success responses and propagates failures. The prototype controller accepts only preview responses and never displays a delivery-success message. Concurrent submissions are blocked, failures retain the form, and stale asynchronous responses cannot restore data after restart.

Responses, contact data, the lead and DOB exist only in private module/page memory. No browser storage, cookies, URL-based state, public debug exports or personal-data logging are added. Only the DOB entry fields show the full date; results, printable output and email omit it. The email preview has no tracking pixels or external font requests. The page reuses the site's existing Google Fonts CSS, which creates ordinary font-provider requests without quiz details.

Restart clears the form, lead and result. `pagehide` clears memory and removes rendered form values; returning through the back/forward cache starts again at the welcome screen. Reload also starts again. Leaving never submits answers. Printed/saved profiles are controlled by the visitor; the print stylesheet omits email address, consent choices, DOB and prototype controls.

## Connecting Shopify and delivery later

1. Add an authenticated-to-provider, server-side endpoint and replace the transport adapter. Keep all Shopify Admin API and email-provider credentials on the server. Validate calendar age, response IDs and consent independently; browser checks are only UX.
2. Map name/email to customer fields and stable quiz IDs, profile title, version and recommendations to namespaced customer metafields. Creating a customer record for a requested report must not silently enable email marketing or create a customer login/account invitation.
3. Deliver the requested report as a transactional message using the generated profile object and a provider-ready version of `renderEmail`. Remove prototype banners only when real delivery handling exists. Require provider confirmation before claiming delivery; queued/accepted jobs are pending, not sent. Add idempotency, retry handling and rate limiting to the backend.
4. Map `marketing_consent` to the platform's explicit email-marketing consent workflow independently of report delivery. Store the exact consent wording/version and evidence. Keep birthday permission independent; do not infer it from DOB collection or marketing permission. Any withdrawal and unsubscribe workflow must be handled by the production system.
5. Define lawful collection notices, access controls, retention and deletion before storing real data. Reassess whether full DOB needs retention after screening; age band plus optional birthday day/month may meet ongoing needs. Do not place full DOB in broadly accessible customer notes or analytics.
6. Review privacy, spam and responsible alcohol marketing requirements for the actual production design. This frontend prototype does not establish regulatory compliance. Add tracking only after a separate review; no quiz answers, name, DOB or email belong in GTM/dataLayer.

No future backend, customer account, payment, wine wallet, billing, store credit or paid membership feature is implemented here.

## Verification performed

- All 26 Node tests passed, including 600 varied questionnaires, real/invalid date boundaries, leap days, age bands, selection limits, independent consent, schema validation, attribution, escaping and rejected transport responses.
- Chrome walkthroughs covered required-field and underage errors, the seven questions, multi-select exclusivity, the flavour limit, Back preservation, invalid email, all four consent combinations, complete results and the actual personalised email preview.
- Changing a completed white-wine profile to mead regenerated the title, all recommendations, journal topic and email. Red, white and non-drinking browser flows were checked; the other substantially different profiles have Node coverage.
- The entire wizard was measured at 320 pixels. Results and the email frame were checked at 320, 375, 390, 768 and 1280 pixels without horizontal overflow. Space and arrow-key selection, heading focus, label associations and clear validation messages were checked. Print and reduced-motion styles are included; actual browser print-dialog, screen-reader and cross-email-client audits remain production QA tasks.
- Restart cleared entry fields; leaving and returning through browser history restored a fresh welcome screen. The homepage, waitlist, vintages and privacy pages loaded in smoke checks, and their source/navigation/shared CSS remain unchanged. Static checks confirm the quiz modules contain no storage APIs, tracking or network-submission code; the browser inspection surface did not expose storage internals directly.

These checks validate a frontend prototype, not independent age verification, real address ownership, deliverability or production compliance.
