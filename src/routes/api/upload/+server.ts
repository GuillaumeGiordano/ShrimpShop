import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadImage, StorageError } from '$server/storage';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Vérification auth
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Non authentifié');

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) ?? 'articles';

  if (!file || !(file instanceof File)) {
    throw error(400, 'Fichier manquant');
  }

  if (!['articles', 'gallery', 'products'].includes(bucket)) {
    throw error(400, 'Bucket invalide');
  }

  try {
    const result = await uploadImage(bucket, file);
    return json({ success: true, url: result.url, path: result.path });
  } catch (err) {
    if (err instanceof StorageError) {
      throw error(400, err.message);
    }
    throw error(500, 'Erreur lors de l\'upload');
  }
};
