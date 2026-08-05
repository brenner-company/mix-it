import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { publishedCatalog } from '$lib/catalog/published';

export const entries = () => publishedCatalog.map((variant) => ({ variantId: variant.id }));

export const load: PageLoad = ({ params }) => {
  const variant = publishedCatalog.find((candidate) => candidate.id === params.variantId);

  if (!variant) {
    error(404);
  }

  return { variant };
};
