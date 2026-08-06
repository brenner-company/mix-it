import { browser } from '$app/environment';

import type { Language, Market } from './catalog/catalog';

const LANGUAGE_KEY = 'mix-it-language';
const MARKET_KEY = 'mix-it-market';
const DEFAULT_MARKET: Market = 'BE';

export function marketFromBrowserLocale(locale: string): Market {
  const region = locale.replace('_', '-').split('-').at(-1)?.toUpperCase();

  return region === 'GB' ? 'UK' : DEFAULT_MARKET;
}

export function hasSupportedMarketRegion(locale: string): boolean {
  const region = locale.replace('_', '-').split('-').at(-1)?.toUpperCase();

  return region === 'BE' || region === 'GB';
}

export function readLanguage(fallback: Language = 'nl'): Language {
  if (!browser) return fallback;
  const stored = localStorage.getItem(LANGUAGE_KEY);
  const language = stored === 'en' || stored === 'nl' ? stored : fallback;
  setDocumentLanguage(language);
  return language;
}

export function readMarket(fallback?: Market): Market {
  if (!browser) return fallback ?? DEFAULT_MARKET;

  const defaultMarket = fallback ?? marketFromBrowserLocale(navigator.language);
  return readStoredMarket() ?? defaultMarket;
}

export function readStoredMarket(): Market | null {
  if (!browser) return null;

  const stored = localStorage.getItem(MARKET_KEY);

  return stored === 'BE' || stored === 'UK' ? stored : null;
}

export function saveLanguage(language: Language): void {
  if (browser) {
    localStorage.setItem(LANGUAGE_KEY, language);
    setDocumentLanguage(language);
  }
}

export function saveMarket(market: Market): void {
  if (browser) localStorage.setItem(MARKET_KEY, market);
}

export function setDocumentLanguage(language: Language): void {
  if (browser) document.documentElement.lang = language === 'nl' ? 'nl-BE' : 'en';
}

export function selectLanguage(language: Language): Language {
  saveLanguage(language);
  return language;
}

export function selectMarket(market: Market): Market {
  saveMarket(market);
  return market;
}
