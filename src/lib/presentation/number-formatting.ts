import type { Market, MarketVariant } from '../catalog/catalog';

export type DimensionUnit = 'm' | 'cm';

type AreaDimensionsInput = {
  width: number;
  widthUnit: DimensionUnit;
  height: number;
  heightUnit: DimensionUnit;
};

const marketLocales: Record<Market, string> = { BE: 'nl-BE', UK: 'en-GB' };

function marketLocale(market: MarketVariant['market']): string {
  return marketLocales[market];
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

function toMetres(value: number, unit: DimensionUnit): number {
  return unit === 'cm' ? value / 100 : value;
}

export function calculateAreaSquareMetresFromDimensions({
  width,
  widthUnit,
  height,
  heightUnit
}: AreaDimensionsInput): number {
  return toMetres(width, widthUnit) * toMetres(height, heightUnit);
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

export function formatQuantityExample(market: MarketVariant['market']): string {
  return formatLiquidQuantity(5, market);
}
