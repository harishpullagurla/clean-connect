import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Don't auto-redirect on page load, only after successful login
        // This prevents redirect loops
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.email || !formData.password) {
            toast.error('Please enter username and password');
            return;
        }

        setLoading(true);

        // Call login
        const result = await login(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            toast.success(`Welcome ${result.user.name}!`);

            // Use setTimeout to ensure state is updated before navigation
            setTimeout(() => {
                // Simple redirect based on role
                if (result.user.role === 'Admin') {
                    window.location.href = '/admin/dashboard';
                } else if (result.user.role === 'Worker') {
                    window.location.href = '/worker/dashboard';
                } else if (result.user.role === 'User') {
                    window.location.href = '/user/dashboard';
                }
            }, 1000);
        } else {
            toast.error(result.message || 'Login failed!');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Clean Connect</h1>
                    <p className="auth-subtitle">Smart City Waste Management</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Login</h2>

                    <div className="form-group">
                        <label htmlFor="email">Email-Id</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter username (admin/worker/user)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="auth-link">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>

                  
                </form>
            </div>
        </div>
    );
};

export default Login;
