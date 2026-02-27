import { PrismaClient } from '@prisma/client';
import type { ArticleStatus, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

/** Retourne une date relative à aujourd'hui avec une heure fixe */
function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log('🌱 Démarrage du seeding...\n');

  // ── 1. ProductCategories ──────────────────────────────────────

  const cats = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: 'neocaridina' },
      update: {},
      create: { id: 'seed-cat-1', name: 'Neocaridina', slug: 'neocaridina', order: 1 }
    }),
    prisma.productCategory.upsert({
      where: { slug: 'caridina' },
      update: {},
      create: { id: 'seed-cat-2', name: 'Caridina', slug: 'caridina', order: 2 }
    }),
    prisma.productCategory.upsert({
      where: { slug: 'equipement' },
      update: {},
      create: { id: 'seed-cat-3', name: 'Équipement', slug: 'equipement', order: 3 }
    }),
    prisma.productCategory.upsert({
      where: { slug: 'alimentation' },
      update: {},
      create: { id: 'seed-cat-4', name: 'Alimentation', slug: 'alimentation', order: 4 }
    })
  ]);
  console.log(`✅ ${cats.length} catégories`);

  // ── 2. Users (fake supabaseId — démo uniquement, pas de connexion possible) ──

  await Promise.all([
    prisma.user.upsert({
      where: { supabaseId: 'seed-supabase-admin' },
      update: {},
      create: {
        id: 'seed-user-admin',
        supabaseId: 'seed-supabase-admin',
        name: 'Sylvain Admin',
        email: 'admin@shrimpshop.fr',
        role: 'ADMIN',
        enabled: true
      }
    }),
    prisma.user.upsert({
      where: { supabaseId: 'seed-supabase-user1' },
      update: {},
      create: {
        id: 'seed-user-1',
        supabaseId: 'seed-supabase-user1',
        name: 'Marie Dupont',
        email: 'marie.dupont@example.com',
        role: 'USER',
        enabled: true
      }
    }),
    prisma.user.upsert({
      where: { supabaseId: 'seed-supabase-user2' },
      update: {},
      create: {
        id: 'seed-user-2',
        supabaseId: 'seed-supabase-user2',
        name: 'Thomas Bernard',
        email: 'thomas.bernard@example.com',
        role: 'USER',
        enabled: true
      }
    }),
    prisma.user.upsert({
      where: { supabaseId: 'seed-supabase-user3' },
      update: {},
      create: {
        id: 'seed-user-3',
        supabaseId: 'seed-supabase-user3',
        name: 'Julie Martin',
        email: 'julie.martin@example.com',
        role: 'USER',
        enabled: true
      }
    })
  ]);
  console.log('✅ 4 utilisateurs (1 admin + 3 users)');

  // ── 3. Articles ───────────────────────────────────────────────

  const articlesData: Array<{
    id: string;
    title: string;
    excerpt: string;
    content: string;
    categoryId: string | null;
    status: ArticleStatus;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
  }> = [
    {
      id: 'seed-article-1',
      title: 'Guide complet des Neocaridina davidi',
      excerpt: 'Tout savoir sur les crevettes cerises : maintenance, élevage et variétés.',
      content:
        '<h2>Introduction</h2><p>La <em>Neocaridina davidi</em> est la crevette d\'aquarium la plus répandue. Facile à maintenir, tolérante et prolifique, elle constitue un excellent choix pour débuter.</p><h2>Paramètres optimaux</h2><p>pH : 6.8–7.5 | GH : 6–10 | KH : 2–6 | TDS : 150–250 | Température : 20–24°C</p>',
      categoryId: 'seed-cat-1',
      status: 'PUBLISHED',
      published: true,
      publishedAt: daysAgo(20),
      createdAt: daysAgo(22)
    },
    {
      id: 'seed-article-2',
      title: 'Les Bee Shrimp : Caridina cantonensis',
      excerpt: 'Plongez dans l\'univers des crevettes Bee, leurs variétés et leur élevage exigeant.',
      content:
        '<h2>Présentation</h2><p>Les <em>Caridina cantonensis</em>, communément appelées Bee Shrimp ou Taiwan Bee, sont parmi les crevettes les plus recherchées par les collectionneurs.</p>',
      categoryId: 'seed-cat-2',
      status: 'PUBLISHED',
      published: true,
      publishedAt: daysAgo(12),
      createdAt: daysAgo(14)
    },
    {
      id: 'seed-article-3',
      title: "L'osmose inverse pour crevettiers",
      excerpt: "Pourquoi et comment utiliser l'osmose inverse pour préparer l'eau de vos crevettes.",
      content:
        "<h2>L'eau osmosée</h2><p>L'osmose inverse (RO) est indispensable pour maintenir des Caridina en parfaite santé. Elle permet de partir d'une base d'eau pure (0 TDS) pour remonter exactement les paramètres souhaités.</p>",
      categoryId: 'seed-cat-2',
      status: 'PUBLISHED',
      published: true,
      publishedAt: daysAgo(6),
      createdAt: daysAgo(8)
    },
    {
      id: 'seed-article-4',
      title: 'Choisir son substrat pour crevettes',
      excerpt: 'Comparatif des substrats actifs et inertes pour aquarium à crevettes.',
      content:
        "<h2>Substrats actifs vs inertes</h2><p>Le choix du substrat influence directement la qualité de l'eau. Les substrats actifs (Amazonia, Controsoil) abaissent le pH, idéaux pour les Caridina.</p>",
      categoryId: 'seed-cat-3',
      status: 'DRAFT',
      published: false,
      publishedAt: null,
      createdAt: daysAgo(3)
    },
    {
      id: 'seed-article-5',
      title: 'Nourrir ses crevettes : guide complet',
      excerpt: 'Les meilleurs aliments pour crevettes et fréquence de nourrissage optimal.',
      content:
        "<h2>L'alimentation</h2><p>Les crevettes sont des omnivores détritivores. Un nourrissage complémentaire 3 à 4 fois par semaine suffit. Privilégiez les aliments spécialisés riches en spiruline.</p>",
      categoryId: 'seed-cat-4',
      status: 'PUBLISHED',
      published: true,
      publishedAt: daysAgo(1),
      createdAt: daysAgo(2)
    }
  ];

  for (const article of articlesData) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: article,
      create: article
    });
  }
  console.log(`✅ ${articlesData.length} articles`);

  // ── 4. Photos ─────────────────────────────────────────────────

  const photosData = [
    {
      id: 'seed-photo-1',
      title: 'Red Cherry Shrimp adulte',
      description: 'Femelle Red Cherry en pleine santé portant des œufs',
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9d4da?w=800',
      altText: 'Crevette Red Cherry rouge avec œufs',
      order: 1,
      categoryId: 'seed-cat-1'
    },
    {
      id: 'seed-photo-2',
      title: 'Crystal Red S grade',
      description: 'Crystal Red S grade sur mousse de java',
      imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
      altText: 'Crevette Crystal Red blanc et rouge',
      order: 2,
      categoryId: 'seed-cat-2'
    },
    {
      id: 'seed-photo-3',
      title: 'Aquarium nano crevettes',
      description: 'Setup nano 20L dédié Neocaridina',
      imageUrl: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800',
      altText: 'Aquarium nano aquascape crevettes',
      order: 3,
      categoryId: null
    },
    {
      id: 'seed-photo-4',
      title: 'Colonie Blue Dream',
      description: 'Colonie de Blue Dream dans leur biotope naturel reconstitué',
      imageUrl: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800',
      altText: 'Crevettes Blue Dream bleues en colonie',
      order: 4,
      categoryId: 'seed-cat-1'
    }
  ];

  for (const photo of photosData) {
    await prisma.photo.upsert({
      where: { id: photo.id },
      update: photo,
      create: photo
    });
  }
  console.log(`✅ ${photosData.length} photos`);

  // ── 5. FAQs ───────────────────────────────────────────────────

  const faqsData = [
    {
      id: 'seed-faq-1',
      question: 'Comment sont expédiées les crevettes ?',
      answer:
        'Toutes nos crevettes sont expédiées dans des sachets oxygénés avec des packs chauds en hiver. Le transport dure 24h maximum pour garantir leur bien-être.',
      order: 1,
      categoryId: null
    },
    {
      id: 'seed-faq-2',
      question: "Quels paramètres d'eau pour les Neocaridina ?",
      answer:
        "Les Neocaridina préfèrent une eau avec pH 6.5–7.5, GH 6–10, KH 2–6 et une température de 18–25°C. Elles sont plus tolérantes que les Caridina.",
      order: 2,
      categoryId: 'seed-cat-1'
    },
    {
      id: 'seed-faq-3',
      question: "Comment préparer l'eau pour les Caridina ?",
      answer:
        "Les Caridina nécessitent une eau osmosée reminéralisée avec un sel spécifique. pH 5.5–7.0, TDS 100–180 ppm.",
      order: 3,
      categoryId: 'seed-cat-2'
    },
    {
      id: 'seed-faq-4',
      question: "Quelle densité de crevettes pour mon aquarium ?",
      answer:
        "Comptez environ 5–10 crevettes par litre pour un élevage raisonnable. Un aquarium de 30L peut accueillir confortablement une colonie de 50–80 individus.",
      order: 4,
      categoryId: null
    },
    {
      id: 'seed-faq-5',
      question: "Quels modes de paiement acceptez-vous ?",
      answer:
        "Nous acceptons les paiements par carte bancaire (Visa, Mastercard) via Stripe. Paiement 100% sécurisé.",
      order: 5,
      categoryId: null
    },
    {
      id: 'seed-faq-6',
      question: "Peut-on mélanger Neocaridina et Caridina ?",
      answer:
        "Il n'est pas recommandé de les mélanger car elles ont des exigences différentes en termes de paramètres d'eau. Des hybridations non désirées peuvent également survenir.",
      order: 6,
      categoryId: null
    }
  ];

  for (const faq of faqsData) {
    await prisma.faq.upsert({
      where: { id: faq.id },
      update: faq,
      create: faq
    });
  }
  console.log(`✅ ${faqsData.length} FAQs`);

  // ── 6. Products ───────────────────────────────────────────────

  const productsData = [
    {
      id: 'seed-product-1',
      name: 'Red Cherry Shrimp x10',
      slug: 'red-cherry-shrimp-x10',
      description:
        "Lot de 10 crevettes Red Cherry (Neocaridina davidi var. red), sélection A grade. Idéales pour débutants, très adaptables et prolifiques.",
      price: 12.90,
      stock: 45,
      isActive: true,
      categoryId: 'seed-cat-1'
    },
    {
      id: 'seed-product-2',
      name: 'Blue Dream x10',
      slug: 'blue-dream-x10',
      description:
        "Lot de 10 crevettes Blue Dream (Neocaridina davidi var. blue), coloration bleue intense. Très résistantes, parfaites pour débuter.",
      price: 15.90,
      stock: 30,
      isActive: true,
      categoryId: 'seed-cat-1'
    },
    {
      id: 'seed-product-3',
      name: 'Crystal Red S grade x5',
      slug: 'crystal-red-s-grade-x5',
      description:
        "Lot de 5 Crystal Red grade S (Caridina cantonensis). Patron rouge et blanc bien défini. Élevage avancé.",
      price: 24.90,
      stock: 15,
      isActive: true,
      categoryId: 'seed-cat-2'
    },
    {
      id: 'seed-product-4',
      name: 'Taiwan Bee Black King Kong x3',
      slug: 'taiwan-bee-black-king-kong-x3',
      description:
        "Lot de 3 Taiwan Bee Black King Kong, crevettes premium à coloration noire intense. Pour aquariophiles confirmés.",
      price: 39.90,
      stock: 8,
      isActive: true,
      categoryId: 'seed-cat-2'
    },
    {
      id: 'seed-product-5',
      name: 'Nourriture Shrimp Nature Premium 30g',
      slug: 'nourriture-shrimp-nature-premium',
      description:
        "Alimentation premium pour crevettes d'eau douce. Enrichie en spiruline, calcium et vitamines. Pastilles qui ne troublent pas l'eau.",
      price: 8.90,
      stock: 100,
      isActive: true,
      categoryId: 'seed-cat-4'
    },
    {
      id: 'seed-product-6',
      name: 'Filtre intérieur nano 200L/h',
      slug: 'filtre-interieur-nano-200lh',
      description:
        "Filtre intérieur spécial nano-aquarium avec préfiltre éponge pour protéger les crevettes et les bébés. Débit réglable.",
      price: 22.50,
      stock: 20,
      isActive: true,
      categoryId: 'seed-cat-3'
    }
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }
  console.log(`✅ ${productsData.length} produits`);

  // ── 7. Orders (répartis sur 7 jours pour alimenter les graphiques) ────

  // Suppression propre des seed orders existants avant recréation
  await prisma.orderItem.deleteMany({
    where: { orderId: { startsWith: 'seed-order-' } }
  });
  await prisma.order.deleteMany({
    where: { id: { startsWith: 'seed-order-' } }
  });

  type OrderSeed = {
    id: string;
    userId: string | null;
    email: string;
    status: OrderStatus;
    total: number;
    createdAt: Date;
    items: { productId: string; quantity: number; price: number }[];
  };

  const ordersData: OrderSeed[] = [
    {
      id: 'seed-order-1',
      userId: 'seed-user-1',
      email: 'marie.dupont@example.com',
      status: 'PAID',
      total: 21.80,
      createdAt: daysAgo(6, 9),
      items: [
        { productId: 'seed-product-1', quantity: 1, price: 12.90 },
        { productId: 'seed-product-5', quantity: 1, price: 8.90 }
      ]
    },
    {
      id: 'seed-order-2',
      userId: 'seed-user-2',
      email: 'thomas.bernard@example.com',
      status: 'PAID',
      total: 39.90,
      createdAt: daysAgo(5, 14),
      items: [{ productId: 'seed-product-4', quantity: 1, price: 39.90 }]
    },
    {
      id: 'seed-order-3',
      userId: null,
      email: 'invite@example.com',
      status: 'PAID',
      total: 31.80,
      createdAt: daysAgo(4, 11),
      items: [{ productId: 'seed-product-2', quantity: 2, price: 15.90 }]
    },
    {
      id: 'seed-order-4',
      userId: 'seed-user-3',
      email: 'julie.martin@example.com',
      status: 'CANCELLED',
      total: 24.90,
      createdAt: daysAgo(4, 16),
      items: [{ productId: 'seed-product-3', quantity: 1, price: 24.90 }]
    },
    {
      id: 'seed-order-5',
      userId: 'seed-user-2',
      email: 'thomas.bernard@example.com',
      status: 'PAID',
      total: 40.30,
      createdAt: daysAgo(2, 10),
      items: [
        { productId: 'seed-product-6', quantity: 1, price: 22.50 },
        { productId: 'seed-product-5', quantity: 2, price: 8.90 }
      ]
    },
    {
      id: 'seed-order-6',
      userId: null,
      email: 'client@example.com',
      status: 'PAID',
      total: 65.70,
      createdAt: daysAgo(1, 13),
      items: [
        { productId: 'seed-product-1', quantity: 2, price: 12.90 },
        { productId: 'seed-product-4', quantity: 1, price: 39.90 }
      ]
    },
    {
      id: 'seed-order-7',
      userId: 'seed-user-1',
      email: 'marie.dupont@example.com',
      status: 'PENDING',
      total: 47.30,
      createdAt: daysAgo(0, 8),
      items: [
        { productId: 'seed-product-2', quantity: 1, price: 15.90 },
        { productId: 'seed-product-5', quantity: 1, price: 8.90 },
        { productId: 'seed-product-6', quantity: 1, price: 22.50 }
      ]
    },
    {
      id: 'seed-order-8',
      userId: 'seed-user-3',
      email: 'julie.martin@example.com',
      status: 'PENDING',
      total: 24.90,
      createdAt: daysAgo(0, 15),
      items: [{ productId: 'seed-product-3', quantity: 1, price: 24.90 }]
    }
  ];

  for (const order of ordersData) {
    const { items, ...orderData } = order;
    await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item, i) => ({
            id: `${order.id}-item-${i}`,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
  }
  console.log(`✅ ${ordersData.length} commandes`);

  // ── 8. Cart (panier en cours pour un utilisateur) ─────────────

  await prisma.cartItem.deleteMany({ where: { cartId: 'seed-cart-1' } });
  await prisma.cart.deleteMany({ where: { id: 'seed-cart-1' } });

  await prisma.cart.create({
    data: {
      id: 'seed-cart-1',
      userId: 'seed-user-2',
      items: {
        create: [
          { id: 'seed-cart-item-1', productId: 'seed-product-1', quantity: 2 },
          { id: 'seed-cart-item-2', productId: 'seed-product-5', quantity: 1 }
        ]
      }
    }
  });
  console.log('✅ 1 panier (Thomas Bernard)');

  // ── Résumé ────────────────────────────────────────────────────

  const paidTotal = ordersData
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  console.log('\n🎉 Seeding terminé avec succès !');
  console.log('─'.repeat(40));
  console.log(`  Catégories     : ${cats.length}`);
  console.log('  Utilisateurs   : 4 (1 ADMIN + 3 USER)');
  console.log(`  Articles       : ${articlesData.length} (4 publiés, 1 brouillon)`);
  console.log(`  Photos         : ${photosData.length}`);
  console.log(`  FAQs           : ${faqsData.length}`);
  console.log(`  Produits       : ${productsData.length}`);
  console.log(
    `  Commandes      : ${ordersData.length} (5 PAID, 1 CANCELLED, 2 PENDING)`
  );
  console.log(
    `  CA simulé      : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(paidTotal)}`
  );
  console.log('─'.repeat(40));
  console.log(
    '\n⚠️  Les utilisateurs seed ne peuvent pas se connecter (fake supabaseId).'
  );
  console.log(
    "   Ils sont visibles dans l'admin et liés aux commandes/paniers.\n"
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding échoué :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
