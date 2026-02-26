import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { PUBLIC_APP_URL } from '$env/static/public';

export const GET: RequestHandler = async () => {
  const articles = await db.article.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true }
  });

  const staticRoutes = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/login', priority: '0.3', changefreq: 'monthly' },
    { url: '/register', priority: '0.3', changefreq: 'monthly' }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${PUBLIC_APP_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};
