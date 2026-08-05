import rawCatalog from './data.json';
import { validateCatalog } from './catalog';

export const candidateCatalog = validateCatalog(rawCatalog);
