import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerSchema } from '$lib/schemas';
import { PUBLIC_APP_URL } from '$env/static/public';

export const load: PageServerLoad = async () => {
  return { meta: { title: 'Inscription' } };
};

export const actions: Actions = {
  register: async ({ request, locals }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = registerSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors
      });
    }

    const { error } = await locals.supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { name: result.data.name },
        emailRedirectTo: `${PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) {
      return fail(400, {
        success: false,
        errors: { email: [error.message] }
      });
    }

    return {
      success: true,
      message: 'Vérifiez votre email pour confirmer votre inscription.'
    };
  },

  googleRegister: async ({ locals, url }) => {
    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error || !data.url) {
      return fail(500, { success: false, errors: { email: ['Erreur OAuth Google'] } });
    }

    throw redirect(303, data.url);
  }
};
