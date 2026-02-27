import type { PageServerLoad } from './$types';
import { db } from '$server/db';

const DAY_LABELS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

export const load: PageServerLoad = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalArticles,
    totalPhotos,
    totalFaqs,
    totalProducts,
    totalOrders,
    publishedArticles,
    draftArticles,
    pendingOrders,
    recentPaidOrders,
    orderStatusGroups
  ] = await Promise.all([
    db.user.count(),
    db.article.count(),
    db.photo.count(),
    db.faq.count(),
    db.product.count(),
    db.order.count(),
    db.article.count({ where: { published: true } }),
    db.article.count({ where: { published: false } }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.findMany({
      where: { status: 'PAID', createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true }
    }),
    db.order.groupBy({ by: ['status'], _count: { id: true } })
  ]);

  // Revenus par jour sur les 7 derniers jours
  const revenueChart = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const revenue = recentPaidOrders
      .filter((o) => {
        const od = o.createdAt;
        return od.getFullYear() === y && od.getMonth() === m && od.getDate() === d;
      })
      .reduce((sum, o) => sum + o.total, 0);
    return { label: DAY_LABELS[date.getDay()], revenue };
  });

  // Répartition commandes par statut
  const statusMap = Object.fromEntries(orderStatusGroups.map((g) => [g.status, g._count.id]));
  const orderStatusChart = {
    PENDING: statusMap['PENDING'] ?? 0,
    PAID: statusMap['PAID'] ?? 0,
    CANCELLED: statusMap['CANCELLED'] ?? 0
  };

  // Chiffre d'affaires total (commandes payées)
  const revenueResult = await db.order.aggregate({
    where: { status: 'PAID' },
    _sum: { total: true }
  });
  const totalRevenue = revenueResult._sum.total ?? 0;

  return {
    stats: {
      totalUsers,
      totalArticles,
      totalPhotos,
      totalFaqs,
      totalProducts,
      totalOrders,
      publishedArticles,
      draftArticles,
      pendingOrders,
      totalRevenue
    },
    charts: {
      revenue: revenueChart,
      orderStatus: orderStatusChart
    }
  };
};
