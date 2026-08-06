import { describe, expect, it } from 'vitest';

import { candidateCatalog } from './data';
import { catalogSchema, findMarketVariant, getPublishedCatalog, validateCatalog } from './catalog';
import { publishedCatalog } from './published';

describe('catalog validation and publication', () => {
  it('accepts a valid candidate with a Product Family, source metadata, translations, and review metadata', () => {
    expect(() => validateCatalog(candidateCatalog)).not.toThrow();
    expect(candidateCatalog.dataVersion).toBe('2025.02.05');
    expect(publishedCatalog).toHaveLength(4);
    expect(publishedCatalog[0]).toMatchObject({
      productFamilyId: 'knauf-goldband-e',
      sourceDocument: { version: '01/2025' },
      catalogReview: { status: 'complete', lastReviewed: '2025-02-03' }
    });
  });

  it('has a candidate for every supplied Source Document and publishes the reviewed Belgian catalog', () => {
    const suppliedSourceDocuments = [
      'Goldband-TECH-PROD-NL.pdf',
      'MiXem Basic_TECH-PROD_P252_NL.pdf',
      'MiXem Light_TECH-PROD_P257_NL.pdf',
      'MiXem-SUB_TECH-PROD_P291_NL.pdf'
    ];
    const candidateSourceDocuments = new Set(
      candidateCatalog.variants.map((variant) => variant.sourceDocument.fileName)
    );

    expect(suppliedSourceDocuments.every((fileName) => candidateSourceDocuments.has(fileName))).toBe(
      true
    );
    expect(
      publishedCatalog
        .filter((variant) => variant.market === 'BE')
        .map((variant) => variant.name)
    ).toEqual(['Knauf Goldband E', 'Knauf MiXem Light', 'Knauf MiXem Basic']);
  });

  it('keeps the unresolved MiXem Sub Catalog Review visible while excluding it from publication', () => {
    const sub = candidateCatalog.variants.find((variant) => variant.id === 'knauf-mixem-sub-be');

    expect(sub).toMatchObject({
      sourceDocument: { fileName: 'MiXem-SUB_TECH-PROD_P291_NL.pdf' },
      catalogReview: { status: 'pending' }
    });
    expect(sub?.catalogReview.notes).toContainEqual(expect.stringContaining('MiXem Basic'));
    expect(publishedCatalog.some((variant) => variant.id === 'knauf-mixem-sub-be')).toBe(false);
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

  it('rejects duplicate Market Variant identifiers', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[1].id = malformed.variants[0].id;

    expect(() => validateCatalog(malformed)).toThrow(/Duplicate Market Variant identifier/);
  });

  it('rejects invalid Supported Thickness Range values', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].supportedThicknessRange = { minMm: 26, maxMm: 25 };

    expect(() => validateCatalog(malformed)).toThrow(/minimum thickness cannot exceed/);
  });

  it('rejects missing required translations', () => {
    const malformed = structuredClone(candidateCatalog);
    Reflect.deleteProperty(malformed.variants[0].translations, 'en');

    expect(() => validateCatalog(malformed)).toThrow();
  });

  it('rejects inconsistent packaging and Mixing Ratio references', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].packaging.powderKg = 20;

    expect(() => validateCatalog(malformed)).toThrow(/must match the package amount/);
  });

  it('rejects a Reference Thickness outside the Supported Thickness Range', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].referenceConsumption!.referenceThicknessMm = 30;

    expect(() => validateCatalog(malformed)).toThrow(/Reference Thickness must fall within/);
  });

  it('rejects impossible Source Document and Catalog Review dates', () => {
    const malformed = structuredClone(candidateCatalog);
    malformed.variants[0].sourceDocument.publicationDate = '2025-13';
    malformed.variants[0].catalogReview.lastReviewed = '2025-02-31';

    expect(() => validateCatalog(malformed)).toThrow();
  });

  it('rejects a completed Catalog Review without a last-reviewed date', () => {
    const malformed = structuredClone(candidateCatalog);
    Reflect.deleteProperty(malformed.variants[0].catalogReview, 'lastReviewed');

    expect(() => validateCatalog(malformed)).toThrow(/requires a last-reviewed date/);
  });

  it('rejects incomplete Catalog Review from publication', () => {
    const pending = structuredClone(candidateCatalog);
    pending.variants[0].catalogReview = { status: 'pending' };

    const published = getPublishedCatalog(pending);

    expect(published).toHaveLength(3);
    expect(published.some((variant) => variant.id === pending.variants[0].id)).toBe(false);
    expect(catalogSchema.safeParse(pending).success).toBe(true);
  });

  it('accepts a reviewed Market Variant without Reference Consumption for powder mode', () => {
    const withoutAreaData = structuredClone(candidateCatalog);
    Reflect.deleteProperty(withoutAreaData.variants[0], 'referenceConsumption');

    const published = getPublishedCatalog(withoutAreaData);

    expect(published).toHaveLength(4);
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
