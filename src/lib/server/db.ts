import { PrismaClient } from '@prisma/client';

// Évite les multiples instances en dev (hot-reload)
const createPrismaClient = () =>
  //Si tu veux réactiver les logs SQL (ex. pour déboguer une requête lente), tu peux remettre temporairement ['query', 'error',  'warn'].
  new PrismaClient({
    log: ['error']
  });

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}
