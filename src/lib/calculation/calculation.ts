import type { MarketVariant } from '../catalog/catalog';

export function calculateRequiredLiquid(powderMassKg: number, variant: Pick<MarketVariant, 'mixingRatio'>): number {
  return powderMassKg * (variant.mixingRatio.liquidLitres / variant.mixingRatio.powderKg);
}

type AreaCalculationInput = {
  areaSquareMetres: number;
  thicknessMm: number;
  wasteMargin?: number;
  mixingRatio: MarketVariant['mixingRatio'];
  referenceConsumption: {
    powderKgPerSquareMetre: number;
    referenceThicknessMm: number;
  };
  supportedThicknessRange: MarketVariant['supportedThicknessRange'];
};

type AreaCalculationResult = {
  requiredPowderKg: number;
  requiredLiquidLitres: number;
  assumptions: {
    areaSquareMetres: number;
    thicknessMm: number;
    wasteMargin: number;
  };
  outsideSupportedThicknessRange: boolean;
};

export function calculateAreaRequirements({
  areaSquareMetres,
  thicknessMm,
  wasteMargin = 0.1,
  mixingRatio,
  referenceConsumption,
  supportedThicknessRange
}: AreaCalculationInput): AreaCalculationResult {
  const basePowderKg =
    areaSquareMetres *
    referenceConsumption.powderKgPerSquareMetre *
    (thicknessMm / referenceConsumption.referenceThicknessMm);
  const requiredPowderKg = basePowderKg * (1 + wasteMargin);

  return {
    requiredPowderKg,
    requiredLiquidLitres: calculateRequiredLiquid(requiredPowderKg, { mixingRatio }),
    assumptions: { areaSquareMetres, thicknessMm, wasteMargin },
    outsideSupportedThicknessRange:
      thicknessMm < supportedThicknessRange.minMm || thicknessMm > supportedThicknessRange.maxMm
  };
}
