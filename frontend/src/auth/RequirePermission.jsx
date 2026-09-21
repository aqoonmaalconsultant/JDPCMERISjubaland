import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { hasPermission } from './permissions.js';

export function RequirePermission({ children, permissions = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(user, ...permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
