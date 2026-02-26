import type { PrismaClient } from '@prisma/client';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
      session: Session | null;
      user: User | null;
      userRole: 'USER' | 'ADMIN' | null;
    }

    interface PageData {
      session: Session | null;
      user: User | null;
      userRole: 'USER' | 'ADMIN' | null;
    }

    interface Error {
      message: string;
      status?: number;
      code?: string;
    }

    // interface Platform {}
  }

  // Extend with Prisma global for dev hot-reload
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export {};
