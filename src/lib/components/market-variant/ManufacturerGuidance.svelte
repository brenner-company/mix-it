<script lang="ts">
  import type { MarketVariant } from '$lib/catalog/catalog';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Translation = MarketVariant['translations'][keyof MarketVariant['translations']];
  type Copy = Pick<
    Messages,
    | 'manufacturerGuidance'
    | 'packagingLabel'
    | 'mixingInstructions'
    | 'mixingTime'
    | 'workingTime'
    | 'dryingTime'
    | 'factNotAvailable'
    | 'disclaimer'
  >;

  type Props = {
    translation: Translation;
    packagingLabel: string;
    copy: Copy;
  };

  let { translation, packagingLabel, copy }: Props = $props();
  const workingTime = $derived(translation.workingTime || copy.factNotAvailable);
  const dryingTime = $derived(translation.dryingTime || copy.factNotAvailable);
</script>

<section class="sm:col-span-2" aria-labelledby="manufacturer-guidance-title">
  <Card.Root>
    <Card.Header class="gap-3">
      <Card.Title>
        <h2 id="manufacturer-guidance-title" class="text-xl tracking-tight">
          {copy.manufacturerGuidance}
        </h2>
      </Card.Title>
    </Card.Header>

    <Card.Content class="grid gap-5">
      <div class="grid gap-2">
        <Badge variant="outline">{copy.packagingLabel}</Badge>
        <p class="m-0 font-semibold">{packagingLabel}</p>
      </div>

      <Separator />

      <div class="grid gap-2">
        <h3 class="m-0 text-base font-semibold">{copy.mixingInstructions}</h3>
        <p class="m-0 max-w-prose leading-relaxed text-muted-foreground">
          {translation.mixingInstructions}
        </p>
      </div>

      <Separator />

      <dl class="grid gap-4 sm:grid-cols-3">
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.mixingTime}
          </dt>
          <dd class="m-0 font-semibold">{translation.mixingTime || copy.factNotAvailable}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.workingTime}
          </dt>
          <dd class="m-0 font-semibold">{workingTime}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.dryingTime}
          </dt>
          <dd class="m-0 font-semibold">{dryingTime}</dd>
        </div>
      </dl>
    </Card.Content>

    <Card.Footer class="grid gap-5 pt-5">
      <Separator />
      <aside aria-label={copy.disclaimer}>
        <Alert.Root variant="default" role="note">
          <Alert.AlertTitle>{copy.disclaimer}</Alert.AlertTitle>
          <Alert.AlertDescription>{translation.disclaimer}</Alert.AlertDescription>
        </Alert.Root>
      </aside>
    </Card.Footer>
  </Card.Root>
</section>
