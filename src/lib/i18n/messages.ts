import { m } from '../../paraglide/messages.js';

import type { Language } from '../catalog/catalog';

export function getMessages(language: Language) {
  const locale = language === 'nl' ? 'nl' : 'en';

  return {
    appDescription: m.app_description(undefined, { locale }),
    productDescription: (name: string) => m.product_description({ name }, { locale }),
    primaryNavigation: m.primary_navigation(undefined, { locale }),
    homeAriaLabel: m.home_aria_label(undefined, { locale }),
    footerNote: m.footer_note(undefined, { locale }),
    marketVariantCount: (count: number) => m.market_variant_count({ count }, { locale }),
    languageLabel: m.language_label(undefined, { locale }),
    marketLabel: m.market_label(undefined, { locale }),
    marketBelgium: m.market_belgium(undefined, { locale }),
    homeEyebrow: m.home_eyebrow(undefined, { locale }),
    homeTitle: m.home_title(undefined, { locale }),
    homeIntro: m.home_intro(undefined, { locale }),
    catalogTitle: m.catalog_title(undefined, { locale }),
    searchLabel: m.search_label(undefined, { locale }),
    searchPlaceholder: m.search_placeholder(undefined, { locale }),
    openCalculator: m.open_calculator(undefined, { locale }),
    productFamily: m.product_family(undefined, { locale }),
    productCode: m.product_code(undefined, { locale }),
    sourceDocument: m.source_document(undefined, { locale }),
    calculatorEyebrow: m.calculator_eyebrow(undefined, { locale }),
    calculatorTitle: m.calculator_title(undefined, { locale }),
    calculatorIntro: m.calculator_intro(undefined, { locale }),
    powderLabel: m.powder_label(undefined, { locale }),
    powderHint: m.powder_hint(undefined, { locale }),
    calculate: m.calculate(undefined, { locale }),
    invalidPowder: m.invalid_powder(undefined, { locale }),
    resultTitle: m.result_title(undefined, { locale }),
    enteredPowder: m.entered_powder(undefined, { locale }),
    mixingInstructions: m.mixing_instructions(undefined, { locale }),
    mixingTime: m.mixing_time(undefined, { locale }),
    workingTime: m.working_time(undefined, { locale }),
    disclaimer: m.disclaimer(undefined, { locale }),
    lastReviewed: m.last_reviewed(undefined, { locale }),
    backToCatalog: m.back_to_catalog(undefined, { locale }),
    reviewNote: m.review_note(undefined, { locale }),
    noResults: m.no_results(undefined, { locale })
  };
}

export type Messages = ReturnType<typeof getMessages>;
