import { describe, expect, it } from 'vitest';

import { calculateAreaRequirements, calculateRequiredLiquid } from './calculation';
import { calculateAreaSquareMetresFromDimensions } from '../presentation/number-formatting';
import { formatLiquidQuantity } from '../presentation/number-formatting';

describe('powder calculator', () => {
  it('keeps the Mixing Ratio precise until liquid presentation', () => {
    const liquid = calculateRequiredLiquid(12.345, {
      mixingRatio: { powderKg: 25, liquidLitres: 16 }
    });

    expect(liquid).toBe(7.9008);
  });

  it('rounds only the displayed liquid quantity at the specified thresholds', () => {
    expect(formatLiquidQuantity(0.8467, 'BE')).toBe('847 ml');
    expect(formatLiquidQuantity(3.239, 'BE')).toBe('3.240 ml');
    expect(formatLiquidQuantity(5.04, 'BE')).toBe('5,0 L');
  });
});

describe('area calculator', () => {
  const areaVariant = {
    mixingRatio: { powderKg: 25, liquidLitres: 16 },
    referenceConsumption: { powderKgPerSquareMetre: 8, referenceThicknessMm: 10 },
    supportedThicknessRange: { minMm: 5, maxMm: 25 }
  } as const;

  it('calculates the reference thickness with the default Waste Margin', () => {
    expect(
      calculateAreaRequirements({
        areaSquareMetres: 10,
        thicknessMm: 10,
        ...areaVariant
      })
    ).toEqual({
      requiredPowderKg: 88,
      requiredLiquidLitres: 56.32,
      assumptions: { areaSquareMetres: 10, thicknessMm: 10, wasteMargin: 0.1 },
      outsideSupportedThicknessRange: false
    });
  });

  it('scales Reference Consumption linearly for another supported thickness', () => {
    const result = calculateAreaRequirements({
      areaSquareMetres: 10,
      thicknessMm: 15,
      wasteMargin: 0,
      ...areaVariant
    });

    expect(result.requiredPowderKg).toBe(120);
    expect(result.requiredLiquidLitres).toBe(76.8);
    expect(result.outsideSupportedThicknessRange).toBe(false);
  });

  it('calculates and flags a thickness outside manufacturer guidance', () => {
    const result = calculateAreaRequirements({
      areaSquareMetres: 10,
      thicknessMm: 30,
      wasteMargin: 0,
      ...areaVariant
    });

    expect(result.requiredPowderKg).toBe(240);
    expect(result.requiredLiquidLitres).toBe(153.6);
    expect(result.outsideSupportedThicknessRange).toBe(true);
  });

  it('applies zero Waste Margin without changing the base quantity', () => {
    const result = calculateAreaRequirements({
      areaSquareMetres: 10,
      thicknessMm: 10,
      wasteMargin: 0,
      ...areaVariant
    });

    expect(result.assumptions.wasteMargin).toBe(0);
    expect(result.requiredPowderKg).toBe(80);
    expect(result.requiredLiquidLitres).toBe(51.2);
  });

  it('produces the same quantities for equivalent direct and dimension areas', () => {
    const directResult = calculateAreaRequirements({
      areaSquareMetres: 10,
      thicknessMm: 10,
      ...areaVariant
    });
    const dimensionResult = calculateAreaRequirements({
      areaSquareMetres: calculateAreaSquareMetresFromDimensions({
        width: 400,
        widthUnit: 'cm',
        height: 250,
        heightUnit: 'cm'
      }),
      thicknessMm: 10,
      ...areaVariant
    });

    expect(dimensionResult.requiredPowderKg).toBe(directResult.requiredPowderKg);
    expect(dimensionResult.requiredLiquidLitres).toBe(directResult.requiredLiquidLitres);
  });
});
