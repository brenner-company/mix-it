<script lang="ts">
  import { publishedCatalog } from '$lib/catalog/published';
  import { supportedMarkets, type Language, type Market } from '$lib/catalog/catalog';
  import { getManufacturers, searchPublishedCatalog } from '$lib/catalog/search';
  import AppTopbar from '$lib/components/AppTopbar.svelte';
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
  const visibleVariants = $derived(
    searchPublishedCatalog(publishedCatalog, search, market, manufacturer)
  );

  function changeLanguage(event: Event): void {
    language = selectLanguage(event);
  }

  function changeMarket(event: Event): void {
    market = selectMarket(event);
    search = '';
    manufacturer = '';
  }

  function preventSearch(event: SubmitEvent): void {
    event.preventDefault();
  }
</script>

<svelte:head>
  <title>Mix-it — {copy.catalogTitle}</title>
  <meta
    name="description"
    content={copy.appDescription}
  />
</svelte:head>

<main class="container">
  <AppTopbar
    {language}
    {market}
    markets={supportedMarkets}
    {copy}
    onLanguageChange={changeLanguage}
    onMarketChange={changeMarket}
  />

  <header>
    <p>{copy.homeEyebrow}</p>
    <h1 id="home-title">{copy.homeTitle}</h1>
    <p>{copy.homeIntro}</p>
  </header>

  <section aria-labelledby="catalog-title">
    <header>
      <p>{marketName}</p>
      <h2 id="catalog-title">{copy.catalogTitle}</h2>
      <p aria-live="polite">{copy.marketVariantCount(visibleVariants.length)}</p>
    </header>
    <p>{copy.quantityFormatHint(formatQuantityExample(market))}</p>

    <form role="search" aria-label={copy.catalogTitle} onsubmit={preventSearch}>
      <div class="grid">
        <label>
          {copy.searchLabel}
          <input bind:value={search} type="search" placeholder={copy.searchPlaceholder} />
        </label>

        <label>
          {copy.manufacturerFilterLabel}
          <select bind:value={manufacturer}>
            <option value="">{copy.allManufacturers}</option>
            {#each manufacturers as manufacturerOption (manufacturerOption)}
              <option value={manufacturerOption}>{manufacturerOption}</option>
            {/each}
          </select>
        </label>
      </div>
    </form>

    {#if visibleVariants.length > 0}
      <div class="grid">
        {#each visibleVariants as variant (variant.id)}
          <article>
            <header>
              <p>{variant.translations[language].category}</p>
              <h3>{variant.translations[language].name}</h3>
            </header>
            <p>
              <strong>{variant.manufacturer}</strong> ·
              <data value={variant.productCode}>{variant.productCode}</data>
            </p>
            <footer>
              <a
                href={`/product/${variant.id}`}
                aria-label={`${copy.openCalculator}: ${variant.translations[language].name}`}
              >{copy.openCalculator}</a>
            </footer>
          </article>
        {/each}
      </div>
    {:else}
      <p role="status" aria-live="polite">{copy.noResults}</p>
    {/if}
  </section>

  <footer><small>{copy.footerNote}</small></footer>
</main>
