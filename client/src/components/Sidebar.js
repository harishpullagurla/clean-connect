import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getMenuItems = () => {
        switch (role) {
            case 'Admin':
                return [
                    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
                    { path: '/admin/dustbins', icon: '🗑️', label: 'Dustbins' },
                    { path: '/admin/workers', icon: '👷', label: 'Workers' },
                    { path: '/admin/reports', icon: '📋', label: 'Reports' },
                    { path: '/admin/unaccepted-alerts', icon: '🔔', label: 'Unaccepted Alerts' },
                    { path: '/admin/profile', icon: '👤', label: 'Profile' },
                ];
            case 'Worker':
                return [
                    { path: '/worker/dashboard', icon: '📊', label: 'Dashboard' },
                    { path: '/worker/alerts', icon: '🔔', label: 'My Alerts' },
                    { path: '/worker/tasks', icon: '✅', label: 'Active Tasks' },
                    { path: '/worker/leaderboard', icon: '🏆', label: 'Leaderboard' },
                    { path: '/worker/profile', icon: '👤', label: 'Profile' },
                ];
            case 'User':
                return [
                    { path: '/user/dashboard', icon: '📊', label: 'Dashboard' },
                    { path: '/user/report-issue', icon: '📝', label: 'Report Issue' },
                    { path: '/user/my-reports', icon: '📋', label: 'My Reports' },
                    { path: '/user/profile', icon: '👤', label: 'Profile' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo">
                    {collapsed ? 'CC' : 'Clean Connect'}
                </h2>
                <button
                    className="toggle-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? '☰' : '✕'}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                {!collapsed && <span>Logout</span>}
            </button>
        </div>
    );
};

export default Sidebar;
