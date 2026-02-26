import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createFaq } from '$lib/services/faq.service';
import { createFaqSchema } from '$lib/schemas';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = createFaqSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        errors: result.error.flatten().fieldErrors,
        values: data
      });
    }

    await createFaq(result.data);
    throw redirect(303, '/admin/faq?created=true');
  }
};
