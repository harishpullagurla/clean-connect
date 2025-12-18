import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        contact: '',
        address: '',
        zone_id: '',
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const zones = [
        { id: 1, name: 'Zone 1 - North Zone' },
        { id: 2, name: 'Zone 2 - South Zone' },
        { id: 3, name: 'Zone 3 - East Zone' },
        { id: 4, name: 'Zone 4 - West Zone' },
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const registrationData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            contact: formData.contact,
            address: formData.address,
            zone_id: formData.zone_id || null,
        };

        const result = await register(registrationData);

        setLoading(false);

        if (result.success) {
            toast.success('Registration successful! Please login.');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } else {
            toast.error(result.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Clean Connect</h1>
                    <p className="auth-subtitle">Create New Account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Register</h2>

                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-Mail *</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Min 6 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="User">User (Citizen)</option>
                            <option value="Worker">Worker</option>
                            <option value="Admin">Zone Admin</option>
                        </select>
                    </div>

                    {(formData.role === 'Admin' || formData.role === 'Worker') && (
                        <div className="form-group">
                            <label htmlFor="zone_id">Zone *</label>
                            <select
                                id="zone_id"
                                name="zone_id"
                                value={formData.zone_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="contact">Contact Number</label>
                        <input
                            type="tel"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="Enter contact number"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            rows="3"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <p className="auth-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;