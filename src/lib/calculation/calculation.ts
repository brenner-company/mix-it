import type { MarketVariant } from '../catalog/catalog';

export function calculateRequiredLiquid(powderMassKg: number, variant: Pick<MarketVariant, 'mixingRatio'>): number {
  return powderMassKg * (variant.mixingRatio.liquidLitres / variant.mixingRatio.powderKg);
}
