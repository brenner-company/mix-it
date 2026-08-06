import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPublishedCatalog, validateCatalog } from '../src/lib/catalog/catalog.ts';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidatePath = resolve(repositoryRoot, 'src/lib/catalog/data.json');
const publishedPath = resolve(repositoryRoot, 'src/lib/catalog/published-data.json');
const candidateCatalog = validateCatalog(JSON.parse(readFileSync(candidatePath, 'utf8')));

const publishedCatalog = {
  dataVersion: candidateCatalog.dataVersion,
  variants: getPublishedCatalog(candidateCatalog)
};

writeFileSync(publishedPath, `${JSON.stringify(publishedCatalog, null, 2)}\n`);
