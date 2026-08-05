import { describe, expect, it } from 'vitest';

import { candidateCatalog } from './data';
import { getPublishedCatalog } from './catalog';
import { searchPublishedCatalog } from './search';

describe('catalog search', () => {
  it('searches the published catalog by alias and product code', () => {
    const published = getPublishedCatalog(candidateCatalog);

    expect(searchPublishedCatalog(published, 'goldband', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, 'P131', 'BE')).toHaveLength(1);
    expect(searchPublishedCatalog(published, 'P252', 'BE')).toHaveLength(0);
  });
});
