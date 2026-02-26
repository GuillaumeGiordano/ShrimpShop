import type { PageServerLoad } from './$types';
import { getPublishedArticles } from '$lib/services/article.service';
import { articleFiltersSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = articleFiltersSchema.parse(params);

  const result = await getPublishedArticles(filters);

  return {
    ...result,
    filters,
    meta: { title: 'Articles & Guides' }
  };
};
