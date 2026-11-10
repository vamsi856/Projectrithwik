// Copies the Astro build (site/dist) to the repository root, which GitHub Pages serves.
// Only files that came from a previous build are replaced; the site/ source folder,
// README and .git are never touched.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const root = resolve('..');
const manifest = join(root, '.published.json');
const keep = new Set(['site', 'README.md', '.git', '.gitignore', '.published.json', '.github']);

if (existsSync(manifest)) for (const f of JSON.parse(readFileSync(manifest, 'utf8'))) if (!keep.has(f)) rmSync(join(root, f), { recursive: true, force: true });
const entries = readdirSync(dist).filter((f) => !keep.has(f));
for (const f of entries) cpSync(join(dist, f), join(root, f), { recursive: true });
writeFileSync(manifest, JSON.stringify(entries, null, 1) + '\n');
console.log(`published ${entries.length} entries to the repo root`);
