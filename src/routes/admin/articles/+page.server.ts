import type { PageServerLoad, Actions } from './$types';
import { getAllArticles, deleteArticle } from '$lib/services/article.service';
import { articleFiltersSchema } from '$lib/schemas';
import { fail } from '@sveltejs/kit';
import { formatApiError } from '$server/errors';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = articleFiltersSchema.parse({ ...params, perPage: 10 });
  const result = await getAllArticles(filters);
  return { ...result, filters };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      await deleteArticle(id);
      return { success: true };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  }
};
