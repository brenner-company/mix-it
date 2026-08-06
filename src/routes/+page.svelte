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

<main class="shell">
  <AppTopbar
    {language}
    {market}
    markets={supportedMarkets}
    {copy}
    onLanguageChange={changeLanguage}
    onMarketChange={changeMarket}
  />

  <section class="hero" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="eyebrow">{copy.homeEyebrow}</p>
      <h1 id="home-title">{copy.homeTitle}</h1>
      <p class="hero-intro">{copy.homeIntro}</p>
    </div>
    <div class="hero-mark" aria-hidden="true">
      <span>+</span>
      <span>→</span>
      <span>●</span>
    </div>
  </section>

  <section class="py-9 pb-12" aria-labelledby="catalog-title">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">{marketName}</p>
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

  <footer class="footer muted">{copy.footerNote}</footer>
</main>

<style>
  .hero {
    display: grid;
    gap: 1.4rem;
    align-items: end;
    padding: 3.5rem 0 3rem;
  }

  h1,
  h2,
  h3,
  p {
    margin-top: 0;
  }

  h1 {
    max-width: 15ch;
    margin-bottom: 1rem;
    font-size: clamp(3rem, 13vw, 6.9rem);
    line-height: 0.92;
    letter-spacing: -0.085em;
  }

  .hero-intro {
    max-width: 33rem;
    margin-bottom: 0;
    color: var(--muted-foreground);
    font-size: 1.08rem;
    line-height: 1.6;
  }

  .hero-mark {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    gap: 0.4rem;
    max-width: 16rem;
    color: var(--accent-dark);
    font-size: 2.1rem;
    text-align: center;
  }

  .hero-mark span {
    display: grid;
    width: 4.5rem;
    height: 4.5rem;
    place-items: center;
    border-radius: 50%;
    background: var(--mint);
  }

  .hero-mark span:nth-child(2) {
    color: var(--ink);
    background: #f5d2a5;
  }

  .footer {
    padding: 0 0 2rem;
    font-size: 0.78rem;
  }

  @media (min-width: 44rem) {
    .hero {
      grid-template-columns: 1fr auto;
      min-height: 30rem;
      padding: 5rem 0 4rem;
    }

    .hero-mark {
      max-width: 19rem;
      transform: rotate(-6deg);
    }

  }
</style>
