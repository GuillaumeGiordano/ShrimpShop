import { error, type NumericRange } from '@sveltejs/kit';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} introuvable`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non authentifié') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message, 'VALIDATION_ERROR');
  }
}

/**
 * Convertit une AppError en erreur SvelteKit (pour les load functions)
 */
export function throwKitError(err: unknown): never {
  if (err instanceof AppError) {
    throw error(err.statusCode as NumericRange<400, 599>, err.message);
  }
  console.error('Unexpected error:', err);
  throw error(500, 'Erreur interne du serveur');
}

/**
 * Formate une erreur pour une réponse API JSON
 */
export function formatApiError(err: unknown): { success: false; error: string; code?: string } {
  if (err instanceof AppError) {
    return { success: false, error: err.message, code: err.code };
  }
  if (err instanceof Error) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Erreur interne du serveur' };
}
