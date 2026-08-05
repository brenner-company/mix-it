import { browser } from '$app/environment';

import type { Language, Market } from './catalog/catalog';

const LANGUAGE_KEY = 'mix-it-language';
const MARKET_KEY = 'mix-it-market';

export function readLanguage(fallback: Language = 'nl'): Language {
  if (!browser) return fallback;
  const stored = localStorage.getItem(LANGUAGE_KEY);
  const language = stored === 'en' || stored === 'nl' ? stored : fallback;
  setDocumentLanguage(language);
  return language;
}

export function readMarket(fallback: Market = 'BE'): Market {
  if (!browser) return fallback;
  return localStorage.getItem(MARKET_KEY) === 'BE' ? 'BE' : fallback;
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

export function selectLanguage(event: Event): Language {
  const language = (event.currentTarget as HTMLSelectElement).value as Language;
  saveLanguage(language);
  return language;
}

export function selectMarket(event: Event): Market {
  const market = (event.currentTarget as HTMLSelectElement).value as Market;
  saveMarket(market);
  return market;
}
