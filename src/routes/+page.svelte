<script lang="ts">
  import { publishedCatalog } from '$lib/catalog/published';
  import type { Language, Market } from '$lib/catalog/catalog';
  import { getManufacturers, searchPublishedCatalog } from '$lib/catalog/search';
  import AppTopbar from '$lib/components/AppTopbar.svelte';
  import { getMessages } from '$lib/i18n/messages';
  import { readLanguage, readMarket, selectLanguage, selectMarket } from '$lib/preferences';

  let language = $state<Language>(readLanguage());
  let market = $state<Market>(readMarket());
  let search = $state('');
  let manufacturer = $state('');

  const copy = $derived(getMessages(language));
  const manufacturers = $derived(getManufacturers(publishedCatalog, market));
  const visibleVariants = $derived(
    searchPublishedCatalog(publishedCatalog, search, market, manufacturer)
  );

  function changeLanguage(event: Event): void {
    language = selectLanguage(event);
  }

  function changeMarket(event: Event): void {
    market = selectMarket(event);
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
  <AppTopbar {language} {market} {copy} onLanguageChange={changeLanguage} onMarketChange={changeMarket} />

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

  <section class="catalog-section" aria-labelledby="catalog-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{market === 'BE' ? copy.marketBelgium : market}</p>
        <h2 id="catalog-title">{copy.catalogTitle}</h2>
      </div>
      <p class="catalog-count">{copy.marketVariantCount(visibleVariants.length)}</p>
    </div>

    <div class="catalog-controls">
      <label class="search-field">
        <span class="field-label">{copy.searchLabel}</span>
        <input bind:value={search} type="search" placeholder={copy.searchPlaceholder} />
      </label>

      <label class="manufacturer-filter">
        <span class="field-label">{copy.manufacturerFilterLabel}</span>
        <select bind:value={manufacturer}>
          <option value="">{copy.allManufacturers}</option>
          {#each manufacturers as manufacturerOption (manufacturerOption)}
            <option value={manufacturerOption}>{manufacturerOption}</option>
          {/each}
        </select>
      </label>
    </div>

    {#if visibleVariants.length > 0}
      <div class="variant-list">
        {#each visibleVariants as variant (variant.id)}
          <a class="variant-card card" href={`/product/${variant.id}`}>
            <div class="variant-card-topline">
              <span class="variant-category">{variant.translations[language].category}</span>
              <span class="arrow" aria-hidden="true">↗</span>
            </div>
            <h3>{variant.translations[language].name}</h3>
            <p>{variant.manufacturer} · {variant.productCode}</p>
            <span class="variant-link">{copy.openCalculator}</span>
          </a>
        {/each}
      </div>
    {:else}
      <p class="empty-state card">{copy.noResults}</p>
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
    color: var(--muted);
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

  .catalog-section {
    padding: 2.3rem 0 3rem;
  }

  .section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.35rem;
  }

  h2 {
    margin-bottom: 0;
    font-size: 2.1rem;
    letter-spacing: -0.055em;
  }

  .catalog-count {
    margin-bottom: 0.2rem;
    color: var(--muted);
    font-size: 0.8rem;
  }

  .catalog-controls {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .search-field,
  .manufacturer-filter {
    display: block;
  }

  .variant-list {
    display: grid;
    gap: 1rem;
  }

  .variant-card {
    display: block;
    padding: 1.3rem;
    text-decoration: none;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .variant-card:hover {
    box-shadow: 0 24px 58px rgba(16, 42, 44, 0.16);
    transform: translateY(-3px);
  }

  .variant-card-topline {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .variant-category {
    color: var(--accent-dark);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .arrow {
    font-size: 1.5rem;
  }

  h3 {
    margin: 1.5rem 0 0.4rem;
    font-size: 1.45rem;
    letter-spacing: -0.04em;
  }

  .variant-card p {
    margin-bottom: 1.2rem;
    color: var(--muted);
  }

  .variant-link {
    color: var(--accent-dark);
    font-size: 0.9rem;
    font-weight: 800;
  }

  .empty-state {
    padding: 1.25rem;
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

    .variant-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .catalog-controls {
      grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
      max-width: 58rem;
      align-items: end;
    }
  }
</style>
