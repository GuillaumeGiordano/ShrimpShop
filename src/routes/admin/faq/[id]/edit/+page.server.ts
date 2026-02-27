import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getFaqById, updateFaq, deleteFaq } from '$lib/services/faq.service';
import { getProductCategories } from '$lib/services/product-category.service';
import { updateFaqSchema } from '$lib/schemas';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [faq, categories] = await Promise.all([
      getFaqById(params.id),
      getProductCategories()
    ]);
    return { faq, categories };
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = updateFaqSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        errors: result.error.flatten().fieldErrors
      });
    }

    try {
      await updateFaq(params.id, {
        ...result.data,
        categoryId: result.data.categoryId !== undefined ? (result.data.categoryId || undefined) : undefined
      });
      return { success: true };
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { question: [err.message] } as Record<string, string[]> });
      }
      return fail(500, { errors: { question: ['Erreur serveur'] } as Record<string, string[]> });
    }
  },

  delete: async ({ params }) => {
    try {
      await deleteFaq(params.id);
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { question: [err.message] } as Record<string, string[]> });
      }
    }
    throw redirect(303, '/admin/faq?deleted=true');
  }
};
