import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCart, upsertCartItem, removeCartItem } from '$services/cart.service';
import { cartItemSchema } from '$schemas';
import { formatApiError } from '$server/errors';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Non authentifié');

  const cart = await getCart(user.id);
  return json({ success: true, data: cart });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Non authentifié');

  try {
    const body = await request.json();
    const parsed = cartItemSchema.parse(body);
    const cart = await upsertCartItem(user.id, parsed.productId, parsed.quantity);
    return json({ success: true, data: cart });
  } catch (err) {
    const apiErr = formatApiError(err);
    throw error(400, apiErr.error);
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw error(401, 'Non authentifié');

  try {
    const body = await request.json();
    const { productId } = body as { productId: string };
    if (!productId) throw error(400, 'productId requis');
    const cart = await removeCartItem(user.id, productId);
    return json({ success: true, data: cart });
  } catch (err) {
    const apiErr = formatApiError(err);
    throw error(400, apiErr.error);
  }
};
