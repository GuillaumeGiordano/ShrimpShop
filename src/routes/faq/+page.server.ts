import type { PageServerLoad } from './$types';
import { getFaqs } from '$lib/services/faq.service';
import { faqFiltersSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = faqFiltersSchema.parse(params);
  const result = await getFaqs(filters);

  return {
    faqs: result.data,
    total: result.total,
    filters,
    meta: { title: 'FAQ' }
  };
};
