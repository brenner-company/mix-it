import { candidateCatalog } from './data';
import { getPublishedCatalog } from './catalog';

export const publishedCatalog = getPublishedCatalog(candidateCatalog);
