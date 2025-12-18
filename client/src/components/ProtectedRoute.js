import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    // Show loading screen while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem',
                color: '#4CAF50'
            }}>
                Loading...
            </div>
        );
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!user && !token && !savedUser) {
        // Not logged in at all
        return <Navigate to="/login" replace />;
    }

    // Parse user from localStorage if not in state yet
    const currentUser = user || (savedUser ? JSON.parse(savedUser) : null);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check role mismatch
    if (role && currentUser.role !== role) {
        // Redirect to correct dashboard
        const dashboardMap = {
            'Admin': '/admin/dashboard',
            'Worker': '/worker/dashboard',
            'User': '/user/dashboard'
        };
        return <Navigate to={dashboardMap[currentUser.role] || '/login'} replace />;
    }

    // All checks passed - show the protected content
    return children;
};

export default ProtectedRoute;
