import rawPublishedCatalog from './published-data.json';
import { getPublishedCatalog } from './catalog';

export const publishedCatalog = getPublishedCatalog(rawPublishedCatalog);
