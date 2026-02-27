import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  return {
    redirectTo: url.searchParams.get('redirectTo') ?? '/articles',
    error: url.searchParams.get('error'),
    meta: { title: 'Connexion' }
  };
};

export const actions: Actions = {
  login: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const redirectTo = (formData.get('redirectTo') as string) ?? '/articles';

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors
      });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password
    });

    if (error) {
      return fail(400, {
        success: false,
        errors: { email: ['Email ou mot de passe incorrect'] }
      });
    }

    throw redirect(303, redirectTo);
  },

  googleLogin: async ({ locals, url }) => {
    const redirectTo = url.searchParams.get('redirectTo') ?? '/articles';
    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
      }
    });

    if (error || !data.url) {
      return fail(500, { success: false, errors: { email: ['Erreur OAuth Google'] } });
    }

    throw redirect(303, data.url);
  }
};
