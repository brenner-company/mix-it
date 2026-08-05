<script lang="ts">
  import type { Language, Market } from '$lib/catalog/catalog';
  import type { Messages } from '$lib/i18n/messages';
  import PreferencesNav from './PreferencesNav.svelte';

  type Props = {
    language: Language;
    market: Market;
    copy: Pick<Messages, 'languageLabel' | 'marketLabel' | 'marketBelgium' | 'primaryNavigation' | 'homeAriaLabel'>;
    onLanguageChange: (event: Event) => void;
    onMarketChange: (event: Event) => void;
  };

  let { language, market, copy, onLanguageChange, onMarketChange }: Props = $props();
</script>

<nav class="topbar" aria-label={copy.primaryNavigation}>
  <a class="wordmark" href="/" aria-label={copy.homeAriaLabel}>mix<span>-</span>it</a>
  <PreferencesNav
    {language}
    {market}
    {copy}
    {onLanguageChange}
    {onMarketChange}
  />
</nav>
