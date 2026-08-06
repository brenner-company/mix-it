import { describe, expect, it } from 'vitest';

import {
  calculateAreaSquareMetresFromDimensions,
  formatEnteredPowderMass,
  formatLiquidQuantity,
  formatMetricNumber,
  formatQuantityExample,
  parseNonNegativeMetricInput,
  parseMetricInput
} from './number-formatting';

describe('presentation number formatting', () => {
  it('normalizes comma and point decimal input', () => {
    expect(parseMetricInput('12,5')).toBe(12.5);
    expect(parseMetricInput('12.5')).toBe(12.5);
    expect(parseMetricInput('0')).toBeNull();
    expect(parseMetricInput('-1')).toBeNull();
    expect(parseMetricInput('12 kg')).toBeNull();
  });

  it('accepts zero for a Waste Margin while rejecting negative values', () => {
    expect(parseNonNegativeMetricInput('0')).toBe(0);
    expect(parseNonNegativeMetricInput('10,5')).toBe(10.5);
    expect(parseNonNegativeMetricInput('-1')).toBeNull();
  });

  it('normalizes metre, centimetre, and mixed-unit dimensions to square metres', () => {
    expect(
      calculateAreaSquareMetresFromDimensions({
        width: 4,
        widthUnit: 'm',
        height: 2.5,
        heightUnit: 'm'
      })
    ).toBe(10);
    expect(
      calculateAreaSquareMetresFromDimensions({
        width: 400,
        widthUnit: 'cm',
        height: 250,
        heightUnit: 'cm'
      })
    ).toBe(10);
    expect(
      calculateAreaSquareMetresFromDimensions({
        width: 4,
        widthUnit: 'm',
        height: 250,
        heightUnit: 'cm'
      })
    ).toBe(10);
  });

  it('preserves all entered decimal digits in the displayed powder mass', () => {
    expect(formatEnteredPowderMass('12.3456789', 'BE')).toBe('12,3456789');
    expect(formatMetricNumber(12.3456789, 'BE')).toBe('12,3456789');
    expect(formatMetricNumber(0.9900000000000002, 'BE')).toBe('0,99');
  });

  it('rounds only the displayed liquid quantity at the specified thresholds', () => {
    expect(formatLiquidQuantity(0.8467, 'BE')).toBe('847 ml');
    expect(formatLiquidQuantity(3.239, 'BE')).toBe('3.240 ml');
    expect(formatLiquidQuantity(5.04, 'BE')).toBe('5,0 L');
    expect(formatLiquidQuantity(0.8467, 'UK')).toBe('847 ml');
    expect(formatLiquidQuantity(3.239, 'UK')).toBe('3,240 ml');
    expect(formatLiquidQuantity(5.04, 'UK')).toBe('5.0 L');
  });

  it('uses the selected Market notation for decimal and grouping separators', () => {
    expect(formatMetricNumber(12345.67, 'BE')).toBe('12.345,67');
    expect(formatMetricNumber(12345.67, 'UK')).toBe('12,345.67');
    expect(formatEnteredPowderMass('12345.67', 'BE')).toBe('12.345,67');
    expect(formatEnteredPowderMass('12345,67', 'UK')).toBe('12,345.67');
    expect(formatQuantityExample('BE')).toBe('5,0 L');
    expect(formatQuantityExample('UK')).toBe('5.0 L');
  });
});
