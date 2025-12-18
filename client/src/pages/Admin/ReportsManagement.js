import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { reportAPI, workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');

    useEffect(() => {
        fetchReports();
        fetchWorkers();
    }, [filter]);

    const fetchReports = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await reportAPI.getAll(params);
            setReports(response.data.reports);
        } catch (error) {
            toast.error('Failed to load reports');
        }
    };

    const fetchWorkers = async () => {
        try {
            const response = await workerAPI.getAll();
            setWorkers(response.data.workers);
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const handleReassign = async () => {
        try {
            await reportAPI.reassign(selectedReport.id, selectedWorker);
            toast.success('Report reassigned successfully');
            setShowReassignModal(false);
            setSelectedReport(null);
            setSelectedWorker('');
            fetchReports();
        } catch (error) {
            toast.error('Failed to reassign report');
        }
    };

    const handleReopen = async (reportId) => {
        try {
            await reportAPI.reopen(reportId);
            toast.success('Report reopened successfully');
            fetchReports();
        } catch (error) {
            toast.error('Failed to reopen report');
        }
    };

    return (
        <Layout role="Admin">
            <div className="dashboard-container">
                <h1 className="page-title">Reports Management</h1>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('Pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`btn ${filter === 'In Progress' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('In Progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`btn ${filter === 'Resolved' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('Resolved')}
                    >
                        Resolved
                    </button>
                </div>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Bin Location</th>
                                    <th>Description</th>
                                    <th>Assigned Worker</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>#{report.id}</td>
                                        <td>{report.user_name}</td>
                                        <td>{report.bin_location}</td>
                                        <td>{report.description.substring(0, 50)}...</td>
                                        <td>{report.worker_name || 'Unassigned'}</td>
                                        <td><StatusBadge status={report.status} /></td>
                                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setShowReassignModal(true);
                                                    }}
                                                >
                                                    Reassign
                                                </button>
                                                {report.status === 'Resolved' && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleReopen(report.id)}
                                                    >
                                                        Reopen
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Reassign Modal */}
                {showReassignModal && (
                    <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Reassign Report #{selectedReport?.id}</h2>
                            <div className="form-group">
                                <label>Select Worker</label>
                                <select
                                    value={selectedWorker}
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                >
                                    <option value="">Choose Worker</option>
                                    {workers.map((worker) => (
                                        <option key={worker.id} value={worker.id}>
                                            {worker.name} - {worker.zone_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="action-buttons" style={{ marginTop: '20px' }}>
                                <button className="btn btn-primary" onClick={handleReassign}>
                                    Reassign
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowReassignModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReportsManagement;
