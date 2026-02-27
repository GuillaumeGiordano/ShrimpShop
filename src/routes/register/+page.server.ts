import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerSchema } from '$lib/schemas';

export const load: PageServerLoad = async () => {
  return { meta: { title: 'Inscription' } };
};

export const actions: Actions = {
  register: async ({ request, locals, url }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = registerSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>
      });
    }

    const { data: signUpData, error } = await locals.supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { name: result.data.name },
        emailRedirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error) {
      return fail(400, {
        success: false,
        errors: { email: [error.message] } as Record<string, string[] | undefined>
      });
    }

    // Si la confirmation email est désactivée dans Supabase, l'utilisateur
    // est immédiatement authentifié — on le redirige directement
    if (signUpData.session) {
      throw redirect(303, '/articles');
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
