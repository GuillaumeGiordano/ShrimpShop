import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertUser } from '$lib/services/user.service';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const redirectTo = next ?? url.searchParams.get('redirectTo') ?? '/articles';

  if (!code) {
    throw redirect(303, '/login?error=missing_code');
  }

  const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    // Code expiré, déjà utilisé, ou vérificateur PKCE manquant
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message);
    throw redirect(303, `/login?error=verification_failed`);
  }

  // Synchronise l'utilisateur dans notre DB Prisma
  try {
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
  } catch (e) {
    console.error('[auth/callback] upsertUser error:', e);
    // La session est établie même si la sync DB échoue — on continue
  }

  throw redirect(303, redirectTo);
};
