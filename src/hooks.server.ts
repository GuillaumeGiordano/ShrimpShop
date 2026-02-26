import { createSupabaseServerClient } from '$server/supabase';
import { getUserBySupabaseId } from '$lib/services/user.service';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// ============================================================
// Routes protégées
// ============================================================

const PRIVATE_ROUTES = ['/articles', '/faq'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register'];

// ============================================================
// Hook 1 : Initialisation Supabase + session
// ============================================================

const supabaseHook: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event.cookies);

  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    if (!session) return { session: null, user: null };

    // Vérifie le JWT côté serveur
    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser();

    if (error || !user) {
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

// ============================================================
// Hook 2 : Chargement user + rôle depuis DB
// ============================================================

const authHook: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();

  event.locals.session = session;
  event.locals.user = user;
  event.locals.userRole = null;

  if (user) {
    const dbUser = await getUserBySupabaseId(user.id);
    event.locals.userRole = dbUser?.role ?? 'USER';
  }

  return resolve(event);
};

// ============================================================
// Hook 3 : Protection des routes (RBAC)
// ============================================================

const routeGuardHook: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const { session, userRole } = event.locals;

  // Routes admin → ADMIN uniquement
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
    if (userRole !== 'ADMIN') {
      throw redirect(303, '/');
    }
  }

  // Routes privées → authentifié requis
  if (PRIVATE_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }

  // Pages auth → redirige si déjà connecté
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      throw redirect(303, userRole === 'ADMIN' ? '/admin' : '/articles');
    }
  }

  return resolve(event);
};

// ============================================================
// Export — séquence des hooks
// ============================================================

export const handle = sequence(supabaseHook, authHook, routeGuardHook);
