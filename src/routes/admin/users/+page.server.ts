import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getUsers, updateUserRole, updateUserEnabled, deleteUser } from '$lib/services/user.service';
import { userFiltersSchema, updateUserRoleSchema, updateUserEnabledSchema } from '$lib/schemas';
import { formatApiError } from '$server/errors';

export const load: PageServerLoad = async ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filters = userFiltersSchema.parse(params);
  const result = await getUsers(filters);
  return { ...result, filters };
};

export const actions: Actions = {
  updateRole: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const result = updateUserRoleSchema.safeParse({ role: formData.get('role') });

    if (!result.success) {
      return fail(422, { success: false, error: 'Rôle invalide' });
    }

    try {
      await updateUserRole(id, result.data.role);
      return { success: true };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  updateEnabled: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const result = updateUserEnabledSchema.safeParse({ enabled: formData.get('enabled') });

    if (!result.success) {
      return fail(422, { success: false, error: 'Valeur invalide' });
    }

    try {
      await updateUserEnabled(id, result.data.enabled);
      return { success: true };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      await deleteUser(id);
      return { success: true };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  }
};
