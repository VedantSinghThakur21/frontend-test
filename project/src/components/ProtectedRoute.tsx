import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPermissions } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Partial<UserPermissions>;
}

export function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions) {
    const hasRequiredPermissions = Object.entries(requiredPermissions).every(
      ([permission, required]) => {
        if (!required) return true;
        return user.permissions[permission as keyof UserPermissions];
      }
    );

    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}