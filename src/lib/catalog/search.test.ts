import { describe, expect, it } from 'vitest';

import { candidateCatalog } from './data';
import { getPublishedCatalog } from './catalog';
import { getManufacturers, searchPublishedCatalog } from './search';

describe('catalog search', () => {
  it('matches normalized names, manufacturers, product codes, and categories', () => {
    const published = getPublishedCatalog(candidateCatalog);

    expect(searchPublishedCatalog(published, '  GOLDband  ', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, '  knauf belgium ', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, '  p131  ', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, '  gipspleister  ', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, 'P252', 'BE')).toHaveLength(0);
  });

  it('composes a manufacturer filter with search and exposes active-market manufacturers', () => {
    const published = getPublishedCatalog(candidateCatalog);
    const secondVariant = {
      ...structuredClone(published[0]),
      id: 'other-plaster-be',
      productFamilyId: 'other-plaster',
      manufacturer: 'Other Manufacturer',
      name: 'Other Plaster',
      productCode: 'P999',
      category: 'Cementpleister',
      aliases: ['plaster'],
      translations: {
        nl: { ...published[0].translations.nl, name: 'Other Plaster', category: 'Cementpleister' },
        en: { ...published[0].translations.en, name: 'Other Plaster', category: 'Cement plaster' }
      }
    };
    const variants = [published[0], secondVariant];

    expect(getManufacturers(variants, 'BE')).toEqual(['Knauf Belgium', 'Other Manufacturer']);
    expect(searchPublishedCatalog(variants, '', 'BE', 'Other Manufacturer')).toEqual([secondVariant]);
    expect(searchPublishedCatalog(variants, 'cementpleister', 'BE')).toEqual([secondVariant]);
    expect(searchPublishedCatalog(variants, 'plaster', 'BE', 'Other Manufacturer')).toEqual([secondVariant]);
    expect(searchPublishedCatalog(variants, 'goldband', 'BE', 'Other Manufacturer')).toHaveLength(0);
    expect(searchPublishedCatalog(variants, '', 'BE', 'Unknown Manufacturer')).toHaveLength(0);
  });
});
