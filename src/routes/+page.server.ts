import type { PageServerLoad, Actions } from './$types';
import { getPhotos } from '$lib/services/photo.service';
import { getPublishedArticles } from '$lib/services/article.service';
import { createContactMessage } from '$lib/services/user.service';
import { contactSchema } from '$lib/schemas';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const [photos, articlesResult] = await Promise.all([
    getPhotos(3),
    getPublishedArticles({ perPage: 3 })
  ]);

  return {
    photos,
    articles: articlesResult.data,
    meta: {
      title: 'ShrimpShop — Crevettes d\'aquarium de qualité',
      description:
        'Spécialiste des crevettes d\'aquarium : Neocaridina, Caridina et variétés rares. Livraison sécurisée 24h pour particuliers et éleveurs.'
    }
  };
};

export const actions: Actions = {
  contact: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = contactSchema.safeParse(data);
    if (!result.success) {
      return fail(422, {
        success: false,
        errors: result.error.flatten().fieldErrors
      });
    }

    try {
      await createContactMessage(result.data);
      return { success: true };
    } catch {
      return fail(500, { success: false, errors: { message: ['Erreur lors de l\'envoi'] } });
    }
  }
};
