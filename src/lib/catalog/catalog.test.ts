import { describe, expect, it } from 'vitest';

import { candidateCatalog } from './data';
import { catalogSchema, getPublishedCatalog, validateCatalog } from './catalog';
import { publishedCatalog } from './published';

describe('catalog validation and publication', () => {
  it('accepts a valid candidate with a Product Family, source metadata, translations, and review metadata', () => {
    expect(() => validateCatalog(candidateCatalog)).not.toThrow();
    expect(publishedCatalog).toHaveLength(1);
    expect(publishedCatalog[0]).toMatchObject({
      productFamilyId: 'knauf-goldband-e',
      sourceDocument: { version: '01/2025' },
      catalogReview: { status: 'complete', lastReviewed: '2025-02-03' }
    });
  });

  it('rejects malformed candidate data before publication', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].mixingRatio.liquidLitres = 0;

    expect(() => validateCatalog(malformed)).toThrow();
  });

  it('rejects impossible Source Document and Catalog Review dates', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].sourceDocument.publicationDate = '2025-13';
    malformed.variants[0].catalogReview.lastReviewed = '2025-02-31';

    expect(() => validateCatalog(malformed)).toThrow();
  });

  it('excludes an otherwise valid Market Variant when Catalog Review is pending', () => {
    const pending = structuredClone(candidateCatalog);
    pending.variants[0].catalogReview = { status: 'pending' };

    const published = getPublishedCatalog(pending);

    expect(published).toHaveLength(0);
    expect(catalogSchema.safeParse(pending).success).toBe(true);
  });
});
