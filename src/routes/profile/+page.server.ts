import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { updateNameSchema, updatePasswordSchema } from '$schemas';
import { getUserBySupabaseId, updateUserName, updateUserAvatar } from '$lib/services/user.service';
import { getOrdersByUserId } from '$lib/services/order.service';
import { uploadImage, deleteImage, extractStoragePath, StorageError } from '$server/storage';

export const load: PageServerLoad = async ({ locals }) => {
  const prismaUser = await getUserBySupabaseId(locals.user!.id);
  if (!prismaUser) throw redirect(303, '/login');

  const orders = await getOrdersByUserId(prismaUser.id);
  const isOAuth = locals.user!.app_metadata?.provider !== 'email';

  return { user: prismaUser, orders, isOAuth };
};

export const actions: Actions = {
  updateAvatar: async ({ request, locals }) => {
    const prismaUser = await getUserBySupabaseId(locals.user!.id);
    if (!prismaUser) return fail(401, { error: 'Non autorisé' });

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return fail(400, { action: 'avatar', error: 'Fichier manquant' });
    }

    try {
      const result = await uploadImage('avatars', file, prismaUser.id);

      // Supprimer l'ancienne photo uniquement si elle est dans notre bucket avatars
      if (
        prismaUser.avatarUrl &&
        prismaUser.avatarUrl.includes('/storage/v1/object/public/avatars/')
      ) {
        const oldPath = extractStoragePath(prismaUser.avatarUrl, 'avatars');
        if (oldPath) await deleteImage('avatars', oldPath).catch(() => {});
      }

      await updateUserAvatar(prismaUser.id, result.url);
      return { success: 'avatar' };
    } catch (err) {
      if (err instanceof StorageError) {
        return fail(400, { action: 'avatar', error: err.message });
      }
      return fail(500, { action: 'avatar', error: "Erreur lors de l'upload" });
    }
  },

  updateName: async ({ request, locals }) => {
    const prismaUser = await getUserBySupabaseId(locals.user!.id);
    if (!prismaUser) return fail(401, { error: 'Non autorisé' });

    const formData = await request.formData();
    const raw = { name: formData.get('name') };

    const result = updateNameSchema.safeParse(raw);
    if (!result.success) {
      return fail(400, {
        action: 'name',
        errors: result.error.flatten().fieldErrors
      });
    }

    await updateUserName(prismaUser.id, result.data.name);
    return { success: 'name' };
  },

  updatePassword: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: 'Non autorisé' });

    const formData = await request.formData();
    const raw = {
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };

    const result = updatePasswordSchema.safeParse(raw);
    if (!result.success) {
      return fail(400, {
        action: 'password',
        errors: result.error.flatten().fieldErrors
      });
    }

    const { error } = await locals.supabase.auth.updateUser({
      password: result.data.password
    });

    if (error) {
      return fail(500, { action: 'password', error: error.message });
    }

    return { success: 'password' };
  }
};
