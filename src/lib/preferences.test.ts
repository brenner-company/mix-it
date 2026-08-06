import { describe, expect, it } from 'vitest';

import { hasSupportedMarketRegion, marketFromBrowserLocale } from './preferences';

describe('Market preference defaults', () => {
  it('selects a supported Market from the browser region', () => {
    expect(marketFromBrowserLocale('nl-BE')).toBe('BE');
    expect(marketFromBrowserLocale('en-GB')).toBe('UK');
  });

  it('falls back to Belgium when the browser region is unsupported or absent', () => {
    expect(marketFromBrowserLocale('en-US')).toBe('BE');
    expect(marketFromBrowserLocale('de-DE')).toBe('BE');
    expect(marketFromBrowserLocale('en')).toBe('BE');
  });

  it('identifies browser regions that can provide an initial Market', () => {
    expect(hasSupportedMarketRegion('nl-BE')).toBe(true);
    expect(hasSupportedMarketRegion('en-GB')).toBe(true);
    expect(hasSupportedMarketRegion('en-US')).toBe(false);
  });
});
