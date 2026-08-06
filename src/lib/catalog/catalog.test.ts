import { describe, expect, it } from 'vitest';

import { candidateCatalog } from './data';
import { catalogSchema, findMarketVariant, getPublishedCatalog, validateCatalog } from './catalog';
import { publishedCatalog } from './published';

describe('catalog validation and publication', () => {
  it('accepts a valid candidate with a Product Family, source metadata, translations, and review metadata', () => {
    expect(() => validateCatalog(candidateCatalog)).not.toThrow();
    expect(candidateCatalog.dataVersion).toBe('2025.02.04');
    expect(publishedCatalog).toHaveLength(3);
    expect(publishedCatalog[0]).toMatchObject({
      productFamilyId: 'knauf-goldband-e',
      sourceDocument: { version: '01/2025' },
      catalogReview: { status: 'complete', lastReviewed: '2025-02-03' }
    });
  });

  it('keeps Market Variant identity and facts independent across Markets', () => {
    const familyVariants = publishedCatalog.filter(
      (variant) => variant.productFamilyId === 'knauf-goldband-e'
    );

    expect(familyVariants.map((variant) => variant.market)).toEqual(['BE', 'UK']);
    expect(familyVariants.map((variant) => variant.name)).toEqual([
      'Knauf Goldband E',
      'Knauf Multi Finish'
    ]);
    expect(familyVariants.map((variant) => variant.productCode)).toEqual(['P131', 'P127']);
    expect(familyVariants[0].mixingRatio).not.toEqual(familyVariants[1].mixingRatio);
    expect(familyVariants[0].sourceDocument).not.toEqual(familyVariants[1].sourceDocument);
    expect(findMarketVariant(publishedCatalog, 'knauf-goldband-e', 'UK')?.id).toBe(
      'knauf-goldband-e-uk'
    );
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

    expect(published).toHaveLength(2);
    expect(published.some((variant) => variant.id === pending.variants[0].id)).toBe(false);
    expect(catalogSchema.safeParse(pending).success).toBe(true);
  });

  it('accepts a reviewed Market Variant without Reference Consumption for powder mode', () => {
    const withoutAreaData = structuredClone(candidateCatalog);
    Reflect.deleteProperty(withoutAreaData.variants[0], 'referenceConsumption');

    const published = getPublishedCatalog(withoutAreaData);

    expect(published).toHaveLength(3);
    expect(published.find((variant) => variant.id === candidateCatalog.variants[0].id)?.referenceConsumption).toBeUndefined();

    const withoutReferenceThickness = structuredClone(candidateCatalog);
    if (withoutReferenceThickness.variants[0].referenceConsumption) {
      Reflect.deleteProperty(
        withoutReferenceThickness.variants[0].referenceConsumption,
        'referenceThicknessMm'
      );
    }

    expect(catalogSchema.safeParse(withoutReferenceThickness).success).toBe(true);
  });
});
