<script lang="ts">
  import { publishedCatalog } from '$lib/catalog/published';
  import { supportedMarkets, type Language, type Market } from '$lib/catalog/catalog';
  import { getManufacturers, searchPublishedCatalog } from '$lib/catalog/search';
  import AppTopbar from '$lib/components/AppTopbar.svelte';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { getMessages } from '$lib/i18n/messages';
  import { readLanguage, readMarket, selectLanguage, selectMarket } from '$lib/preferences';
  import { formatQuantityExample } from '$lib/presentation/number-formatting';

  let language = $state<Language>(readLanguage());
  let market = $state<Market>(readMarket());
  let search = $state('');
  let manufacturer = $state('');

  const copy = $derived(getMessages(language));
  const marketName = $derived(copy.marketName(market));
  const manufacturers = $derived(getManufacturers(publishedCatalog, market));
  const selectedManufacturer = $derived(manufacturer || copy.allManufacturers);
  const visibleVariants = $derived(
    searchPublishedCatalog(publishedCatalog, search, market, manufacturer)
  );

  function changeLanguage(selectedLanguage: Language): void {
    language = selectLanguage(selectedLanguage);
  }

  function changeMarket(selectedMarket: Market): void {
    market = selectMarket(selectedMarket);
    search = '';
    manufacturer = '';
  }

  function changeManufacturer(selectedValue: string | undefined): void {
    manufacturer = selectedValue === 'all' ? '' : selectedValue ?? '';
  }
</script>

<svelte:head>
  <title>Mix-it — {copy.catalogTitle}</title>
  <meta
    name="description"
    content={copy.appDescription}
  />
</svelte:head>

<AppTopbar
  {language}
  {market}
  markets={supportedMarkets}
  {copy}
  onLanguageChange={changeLanguage}
  onMarketChange={changeMarket}
/>

  <section
    class="grid items-end gap-6 py-14 pb-12 sm:min-h-[30rem] sm:grid-cols-[1fr_auto] sm:py-20 sm:pb-16"
    aria-labelledby="home-title"
  >
    <div>
      <p class="mb-[0.65rem] text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
        {copy.homeEyebrow}
      </p>
      <h1
        id="home-title"
        class="mb-4 max-w-[15ch] text-[clamp(3rem,13vw,6.9rem)] leading-[0.92] tracking-[-0.085em]"
      >{copy.homeTitle}</h1>
      <p class="mb-0 max-w-[33rem] text-[1.08rem] leading-[1.6] text-muted-foreground">
        {copy.homeIntro}
      </p>
    </div>
    <div
      class="grid max-w-64 grid-cols-3 items-center gap-1.5 text-center text-[2.1rem] text-primary sm:max-w-[19rem] sm:-rotate-6"
      aria-hidden="true"
    >
      <span class="grid size-[4.5rem] place-items-center rounded-full bg-primary/10">+</span>
      <span class="grid size-[4.5rem] place-items-center rounded-full bg-secondary text-secondary-foreground">→</span>
      <span class="grid size-[4.5rem] place-items-center rounded-full bg-primary/10">●</span>
    </div>
  </section>

  <section class="py-9 pb-12" aria-labelledby="catalog-title">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="mb-[0.65rem] text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
          {marketName}
        </p>
        <h2 id="catalog-title" class="mb-0 text-[2.1rem] tracking-[-0.055em]">{copy.catalogTitle}</h2>
      </div>
      <p class="mb-0.5 text-sm text-muted-foreground">{copy.marketVariantCount(visibleVariants.length)}</p>
    </div>
    <p class="mt-2 mb-5 text-sm text-muted-foreground">
      {copy.quantityFormatHint(formatQuantityExample(market))}
    </p>

    <Field.Group
      class="mb-5 gap-4 md:grid md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)] md:items-end"
    >
      <Field.Field>
        <Field.Label for="catalog-search">{copy.searchLabel}</Field.Label>
        <Input
          id="catalog-search"
          bind:value={search}
          type="search"
          class="min-h-11"
          placeholder={copy.searchPlaceholder}
        />
      </Field.Field>

      <Field.Field>
        <Field.Label for="manufacturer-filter">{copy.manufacturerFilterLabel}</Field.Label>
        <Select.Root
          type="single"
          name="manufacturer"
          value={manufacturer || 'all'}
          onValueChange={changeManufacturer}
        >
          <Select.Trigger id="manufacturer-filter" class="min-h-11 w-full">
            {selectedManufacturer}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="all" label={copy.allManufacturers}>
                {copy.allManufacturers}
              </Select.Item>
              {#each manufacturers as manufacturerOption (manufacturerOption)}
                <Select.Item value={manufacturerOption} label={manufacturerOption}>
                  {manufacturerOption}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Field.Field>
    </Field.Group>

    {#if visibleVariants.length > 0}
      <div class="grid gap-4 md:grid-cols-2">
        {#each visibleVariants as variant (variant.id)}
          <a
            class="group block h-full rounded-[min(var(--radius-4xl),24px)] no-underline outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            href={`/product/${variant.id}`}
          >
            <Card.Root class="h-full transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
              <Card.Header>
                <Badge variant="outline">
                  {variant.translations[language].category}
                </Badge>
                <Card.Action aria-hidden="true">↗</Card.Action>
                <Card.Title class="col-span-full mt-4">
                  <h3 class="mb-0 text-xl tracking-tight">
                    {variant.translations[language].name}
                  </h3>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <Card.Description>
                  {variant.manufacturer} · {variant.productCode}
                </Card.Description>
              </Card.Content>
              <Card.Footer>
                <span class="font-medium text-primary">{copy.openCalculator}</span>
              </Card.Footer>
            </Card.Root>
          </a>
        {/each}
      </div>
    {:else}
      <Empty.Root class="border border-dashed border-border px-6 py-10">
        <Empty.Header>
          <Empty.Title>{copy.noResults}</Empty.Title>
        </Empty.Header>
      </Empty.Root>
    {/if}
  </section>

  <footer class="pb-8 text-xs text-muted-foreground">{copy.footerNote}</footer>
