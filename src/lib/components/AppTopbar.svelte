<script lang="ts">
  import type { Language, Market } from '$lib/catalog/catalog';
  import type { Messages } from '$lib/i18n/messages';
  import PreferencesNav from './PreferencesNav.svelte';

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
    onLanguageChange: (language: Language) => void;
    onMarketChange: (market: Market) => void;
  };

  let { language, market, markets, copy, onLanguageChange, onMarketChange }: Props = $props();
</script>

<nav
  class="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 py-4 sm:py-5"
  aria-label={copy.primaryNavigation}
>
  <a
    class="text-xl font-semibold tracking-tight text-foreground no-underline"
    href="/"
    aria-label={copy.homeAriaLabel}
  >mix<span class="text-primary">-</span>it</a>
  <PreferencesNav
    {language}
    {market}
    {markets}
    {copy}
    {onLanguageChange}
    {onMarketChange}
  />
</nav>
