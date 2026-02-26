import type { LayoutServerLoad } from './$types';

// Protection déjà assurée par hooks.server.ts
// Ce layout injecte juste les données communes à toutes les pages admin
export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    adminUser: {
      email: locals.user?.email ?? '',
      role: locals.userRole
    }
  };
};
