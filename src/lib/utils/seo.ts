import type { SEOMeta } from '$types';
import { PUBLIC_APP_URL, PUBLIC_APP_NAME } from '$env/static/public';

const DEFAULT_DESCRIPTION =
  'ShrimpShop — Crevettes d\'aquarium de qualité : Neocaridina, Caridina et variétés rares. Livraison sécurisée pour particuliers et professionnels.';

export function buildMeta(meta: Partial<SEOMeta>): SEOMeta {
  return {
    title: meta.title ? `${meta.title} | ${PUBLIC_APP_NAME}` : PUBLIC_APP_NAME,
    description: meta.description ?? DEFAULT_DESCRIPTION,
    image: meta.image ?? `${PUBLIC_APP_URL}/og-default.jpg`,
    url: meta.url ?? PUBLIC_APP_URL,
    type: meta.type ?? 'website',
    noindex: meta.noindex ?? false
  };
}

export function buildArticleMeta(article: {
  title: string;
  excerpt: string;
  imageUrl: string | null;
  id: string;
}): SEOMeta {
  return buildMeta({
    title: article.title,
    description: article.excerpt,
    image: article.imageUrl ?? undefined,
    url: `${PUBLIC_APP_URL}/articles/${article.id}`,
    type: 'article'
  });
}
