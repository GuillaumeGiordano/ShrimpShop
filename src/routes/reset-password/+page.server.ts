import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { updatePasswordSchema } from '$schemas';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    throw redirect(303, '/forgot-password');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) {
      throw redirect(303, '/forgot-password');
    }

    const formData = await request.formData();
    const raw = {
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };

    const result = updatePasswordSchema.safeParse(raw);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors
      });
    }

    const { error } = await locals.supabase.auth.updateUser({
      password: result.data.password
    });

    if (error) {
      return fail(500, { error: error.message });
    }

    throw redirect(303, '/profile');
  }
};
