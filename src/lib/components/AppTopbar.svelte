<script lang="ts">
  import type { Language, Market } from '$lib/catalog/catalog';
  import type { Messages } from '$lib/i18n/messages';

  type Props = {
    language: Language;
    market: Market;
    markets: readonly Market[];
    copy: Pick<
      Messages,
      | 'languageLabel'
      | 'marketLabel'
      | 'marketName'
      | 'primaryNavigation'
      | 'homeAriaLabel'
    >;
    onLanguageChange: (event: Event) => void;
    onMarketChange: (event: Event) => void;
  };

  let { language, market, markets, copy, onLanguageChange, onMarketChange }: Props = $props();
</script>

<nav aria-label={copy.primaryNavigation}>
  <ul>
    <li><strong><a href="/" aria-label={copy.homeAriaLabel}>mix-it</a></strong></li>
  </ul>
  <ul>
    <li>
      <select
        aria-label={copy.languageLabel}
        title={copy.languageLabel}
        value={language}
        onchange={onLanguageChange}
      >
        <option value="nl">NL</option>
        <option value="en">EN</option>
      </select>
    </li>
    <li>
      <select
        aria-label={copy.marketLabel}
        title={copy.marketLabel}
        value={market}
        onchange={onMarketChange}
      >
        {#each markets as marketOption (marketOption)}
          <option value={marketOption}>{copy.marketName(marketOption)}</option>
        {/each}
      </select>
    </li>
  </ul>
</nav>
