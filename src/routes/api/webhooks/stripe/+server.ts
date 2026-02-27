import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$server/stripe';
import { createOrder } from '$services/order.service';
import { clearCart } from '$services/cart.service';
import { db } from '$server/db';
import { env } from '$env/dynamic/private';
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET ?? '';

export const POST: RequestHandler = async ({ request }) => {
  // Lire le corps brut AVANT tout parsing
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) throw error(400, 'Signature Stripe manquante');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw error(400, 'Signature invalide');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const metadata = session.metadata ?? {};
      const userId = metadata.userId || null;
      const itemsRaw = metadata.items ? JSON.parse(metadata.items) : [];
      const email = session.customer_email ?? session.customer_details?.email ?? '';

      if (!email) {
        console.error('No email in Stripe session:', session.id);
        return json({ received: true });
      }

      // Récupérer les prix DB pour créer la commande
      const productIds = itemsRaw.map((i: { productId: string }) => i.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds } }
      });

      const orderItems = itemsRaw.map((item: { productId: string; quantity: number }) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price ?? 0
        };
      });

      const total = orderItems.reduce(
        (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
        0
      );

      await createOrder({
        userId: userId || null,
        email,
        items: orderItems,
        stripeId: session.payment_intent as string | null,
        total
      });

      if (userId) {
        await clearCart(userId);
      }
    } catch (err) {
      console.error('Error processing Stripe webhook:', err);
      // Ne pas retourner d'erreur 5xx pour éviter que Stripe rejoue
    }
  }

  // Toujours retourner 200 pour accuser réception
  return json({ received: true });
};
