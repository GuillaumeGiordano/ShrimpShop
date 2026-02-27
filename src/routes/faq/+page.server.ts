import type { PageServerLoad } from './$types';
import { getFaqs } from '$lib/services/faq.service';
import { getProductCategories } from '$lib/services/product-category.service';
import { faqFiltersSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = faqFiltersSchema.parse(params);
  const [result, categories] = await Promise.all([
    getFaqs(filters),
    getProductCategories()
  ]);

  return {
    faqs: result.data,
    total: result.total,
    filters,
    categories,
    meta: { title: 'FAQ' }
  };
};
