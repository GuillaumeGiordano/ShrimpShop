import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '$lib/services/faq.service';
import { createFaqSchema, updateFaqSchema } from '$lib/schemas';
import { formatApiError } from '$server/errors';

export const load: PageServerLoad = async () => {
  const result = await getFaqs({ perPage: 100 });
  return { faqs: result.data };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const result = createFaqSchema.safeParse(data);
    if (!result.success) return fail(422, { success: false, errors: result.error.flatten().fieldErrors });
    try {
      await createFaq(result.data);
      return { success: true, action: 'create' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const data = Object.fromEntries(formData);
    const result = updateFaqSchema.safeParse(data);
    if (!result.success) return fail(422, { success: false, errors: result.error.flatten().fieldErrors });
    try {
      await updateFaq(id, result.data);
      return { success: true, action: 'update' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    try {
      await deleteFaq(id);
      return { success: true, action: 'delete' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  }
};
