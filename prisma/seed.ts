import { PrismaClient, ArticleCategory, FaqCategory, ArticleStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed FAQ
  const faqs = [
    {
      category: FaqCategory.SHIPPING,
      question: 'Comment sont expédiées les crevettes ?',
      answer:
        'Toutes nos crevettes sont expédiées dans des sachets oxygénés avec des packs chauds en hiver. Le transport dure 24h maximum pour garantir leur bien-être.',
      order: 1
    },
    {
      category: FaqCategory.CARE,
      question: 'Quels paramètres d\'eau pour les Neocaridina ?',
      answer:
        'Les Neocaridina préfèrent une eau avec pH 6.5-7.5, GH 6-10, KH 2-6 et une température de 18-25°C. Elles sont plus tolérantes que les Caridina.',
      order: 2
    },
    {
      category: FaqCategory.WATER_PARAMETERS,
      question: 'Comment préparer l\'eau pour les Caridina ?',
      answer:
        'Les Caridina nécessitent une eau osmosée reminéralisée avec un sel spécifique (ex: Salty Shrimp Bee Salt). pH 5.5-7.0, TDS 100-180 ppm.',
      order: 3
    },
    {
      category: FaqCategory.GENERAL,
      question: 'Quelle densité de crevettes pour mon aquarium ?',
      answer:
        'Comptez environ 5-10 crevettes par litre pour un élevage raisonnable. Un aquarium de 30L peut accueillir confortablement une colonie de 50-80 individus.',
      order: 4
    },
    {
      category: FaqCategory.PAYMENT,
      question: 'Quels modes de paiement acceptez-vous ?',
      answer:
        'Nous acceptons les paiements par carte bancaire (Visa, Mastercard), PayPal et virement bancaire. Paiement 100% sécurisé.',
      order: 5
    },
    {
      category: FaqCategory.COMPATIBILITY,
      question: 'Peut-on mélanger Neocaridina et Caridina ?',
      answer:
        'Il n\'est pas recommandé de mélanger ces deux espèces car elles ont des exigences différentes en termes de paramètres d\'eau. De plus, des hybridations non désirées peuvent survenir.',
      order: 6
    }
  ];

  for (const faq of faqs) {
    await prisma.faq.upsert({
      where: { id: `seed-faq-${faq.order}` },
      update: faq,
      create: { id: `seed-faq-${faq.order}`, ...faq }
    });
  }

  // Seed Articles
  const articles = [
    {
      id: 'seed-article-1',
      title: 'Guide complet des Neocaridina davidi',
      excerpt: 'Tout savoir sur les crevettes cerises : maintenance, élevage et variétés.',
      content:
        '<h2>Introduction</h2><p>La <em>Neocaridina davidi</em> est sans doute la crevette d\'aquarium la plus répandue en aquariophilie. Facile à maintenir, tolérante et prolique, elle constitue un excellent choix pour débuter.</p><h2>Paramètres optimaux</h2><p>pH : 6.8 - 7.5 | GH : 6-10 | KH : 2-6 | TDS : 150-250 | Température : 20-24°C</p>',
      category: ArticleCategory.NEOCARIDINA,
      status: ArticleStatus.PUBLISHED,
      published: true,
      publishedAt: new Date()
    },
    {
      id: 'seed-article-2',
      title: 'Les Bee Shrimp : Caridina cantonensis',
      excerpt: 'Plongez dans l\'univers des crevettes Bee, leurs variétés et leur élevage exigeant.',
      content:
        '<h2>Présentation</h2><p>Les <em>Caridina cantonensis</em>, communément appelées Bee Shrimp ou Taiwan Bee, sont parmi les crevettes les plus recherchées par les collectionneurs.</p>',
      category: ArticleCategory.CARIDINA,
      status: ArticleStatus.PUBLISHED,
      published: true,
      publishedAt: new Date()
    },
    {
      id: 'seed-article-3',
      title: 'L\'osmose inverse pour crevettiers',
      excerpt: 'Pourquoi et comment utiliser l\'osmose inverse pour préparer l\'eau de vos crevettes.',
      content:
        '<h2>L\'eau osmosée</h2><p>L\'osmose inverse (RO) est indispensable pour maintenir des Caridina en parfaite santé. Elle permet de partir d\'une base d\'eau pure (0 TDS) pour remonter exactement les paramètres souhaités.</p>',
      category: ArticleCategory.WATER_QUALITY,
      status: ArticleStatus.PUBLISHED,
      published: true,
      publishedAt: new Date()
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: { ...article },
      create: { ...article }
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
