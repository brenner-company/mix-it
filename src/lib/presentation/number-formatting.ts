import type { MarketVariant } from '../catalog/catalog';

function marketLocale(market: MarketVariant['market']): string {
  return market === 'BE' ? 'nl-BE' : 'en-GB';
}

function parseNumericInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.');

  if (!/^\+?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseMetricInput(value: string): number | null {
  const parsed = parseNumericInput(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

export function parseNonNegativeMetricInput(value: string): number | null {
  return parseNumericInput(value);
}

export function formatEnteredPowderMass(value: string, market: MarketVariant['market']): string {
  const normalized = value.trim().replace(',', '.').replace(/^\+/, '');
  const [integerPart, fractionPart] = normalized.split('.');
  const integer = new Intl.NumberFormat(marketLocale(market), { useGrouping: true }).format(
    Number(integerPart)
  );

  if (!fractionPart) return integer;

  const decimalSeparator = new Intl.NumberFormat(marketLocale(market))
    .formatToParts(1.1)
    .find((part) => part.type === 'decimal')?.value ?? '.';

  return `${integer}${decimalSeparator}${fractionPart}`;
}

export function formatMetricNumber(value: number, market: MarketVariant['market']): string {
  return new Intl.NumberFormat(marketLocale(market), {
    maximumSignificantDigits: 15
  }).format(value);
}

export function formatPowderQuantity(
  powderMassKg: number,
  market: MarketVariant['market']
): string {
  return `${formatMetricNumber(powderMassKg, market)} kg`;
}

export function formatLiquidQuantity(liquidLitres: number, market: MarketVariant['market']): string {
  const formatter = new Intl.NumberFormat(marketLocale(market), {
    maximumFractionDigits: 0
  });

  if (liquidLitres < 1) {
    return `${formatter.format(Math.round(liquidLitres * 1000))} ml`;
  }

  if (liquidLitres < 5) {
    return `${formatter.format(Math.round(liquidLitres * 100) * 10)} ml`;
  }

  return `${new Intl.NumberFormat(marketLocale(market), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(liquidLitres)} L`;
}
