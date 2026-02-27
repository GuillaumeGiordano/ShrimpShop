import type { PageServerLoad } from './$types';
import { getPublishedArticleById, getSimilarArticles } from '$lib/services/article.service';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const article = await getPublishedArticleById(params.id);
    const similar = await getSimilarArticles(article.id, article.categoryId);

    return {
      article,
      similar,
      meta: {
        title: article.title,
        description: article.excerpt,
        image: article.imageUrl ?? undefined
      }
    };
  } catch (err) {
    throwKitError(err);
  }
};
