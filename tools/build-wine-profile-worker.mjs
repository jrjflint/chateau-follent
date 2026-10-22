import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Temporary build tooling for Lord James Follent; no server credentials are read or embedded.
const { build } = createRequire(join(tmpdir(), 'chateau-wine-profile-build-qa', 'package.json'))('esbuild');
const directory = new URL('../shopify/wine-profile/integration/', import.meta.url);
const output = new URL('dist/', directory);
await mkdir(output, { recursive: true });
await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: [fileURLToPath(new URL('worker.mjs', directory))],
  outfile: fileURLToPath(new URL('worker.js', output)),
  bundle: true, format: 'esm', platform: 'neutral', target: 'es2022',
  external: ['cloudflare:workers', 'node:*'], sourcemap: false, legalComments: 'none',
});
const source = await readFile(new URL('worker.js', output));
const metadata = {
  sha256: createHash('sha256').update(source).digest('hex'), bytes: source.byteLength,
  email_requests_enabled: false, delivery_adapter_configured: false,
  state: 'closed bootstrap; not deployed',
};
await writeFile(new URL('bundle-info.json', output), JSON.stringify(metadata, null, 2) + '\n');
console.log(`Bundled closed Worker: ${metadata.bytes} bytes. No credentials embedded; no email adapter enabled.`);
