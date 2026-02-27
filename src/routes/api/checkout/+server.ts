import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStripe } from '$server/stripe';
import { db } from '$server/db';
import { checkoutSchema } from '$schemas';
import { formatApiError, ValidationError } from '$server/errors';
import { PUBLIC_APP_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession();

  try {
    const body = await request.json();
    const parsed = checkoutSchema.parse(body);

    // Récupérer les produits depuis la DB (JAMAIS faire confiance aux prix client)
    const productIds = parsed.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true }
    });

    // Vérifier que tous les produits existent et ont assez de stock
    const lineItems = [];
    for (const item of parsed.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new ValidationError(`Produit introuvable : ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Stock insuffisant pour "${product.name}"`);
      }
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100) // centimes
        },
        quantity: item.quantity
      });
    }

    const customerEmail = user?.email ?? parsed.email;

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: customerEmail,
      metadata: {
        userId: user?.id ?? '',
        items: JSON.stringify(parsed.items)
      }
    });

    return json({ success: true, data: { sessionUrl: session.url } });
  } catch (err) {
    const apiErr = formatApiError(err);
    const statusCode = err instanceof ValidationError ? 422 : 400;
    throw error(statusCode, apiErr.error);
  }
};
