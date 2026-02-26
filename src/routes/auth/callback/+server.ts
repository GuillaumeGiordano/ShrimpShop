import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertUser } from '$lib/services/user.service';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const redirectTo = url.searchParams.get('redirectTo') ?? '/articles';

  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Synchronise l'utilisateur dans notre DB Prisma
      const name =
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        data.user.email?.split('@')[0] ??
        'Utilisateur';

      await upsertUser({
        supabaseId: data.user.id,
        name,
        email: data.user.email!,
        avatarUrl: data.user.user_metadata?.avatar_url
      });
    }
  }

  throw redirect(303, redirectTo);
};
