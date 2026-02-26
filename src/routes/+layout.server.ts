import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { session, user, userRole } = locals;
  return { session, user, userRole };
};
