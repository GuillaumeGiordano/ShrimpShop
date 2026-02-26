import type { PageServerLoad } from './$types';
import { db } from '$server/db';

export const load: PageServerLoad = async () => {
  const [totalUsers, totalArticles, totalPhotos, totalFaqs] = await Promise.all([
    db.user.count(),
    db.article.count(),
    db.photo.count(),
    db.faq.count()
  ]);

  const publishedArticles = await db.article.count({ where: { published: true } });
  const draftArticles = await db.article.count({ where: { published: false } });

  return {
    stats: {
      totalUsers,
      totalArticles,
      totalPhotos,
      totalFaqs,
      publishedArticles,
      draftArticles
    }
  };
};
