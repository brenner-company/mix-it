<script lang="ts">
  import type { MarketVariant } from '$lib/catalog/catalog';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Copy = Pick<
    Messages,
    | 'sourceDocument'
    | 'productCode'
    | 'sourceDocumentVersion'
    | 'sourceDocumentPublicationDate'
    | 'catalogReviewStatus'
    | 'catalogReviewComplete'
    | 'catalogReviewPending'
    | 'lastReviewed'
    | 'reviewNote'
    | 'factNotAvailable'
  >;

  type Props = {
    variant: MarketVariant;
    copy: Copy;
  };

  let { variant, copy }: Props = $props();
  const reviewStatus = $derived(
    variant.catalogReview.status === 'complete'
      ? copy.catalogReviewComplete
      : copy.catalogReviewPending
  );
  const lastReviewed = $derived(variant.catalogReview.lastReviewed ?? copy.factNotAvailable);
</script>

<section class="py-9 sm:py-12" aria-labelledby="traceability-title">
  <Card.Root>
    <Card.Header class="gap-3">
      <Badge variant="outline">{copy.sourceDocument}</Badge>
      <Card.Title>
        <h2 id="traceability-title" class="text-2xl tracking-tight">
          {variant.sourceDocument.title}
        </h2>
      </Card.Title>
      <Card.Description>{variant.sourceDocument.fileName}</Card.Description>
    </Card.Header>

    <Card.Content>
      <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.productCode}
          </dt>
          <dd class="m-0 font-semibold">{variant.productCode}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.sourceDocumentVersion}
          </dt>
          <dd class="m-0 font-semibold">{variant.sourceDocument.version}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.sourceDocumentPublicationDate}
          </dt>
          <dd class="m-0 font-semibold">{variant.sourceDocument.publicationDate}</dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.catalogReviewStatus}
          </dt>
          <dd class="m-0"><Badge variant="secondary">{reviewStatus}</Badge></dd>
        </div>
        <div class="grid gap-1">
          <dt class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.lastReviewed}
          </dt>
          <dd class="m-0 font-semibold">{lastReviewed}</dd>
        </div>
      </dl>
    </Card.Content>

    <Card.Footer class="grid gap-5 pt-5">
      <Separator />
      <p class="m-0 text-sm leading-relaxed text-muted-foreground">{copy.reviewNote}</p>
    </Card.Footer>
  </Card.Root>
</section>
