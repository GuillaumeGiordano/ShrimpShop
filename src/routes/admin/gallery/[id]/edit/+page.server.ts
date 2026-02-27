import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPhotoById, updatePhoto, deletePhoto } from '$lib/services/photo.service';
import { getProductCategories } from '$lib/services/product-category.service';
import { updatePhotoSchema } from '$lib/schemas';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [photo, categories] = await Promise.all([
      getPhotoById(params.id),
      getProductCategories()
    ]);
    return { photo, categories };
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = updatePhotoSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        errors: result.error.flatten().fieldErrors
      });
    }

    try {
      await updatePhoto(params.id, {
        ...result.data,
        categoryId: result.data.categoryId !== undefined ? (result.data.categoryId || undefined) : undefined
      });
      return { success: true };
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { title: [err.message] } });
      }
      return fail(500, { errors: { title: ['Erreur serveur'] } });
    }
  },

  delete: async ({ params }) => {
    try {
      await deletePhoto(params.id);
    } catch (err) {
      if (err instanceof Error) {
        return fail(400, { errors: { title: [err.message] } });
      }
    }
    throw redirect(303, '/admin/gallery?deleted=true');
  }
};
