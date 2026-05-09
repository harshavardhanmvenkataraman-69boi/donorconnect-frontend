import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../../api/authUtils';
export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}
