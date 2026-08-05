import type { Market, MarketVariant } from './catalog';

export function searchPublishedCatalog(
  variants: readonly MarketVariant[],
  query: string,
  market: Market
): MarketVariant[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return variants.filter((variant) => {
    if (variant.market !== market) return false;
    if (!normalizedQuery) return true;

    return [variant.name, variant.manufacturer, variant.productCode, variant.category, ...variant.aliases]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
