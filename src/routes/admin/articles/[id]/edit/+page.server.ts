import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getArticleById, updateArticle } from '$lib/services/article.service';
import { updateArticleSchema } from '$lib/schemas';
import { sanitizeHtml } from '$lib/utils/sanitize';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params, url }) => {
  try {
    const article = await getArticleById(params.id);
    return {
      article,
      created: url.searchParams.get('created') === 'true'
    };
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = updateArticleSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors
      });
    }

    try {
      await updateArticle(params.id, {
        ...result.data,
        content: result.data.content ? sanitizeHtml(result.data.content) : undefined,
        imageUrl: result.data.imageUrl || undefined
      });
      return { success: true };
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { success: false, errors: { title: [err.message] } });
      }
      return fail(500, { success: false, errors: { title: ['Erreur serveur'] } });
    }
  }
};
