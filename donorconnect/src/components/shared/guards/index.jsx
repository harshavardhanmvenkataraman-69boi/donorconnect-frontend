import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../../api/authUtils';
import { getRole } from '../../../api/authUtils';

export function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleGuard({ allowed }) {
  return allowed.includes(getRole()) ? <Outlet /> : <Navigate to="/login" replace />;
}
