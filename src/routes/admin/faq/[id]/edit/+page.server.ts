import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getFaqById, updateFaq, deleteFaq } from '$lib/services/faq.service';
import { updateFaqSchema } from '$lib/schemas';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const faq = await getFaqById(params.id);
    return { faq };
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
      await updateFaq(params.id, result.data);
      return { success: true };
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { question: [err.message] } });
      }
      return fail(500, { errors: { question: ['Erreur serveur'] } });
    }
  },

  delete: async ({ params }) => {
    try {
      await deleteFaq(params.id);
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { question: [err.message] } });
      }
    }
    throw redirect(303, '/admin/faq?deleted=true');
  }
};
