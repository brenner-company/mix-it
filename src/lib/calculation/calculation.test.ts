import { describe, expect, it } from 'vitest';

import { calculateRequiredLiquid } from './calculation';
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
