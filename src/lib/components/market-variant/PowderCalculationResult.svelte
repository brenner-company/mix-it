<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Copy = Pick<Messages, 'resultTitle' | 'enteredPowder' | 'calculatedEstimate'>;

  type Props = {
    liquid: string;
    enteredPowder: string;
    copy: Copy;
  };

  let { liquid, enteredPowder, copy }: Props = $props();
</script>

<Card.Root
  class="calculation-result"
  aria-live="polite"
  data-testid="calculation-result"
>
  <Card.Header class="gap-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <Card.Title>
        <h3 class="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {copy.resultTitle}
        </h3>
      </Card.Title>
      <Badge variant="secondary">{copy.calculatedEstimate}</Badge>
    </div>
  </Card.Header>
  <Card.Content class="grid gap-2">
    <p class="liquid-value text-5xl font-extrabold tracking-[-0.09em] text-foreground sm:text-6xl">
      {liquid}
    </p>
    <Card.Description>
      {copy.enteredPowder}: <strong class="font-semibold text-foreground">{enteredPowder} kg</strong>
    </Card.Description>
  </Card.Content>
</Card.Root>
