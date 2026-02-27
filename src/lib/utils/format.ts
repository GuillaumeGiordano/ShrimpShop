/**
 * Formate une date en français
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

/**
 * Formate une date courte
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

/**
 * Traduit les catégories d'articles en français
 */
export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  NEOCARIDINA: 'Neocaridina',
  CARIDINA: 'Caridina',
  BREEDING: 'Élevage',
  WATER_QUALITY: 'Qualité de l\'eau',
  DISEASES: 'Maladies',
  EQUIPMENT: 'Équipement',
  FEEDING: 'Alimentation',
  GENERAL: 'Général'
};

/**
 * Traduit les catégories FAQ en français
 */
export const FAQ_CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'Général',
  SHIPPING: 'Livraison',
  CARE: 'Entretien',
  WATER_PARAMETERS: 'Paramètres d\'eau',
  COMPATIBILITY: 'Compatibilité',
  PAYMENT: 'Paiement'
};

/**
 * Traduit les rôles en français
 */
export const ROLE_LABELS: Record<string, string> = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur'
};

/**
 * Tronque un texte avec ellipse
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formate un prix en euros (fr-FR)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

/**
 * Labels des statuts de commande
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  CANCELLED: 'Annulé'
};
