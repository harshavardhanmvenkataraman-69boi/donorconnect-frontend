import { Navigate, Outlet } from 'react-router-dom';
import { getRole } from '../../../api/authUtils';
export default function RoleGuard({ allowed }) {
  return allowed.includes(getRole()) ? <Outlet /> : <Navigate to="/" replace />;
}
