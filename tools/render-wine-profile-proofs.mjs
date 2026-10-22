import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readFile, writeFile } from 'node:fs/promises';

const { Liquid } = createRequire(join(tmpdir(), 'chateau-wine-profile-qa', 'package.json'))('liquidjs');
const directory = new URL('../shopify/wine-profile/messaging/', import.meta.url);
const engine = new Liquid({ strictVariables: true, strictFilters: true });
const template = engine.parse(await readFile(new URL('wine-profile-email.liquid', directory), 'utf8'));
const fixtures = JSON.parse(await readFile(new URL('proof-fixtures.json', directory), 'utf8'));
for (const [name, fixture] of Object.entries(fixtures)) {
  // Isolated Messaging test templates for Lord James Follent; never deploy as the customer template.
  if (fixture.tags.some((tag) => /[',\r\n]/.test(tag))) throw new Error('Unsafe synthetic tag literal.');
  const proofSource = `{%- assign wp_proof_tags = '${fixture.tags.join(',')}' | split: ',' -%}\n` +
    (await readFile(new URL('wine-profile-email.liquid', directory), 'utf8'))
      .replace('for wp_tag in customer.tags limit: 50 offset: wp_offset', 'for wp_tag in wp_proof_tags limit: 50 offset: wp_offset');
  await writeFile(new URL(`proof-${name}.liquid`, directory), proofSource);
  const html = await engine.render(template, {
    customer: { first_name: 'Alex', tags: fixture.tags },
    shop: { url: 'https://tvump1-7j.myshopify.com' },
    unsubscribe_url: 'https://example.com/unsubscribe-preview',
    open_tracking_block: '',
  });
  await writeFile(new URL(`proof-${name}.html`, directory), html);
}
console.log('Rendered five synthetic local proofs and isolated Messaging test templates. These are not sent or received email proofs.');
