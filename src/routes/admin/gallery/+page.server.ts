import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getPhotos, createPhoto, updatePhoto, deletePhoto } from '$lib/services/photo.service';
import { createPhotoSchema } from '$lib/schemas';
import { formatApiError } from '$server/errors';

export const load: PageServerLoad = async () => {
  const photos = await getPhotos();
  return { photos };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = createPhotoSchema.safeParse(data);
    if (!result.success) {
      return fail(422, { success: false, errors: result.error.flatten().fieldErrors });
    }

    try {
      await createPhoto(result.data);
      return { success: true, action: 'create' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      await deletePhoto(id);
      return { success: true, action: 'delete' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  },

  updateOrder: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const order = parseInt(formData.get('order') as string);

    try {
      await updatePhoto(id, { order });
      return { success: true, action: 'order' };
    } catch (err) {
      return fail(400, formatApiError(err));
    }
  }
};
