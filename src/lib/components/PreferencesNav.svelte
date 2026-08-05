<script lang="ts">
  import type { Language, Market } from '$lib/catalog/catalog';
  import type { Messages } from '$lib/i18n/messages';

  type Props = {
    language: Language;
    market: Market;
    copy: Pick<Messages, 'languageLabel' | 'marketLabel' | 'marketBelgium'>;
    onLanguageChange: (event: Event) => void;
    onMarketChange: (event: Event) => void;
  };

  let { language, market, copy, onLanguageChange, onMarketChange }: Props = $props();
</script>

<div class="preferences">
  <label>
    <span class="sr-only">{copy.languageLabel}</span>
    <select aria-label={copy.languageLabel} value={language} onchange={onLanguageChange}>
      <option value="nl">NL</option>
      <option value="en">EN</option>
    </select>
  </label>
  <label>
    <span class="sr-only">{copy.marketLabel}</span>
    <select aria-label={copy.marketLabel} value={market} onchange={onMarketChange}>
      <option value="BE">{copy.marketBelgium}</option>
    </select>
  </label>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .preferences {
    display: flex;
    gap: 0.5rem;
  }

  select {
    min-height: 2.5rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--line);
    border-radius: 0.65rem;
    color: var(--ink);
    background: rgba(255, 253, 248, 0.72);
    font-size: 0.82rem;
  }
</style>
