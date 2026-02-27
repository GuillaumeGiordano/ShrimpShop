import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createArticle } from '$lib/services/article.service';
import { getProductCategories } from '$lib/services/product-category.service';
import { createArticleSchema } from '$lib/schemas';
import { sanitizeHtml } from '$lib/utils/sanitize';

export const load: PageServerLoad = async () => {
  const categories = await getProductCategories();
  return { categories, meta: { title: 'Nouvel article' } };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = createArticleSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors,
        values: data
      });
    }

    const article = await createArticle({
      ...result.data,
      content: sanitizeHtml(result.data.content),
      categoryId: result.data.categoryId || undefined,
      imageUrl: result.data.imageUrl || undefined
    });

    throw redirect(303, `/admin/articles/${article.id}/edit?created=true`);
  }
};
