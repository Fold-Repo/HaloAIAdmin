import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

type RoleRouteProps = {
  roles: UserRole[];
};

export function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
