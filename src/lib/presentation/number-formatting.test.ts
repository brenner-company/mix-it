import { describe, expect, it } from 'vitest';

import {
  formatEnteredPowderMass,
  formatLiquidQuantity,
  formatMetricNumber,
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

  it('preserves all entered decimal digits in the displayed powder mass', () => {
    expect(formatEnteredPowderMass('12.3456789', 'BE')).toBe('12,3456789');
    expect(formatMetricNumber(12.3456789, 'BE')).toBe('12,3456789');
    expect(formatMetricNumber(0.9900000000000002, 'BE')).toBe('0,99');
  });

  it('rounds only the displayed liquid quantity at the specified thresholds', () => {
    expect(formatLiquidQuantity(0.8467, 'BE')).toBe('847 ml');
    expect(formatLiquidQuantity(3.239, 'BE')).toBe('3.240 ml');
    expect(formatLiquidQuantity(5.04, 'BE')).toBe('5,0 L');
  });
});
