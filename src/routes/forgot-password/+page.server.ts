import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { forgotPasswordSchema } from '$schemas';
import { PUBLIC_APP_URL } from '$env/static/public';

export const load: PageServerLoad = async () => {
  return { sent: false };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const raw = { email: formData.get('email') };

    const result = forgotPasswordSchema.safeParse(raw);
    if (!result.success) {
      return fail(400, {
        sent: false,
        errors: result.error.flatten().fieldErrors
      });
    }

    // Ne jamais révéler si l'email existe ou non
    await locals.supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${PUBLIC_APP_URL}/auth/callback?next=/reset-password`
    });

    return { sent: true };
  }
};
