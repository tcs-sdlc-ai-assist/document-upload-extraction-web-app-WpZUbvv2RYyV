import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * HOC to protect routes/components that require authentication.
 * If not authenticated, redirects to /login.
 * Usage: export default withAuthGuard(MyComponent);
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const Guard: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!loading && !user) {
        navigate('/login', { replace: true });
      }
    }, [user, loading, navigate]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      );
    }

    if (!user) {
      // Redirect will happen in useEffect; render nothing.
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  Guard.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Guard;
}

export default withAuthGuard;