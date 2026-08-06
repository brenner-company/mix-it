import { z } from 'zod';

function isCalendarDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO calendar date')
  .refine(isCalendarDate, 'Expected a real ISO calendar date');
const publicationMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Expected a YYYY-MM publication date')
  .refine((value) => Number(value.slice(-2)) >= 1 && Number(value.slice(-2)) <= 12, {
    message: 'Expected a publication month from 01 to 12'
  });

export const languageSchema = z.enum(['nl', 'en']);
export type Language = z.infer<typeof languageSchema>;

export const marketSchema = z.enum(['BE', 'UK']);
export type Market = z.infer<typeof marketSchema>;
export const supportedMarkets = ['BE', 'UK'] as const satisfies readonly Market[];

const translationSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  mixingInstructions: z.string().trim().min(1),
  mixingTime: z.string().trim().min(1),
  workingTime: z.string().trim().min(1).optional(),
  dryingTime: z.string().trim().min(1).optional(),
  disclaimer: z.string().trim().min(1)
}).superRefine((translation, context) => {
  if (!translation.workingTime && !translation.dryingTime) {
    context.addIssue({
      code: 'custom',
      path: ['workingTime'],
      message: 'A translation requires a working-time or drying-time fact'
    });
  }
});

const mixingRatioSchema = z.object({
  powderKg: z.number().positive(),
  liquidLitres: z.number().positive()
});

const sourceDocumentSchema = z.object({
  id: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  title: z.string().trim().min(1),
  version: z.string().trim().min(1),
  publicationDate: publicationMonth
});

const catalogReviewSchema = z
  .object({
    status: z.enum(['pending', 'complete']),
    lastReviewed: isoDate.optional(),
    notes: z.array(z.string().trim().min(1)).optional()
  })
  .superRefine((review, context) => {
    if (review.status === 'complete' && !review.lastReviewed) {
      context.addIssue({
        code: 'custom',
        path: ['lastReviewed'],
        message: 'A completed Catalog Review requires a last-reviewed date'
      });
    }

    if (review.status === 'pending' && review.lastReviewed) {
      context.addIssue({
        code: 'custom',
        path: ['lastReviewed'],
        message: 'A pending Catalog Review cannot have a last-reviewed date'
      });
    }
  });

export const marketVariantSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    productFamilyId: z.string().regex(/^[a-z0-9-]+$/),
    manufacturer: z.string().trim().min(1),
    market: marketSchema,
    name: z.string().trim().min(1),
    productCode: z.string().trim().min(1),
    category: z.string().trim().min(1),
    aliases: z.array(z.string().trim().min(1)).min(1),
    packaging: z.object({
      powderKg: z.number().positive(),
      packageLabel: z.string().trim().min(1)
    }),
    mixingRatio: mixingRatioSchema,
    referenceConsumption: z
      .object({
        powderKgPerSquareMetre: z.number().positive(),
        referenceThicknessMm: z.number().positive().optional()
      })
      .optional(),
    supportedThicknessRange: z
      .object({
        minMm: z.number().positive(),
        maxMm: z.number().positive()
      })
      .refine((range) => range.minMm <= range.maxMm, {
        message: 'The minimum thickness cannot exceed the maximum thickness'
      }),
    translations: z.object({
      nl: translationSchema,
      en: translationSchema
    }),
    sourceDocument: sourceDocumentSchema,
    catalogReview: catalogReviewSchema,
    catalogDataVersion: z.string().trim().min(1)
  })
  .superRefine((variant, context) => {
    if (variant.mixingRatio.powderKg !== variant.packaging.powderKg) {
      context.addIssue({
        code: 'custom',
        path: ['mixingRatio', 'powderKg'],
        message: 'The Mixing Ratio powder amount must match the package amount'
      });
    }
  });

export type MarketVariant = z.infer<typeof marketVariantSchema>;

export function findMarketVariant(
  variants: readonly MarketVariant[],
  productFamilyId: MarketVariant['productFamilyId'],
  market: Market
): MarketVariant | undefined {
  return variants.find(
    (variant) => variant.productFamilyId === productFamilyId && variant.market === market
  );
}

export const catalogSchema = z
  .object({
    dataVersion: z.string().trim().min(1),
    variants: z.array(marketVariantSchema).min(1)
  })
  .superRefine((catalog, context) => {
    const ids = new Set<string>();
    const productFamilyMarketKeys = new Set<string>();
    const productCodesByMarket = new Set<string>();
    const sourceDocumentIds = new Set<string>();

    catalog.variants.forEach((variant, index) => {
      if (ids.has(variant.id)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'id'],
          message: `Duplicate Market Variant identifier: ${variant.id}`
        });
      }
      ids.add(variant.id);

      const productFamilyMarketKey = `${variant.productFamilyId}:${variant.market}`;
      if (productFamilyMarketKeys.has(productFamilyMarketKey)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'productFamilyId'],
          message: `A Product Family can have only one Market Variant for ${variant.market}`
        });
      }
      productFamilyMarketKeys.add(productFamilyMarketKey);

      const productCodeKey = `${variant.market}:${variant.productCode.toLowerCase()}`;
      if (productCodesByMarket.has(productCodeKey)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'productCode'],
          message: `Duplicate product code in ${variant.market}: ${variant.productCode}`
        });
      }
      productCodesByMarket.add(productCodeKey);

      if (sourceDocumentIds.has(variant.sourceDocument.id)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'sourceDocument', 'id'],
          message: `Duplicate Source Document identifier: ${variant.sourceDocument.id}`
        });
      }
      sourceDocumentIds.add(variant.sourceDocument.id);

      if (variant.catalogDataVersion !== catalog.dataVersion) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'catalogDataVersion'],
          message: 'Market Variant catalog data version must match the catalog data version'
        });
      }

      const referenceThickness = variant.referenceConsumption?.referenceThicknessMm;
      if (
        referenceThickness !== undefined &&
        (referenceThickness < variant.supportedThicknessRange.minMm ||
          referenceThickness > variant.supportedThicknessRange.maxMm)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index, 'referenceConsumption', 'referenceThicknessMm'],
          message: 'Reference Thickness must fall within the Supported Thickness Range'
        });
      }
    });

    if (productFamilyMarketKeys.size === 0) {
      context.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'A catalog must contain a Product Family'
      });
    }
  });

export type Catalog = z.infer<typeof catalogSchema>;

export function validateCatalog(input: unknown): Catalog {
  return catalogSchema.parse(input);
}

export function getPublishedCatalog(input: unknown): MarketVariant[] {
  const catalog = validateCatalog(input);

  return catalog.variants.filter(
    (variant) => variant.catalogReview.status === 'complete' && variant.catalogReview.lastReviewed
  );
}
