import type { RequestHandler } from './$types';
import { PUBLIC_APP_URL } from '$env/static/public';

export const GET: RequestHandler = () => {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /articles/
Disallow: /faq/

Sitemap: ${PUBLIC_APP_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
