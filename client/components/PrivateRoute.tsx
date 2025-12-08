import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (loading) {
      // Show timeout message after 5 seconds
      const timeout = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <div className="text-muted-foreground">Loading...</div>
        {showTimeout && (
          <div className="mt-4 text-sm text-destructive">
            Taking longer than expected. Please check your connection.
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default PrivateRoute;
