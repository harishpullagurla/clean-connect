import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [workerPerformance, setWorkerPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activitiesRes, performanceRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getActivities(),
                dashboardAPI.getWorkerPerformance(),
            ]);

            setStats(statsRes.data.stats);
            setActivities(activitiesRes.data.activities);
            setWorkerPerformance(performanceRes.data.workers);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout role="Admin">
                <div className="loading">Loading...</div>
            </Layout>
        );
    }

    return (
        <Layout role="Admin">
            <div className="dashboard-container">
                <h1 className="page-title">Admin Dashboard</h1>

                {/* Summary Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🗑️</div>
                        <div className="stat-details">
                            <h3>{stats?.total_dustbins || 0}</h3>
                            <p>Total Dustbins</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-details">
                            <h3>{stats?.pending_reports || 0}</h3>
                            <p>Pending Reports</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-details">
                            <h3>{stats?.resolved_reports || 0}</h3>
                            <p>Resolved Reports</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👷</div>
                        <div className="stat-details">
                            <h3>{stats?.active_workers || 0}</h3>
                            <p>Active Workers</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* Worker Performance */}
                    <Card title="Worker Performance">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Points</th>
                                        <th>Reports Completed</th>
                                        <th>Badge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workerPerformance.length > 0 ? (
                                        workerPerformance.map((worker, index) => (
                                            <tr key={index}>
                                                <td>{worker.name}</td>
                                                <td>{worker.total_points}</td>
                                                <td>{worker.reports_completed}</td>
                                                <td>
                                                    <span className={`badge badge-${worker.badge.toLowerCase()}`}>
                                                        {worker.badge}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="no-data">No worker data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Recent Activities */}
                    <Card title="Recent Reports">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <tr key={activity.id}>
                                                <td>#{activity.id}</td>
                                                <td>{activity.bin_location}</td>
                                                <td><StatusBadge status={activity.status} /></td>
                                                <td>{activity.user_name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="no-data">No recent activities</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
