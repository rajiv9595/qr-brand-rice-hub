import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    if (!isAuthenticated) {
        if (requiredRole === 'admin') {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
