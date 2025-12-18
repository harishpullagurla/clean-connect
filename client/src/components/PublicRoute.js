
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
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

    // Check localStorage as backup
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const currentUser = user || (savedUser ? JSON.parse(savedUser) : null);

    // If user is already logged in, redirect to their dashboard
    if (currentUser && token) {
        const dashboardMap = {
            'Admin': '/admin/dashboard',
            'Worker': '/worker/dashboard',
            'User': '/user/dashboard'
        };
        return <Navigate to={dashboardMap[currentUser.role] || '/login'} replace />;
    }

    // User is not logged in, show the public page (login/register)
    return children;
};

export default PublicRoute;
