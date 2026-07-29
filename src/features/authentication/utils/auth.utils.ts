import { ROUTES, USER_ROLES } from '@/constants';
import type { UserRole } from '@/types';

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN;
    case USER_ROLES.CREATOR:
    case USER_ROLES.VIEWER:
    default:
      return ROUTES.DASHBOARD;
  }
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function getPostAuthRedirect(
  onboardingCompleted: boolean,
  role: UserRole,
): string {
  if (!onboardingCompleted) {
    return ROUTES.ONBOARDING;
  }
  return getDefaultRouteForRole(role);
}
