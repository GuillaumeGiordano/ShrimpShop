import type { PageServerLoad } from './$types';
import { getPublishedArticles } from '$lib/services/article.service';
import { getProductCategories } from '$lib/services/product-category.service';
import { articleFiltersSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = articleFiltersSchema.parse(params);

  const [result, categories] = await Promise.all([
    getPublishedArticles(filters),
    getProductCategories()
  ]);

  return {
    ...result,
    filters,
    categories,
    meta: { title: 'Articles & Guides' }
  };
};
