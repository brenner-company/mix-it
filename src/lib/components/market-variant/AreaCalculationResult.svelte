<script lang="ts">
  import type { Market } from '$lib/catalog/catalog';
  import type { calculateAreaRequirements } from '$lib/calculation/calculation';
  import { formatLiquidQuantity, formatMetricNumber, formatPowderQuantity } from '$lib/presentation/number-formatting';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Copy = Pick<
    Messages,
    | 'areaResultTitle'
    | 'requiredPowder'
    | 'requiredLiquid'
    | 'areaAssumptionArea'
    | 'areaAssumptionThickness'
    | 'wasteMarginLabel'
    | 'areaAssumptionWasteMargin'
    | 'outsideGuidanceTitle'
    | 'outsideGuidance'
  >;

  type Props = {
    calculation: ReturnType<typeof calculateAreaRequirements>;
    market: Market;
    supportedThicknessRange: { minMm: number; maxMm: number };
    copy: Copy;
  };

  let { calculation, market, supportedThicknessRange, copy }: Props = $props();
</script>

<Card.Root
  class="border-primary/20 bg-primary/10"
  aria-live="polite"
  data-testid="area-calculation-result"
>
  <Card.Header class="gap-2">
    <Card.Title>
      <h3 class="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {copy.areaResultTitle}
      </h3>
    </Card.Title>
  </Card.Header>
  <Card.Content class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="grid gap-1 border-t border-border pt-3">
        <p class="text-sm font-semibold text-muted-foreground">{copy.requiredPowder}</p>
        <p class="m-0 text-4xl font-extrabold tracking-[-0.08em] text-foreground sm:text-5xl">
          {formatPowderQuantity(calculation.requiredPowderKg, market)}
        </p>
      </div>
      <div class="grid gap-1 border-t border-border pt-3">
        <p class="text-sm font-semibold text-muted-foreground">{copy.requiredLiquid}</p>
        <p class="m-0 text-4xl font-extrabold tracking-[-0.08em] text-foreground sm:text-5xl">
          {formatLiquidQuantity(calculation.requiredLiquidLitres, market)}
        </p>
      </div>
    </div>

    <Separator />

    <dl class="grid gap-3 sm:grid-cols-3">
      <div class="grid gap-1">
        <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.areaAssumptionArea}</dt>
        <dd class="m-0 font-semibold">{formatMetricNumber(calculation.assumptions.areaSquareMetres, market)} m²</dd>
      </div>
      <div class="grid gap-1">
        <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.areaAssumptionThickness}</dt>
        <dd class="m-0 font-semibold">{formatMetricNumber(calculation.assumptions.thicknessMm, market)} mm</dd>
      </div>
      <div class="grid gap-1">
        <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.wasteMarginLabel}</dt>
        <dd class="m-0 font-semibold">
          {copy.areaAssumptionWasteMargin(
            formatMetricNumber(calculation.assumptions.wasteMargin * 100, market)
          )}
        </dd>
      </div>
    </dl>

    {#if calculation.outsideSupportedThicknessRange}
      <Alert.Root variant="destructive" class="bg-destructive/5">
        <Alert.AlertTitle>{copy.outsideGuidanceTitle}</Alert.AlertTitle>
        <Alert.AlertDescription>
          {copy.outsideGuidance(
            formatMetricNumber(supportedThicknessRange.minMm, market),
            formatMetricNumber(supportedThicknessRange.maxMm, market)
          )}
        </Alert.AlertDescription>
      </Alert.Root>
    {/if}
  </Card.Content>
</Card.Root>
