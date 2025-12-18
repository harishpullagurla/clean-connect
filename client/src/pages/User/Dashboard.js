import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { dustbinAPI, dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const UserDashboard = () => {
    const [stats, setStats] = useState(null);
    const [dustbins, setDustbins] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchDashboardData();
        fetchDustbins();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await dashboardAPI.getStats();
            setStats(response.data.stats);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
    };

    const fetchDustbins = async () => {
        try {
            const response = await dustbinAPI.getAll();
            setDustbins(response.data.dustbins);
        } catch (error) {
            toast.error('Failed to load dustbins');
        }
    };

    return (
        <Layout role="User">
            <div className="dashboard-container">
                <h1 className="page-title">Hello, {user?.name} 👋</h1>
                <p style={{ marginBottom: '30px', color: '#666' }}>
                    Report waste issues anywhere in the city
                </p>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-details">
                            <h3>{stats?.total_reports || 0}</h3>
                            <p>Total Reports</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-details">
                            <h3>{stats?.pending_reports || 0}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-details">
                            <h3>{stats?.in_progress_reports || 0}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-details">
                            <h3>{stats?.resolved_reports || 0}</h3>
                            <p>Resolved</p>
                        </div>
                    </div>
                </div>

                <Card title="Dustbins Across City">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Bin Code</th>
                                    <th>Zone</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Fill Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dustbins.map((bin) => (
                                    <tr key={bin.id}>
                                        <td><strong>{bin.bin_code}</strong></td>
                                        <td>{bin.zone_name}</td>
                                        <td>{bin.location}</td>
                                        <td><StatusBadge status={bin.status} /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '100px',
                                                    height: '8px',
                                                    background: '#E0E0E0',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${bin.fill_level}%`,
                                                        height: '100%',
                                                        background: bin.fill_level > 80 ? '#f44336' : bin.fill_level > 50 ? '#ff9800' : '#4CAF50',
                                                        borderRadius: '4px'
                                                    }} />
                                                </div>
                                                <span>{bin.fill_level}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default UserDashboard;
