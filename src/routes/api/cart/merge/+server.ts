import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mergeLocalCart } from '$services/cart.service';
import { formatApiError } from '$server/errors';
import type { LocalCartItem } from '$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Non authentifié');

  try {
    const body = await request.json();
    const localItems = (body.items ?? []) as LocalCartItem[];
    const cart = await mergeLocalCart(user.id, localItems);
    return json({ success: true, data: cart });
  } catch (err) {
    const apiErr = formatApiError(err);
    throw error(400, apiErr.error);
  }
};
