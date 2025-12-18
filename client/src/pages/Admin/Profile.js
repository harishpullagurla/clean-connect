import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', address: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setProfile(response.data.user);
            setFormData({
                name: response.data.user.name,
                contact: response.data.user.contact || '',
                address: response.data.user.address || ''
            });
        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await userAPI.updateProfile(formData);
            toast.success('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    if (!profile) return <Layout role={user?.role}><div className="loading">Loading...</div></Layout>; // Dynamic role

    return (
        <Layout role={user?.role}> {/* Dynamic role */}
            <div className="dashboard-container">
                <h1 className="page-title">Profile</h1>

                <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
                    <Card title="Personal Information">
                        {!editing ? (
                            <div>
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                                <p><strong>Contact:</strong> {profile.contact || 'Not provided'}</p>
                                <p><strong>Zone:</strong> {profile.zone_name || 'Not assigned'}</p>
                                <p><strong>Address:</strong> {profile.address || 'Not provided'}</p>
                                <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginTop: '20px' }}>
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact</label>
                                    <input
                                        type="text"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="action-buttons">
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </Card>

                    <Card title="Change Password">
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Change Password</button>
                        </form>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
