import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidatePath = resolve(repositoryRoot, 'src/lib/catalog/data.json');
const publishedPath = resolve(repositoryRoot, 'src/lib/catalog/published-data.json');
const candidateCatalog = JSON.parse(readFileSync(candidatePath, 'utf8'));

const publishedCatalog = {
  dataVersion: candidateCatalog.dataVersion,
  variants: candidateCatalog.variants.filter(
    (variant) => variant.catalogReview.status === 'complete' && variant.catalogReview.lastReviewed
  )
};

writeFileSync(publishedPath, `${JSON.stringify(publishedCatalog, null, 2)}\n`);
