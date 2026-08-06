<script lang="ts">
  import type { Language, Market } from '$lib/catalog/catalog';
  import * as Select from '$lib/components/ui/select/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Props = {
    language: Language;
    market: Market;
    markets: readonly Market[];
    copy: Pick<Messages, 'languageLabel' | 'marketLabel' | 'marketName'>;
    onLanguageChange: (language: Language) => void;
    onMarketChange: (market: Market) => void;
  };

  let { language, market, markets, copy, onLanguageChange, onMarketChange }: Props = $props();

  const selectedMarketLabel = $derived(copy.marketName(market));

  function changeLanguage(value: string | undefined): void {
    if (value !== 'nl' && value !== 'en') return;

    onLanguageChange(value);
  }

  function changeMarket(value: string | undefined): void {
    if (value !== 'BE' && value !== 'UK') return;

    onMarketChange(value);
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  <Select.Root
    type="single"
    name="language"
    value={language}
    onValueChange={changeLanguage}
  >
    <Select.Trigger
      class="min-h-11 min-w-14 rounded-lg border-border bg-background px-3 font-medium shadow-none"
      aria-label={copy.languageLabel}
    >
      {language === 'nl' ? 'NL' : 'EN'}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>{copy.languageLabel}</Select.Label>
        <Select.Item class="min-h-11" value="nl" label="NL">NL</Select.Item>
        <Select.Item class="min-h-11" value="en" label="EN">EN</Select.Item>
      </Select.Group>
    </Select.Content>
  </Select.Root>

  <Select.Root
    type="single"
    name="market"
    value={market}
    onValueChange={changeMarket}
  >
    <Select.Trigger
      class="min-h-11 min-w-44 rounded-lg border-border bg-background px-3 font-medium shadow-none"
      aria-label={copy.marketLabel}
    >
      {selectedMarketLabel}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>{copy.marketLabel}</Select.Label>
        {#each markets as marketOption (marketOption)}
          <Select.Item
            class="min-h-11"
            value={marketOption}
            label={copy.marketName(marketOption)}
          >
            {copy.marketName(marketOption)}
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</div>
