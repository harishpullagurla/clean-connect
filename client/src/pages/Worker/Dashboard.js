import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { dashboardAPI, workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const WorkerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                dashboardAPI.getStats(),
                workerAPI.getMyTasks(),
            ]);
            setStats(statsRes.data.stats);
            setTasks(tasksRes.data.tasks);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
    };

    return (
        <Layout role="Worker">
            <div className="dashboard-container">
                <h1 className="page-title">Worker Dashboard</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🔔</div>
                        <div className="stat-details">
                            <h3>{stats?.alerts_pending || 0}</h3>
                            <p>Alerts Pending</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-details">
                            <h3>{stats?.tasks_in_progress || 0}</h3>
                            <p>Tasks In Progress</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-details">
                            <h3>{stats?.tasks_completed || 0}</h3>
                            <p>Tasks Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-details">
                            <h3>{stats?.total_points || 0}</h3>
                            <p>Total Points</p>
                            <span className={`badge badge-${(stats?.badge || 'none').toLowerCase()}`} style={{ marginTop: '5px' }}>
                                {stats?.badge || 'None'}
                            </span>
                        </div>
                    </div>
                </div>

                <Card title="Active Tasks">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Bin Location</th>
                                    <th>Issue</th>
                                    <th>Status</th>
                                    <th>Started</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>#{task.id}</td>
                                            <td>{task.bin_location}</td>
                                            <td>{task.description.substring(0, 50)}...</td>
                                            <td><StatusBadge status={task.status} /></td>
                                            <td>{new Date(task.accepted_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">No active tasks</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default WorkerDashboard;
