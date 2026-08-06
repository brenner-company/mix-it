import type { Market, MarketVariant } from './catalog';

function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

function searchableText(variant: MarketVariant): string {
  return normalizeSearchText(
    [
      variant.name,
      variant.manufacturer,
      variant.productCode,
      variant.category,
      ...variant.aliases,
      variant.translations.nl.name,
      variant.translations.nl.category,
      variant.translations.en.name,
      variant.translations.en.category
    ].join(' ')
  );
}

export function getManufacturers(
  variants: readonly MarketVariant[],
  market: Market
): string[] {
  const manufacturers = new Map<string, string>();

  for (const variant of variants) {
    if (variant.market === market) {
      const normalizedManufacturer = normalizeSearchText(variant.manufacturer);
      manufacturers.set(normalizedManufacturer, variant.manufacturer);
    }
  }

  return [...manufacturers.values()].sort((left, right) => left.localeCompare(right));
}

export function searchPublishedCatalog(
  variants: readonly MarketVariant[],
  query: string,
  market: Market,
  manufacturer = ''
): MarketVariant[] {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery ? normalizedQuery.split(' ') : [];
  const normalizedManufacturer = normalizeSearchText(manufacturer);

  return variants.filter((variant) => {
    if (variant.market !== market) return false;
    if (
      normalizedManufacturer &&
      normalizeSearchText(variant.manufacturer) !== normalizedManufacturer
    ) {
      return false;
    }

    const text = searchableText(variant);
    return queryTokens.every((token) => text.includes(token));
  });
}
