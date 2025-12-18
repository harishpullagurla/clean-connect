import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { reportAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await reportAPI.getAll();
            setReports(response.data.reports);
        } catch (error) {
            toast.error('Failed to load reports');
        }
    };

    const handleViewDetails = async (reportId) => {
        try {
            const response = await reportAPI.getById(reportId);
            setSelectedReport(response.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Failed to load report details');
        }
    };

    const handleReopen = async (reportId) => {
        if (window.confirm('Report this as not clean yet?')) {
            try {
                await reportAPI.reopen(reportId);
                toast.success('Report reopened successfully');
                fetchReports();
            } catch (error) {
                toast.error('Failed to reopen report');
            }
        }
    };

    return (
        <Layout role="User">
            <div className="dashboard-container">
                <h1 className="page-title">My Reports</h1>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Zone</th>
                                    <th>Bin Location</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? (
                                    reports.map((report) => (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td>{report.zone_name}</td>
                                            <td>{report.bin_location}</td>
                                            <td><StatusBadge status={report.status} /></td>
                                            <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleViewDetails(report.id)}
                                                    >
                                                        View Details
                                                    </button>
                                                    {report.status === 'Resolved' && (
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleReopen(report.id)}
                                                        >
                                                            Not Clean Yet
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">No reports found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Details Modal */}
                {showDetailModal && selectedReport && (
                    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                            <h2>Report Details #{selectedReport.report.id}</h2>

                            <div style={{ marginTop: '20px' }}>
                                <p><strong>Bin:</strong> {selectedReport.report.bin_code} - {selectedReport.report.bin_location}</p>
                                <p><strong>Zone:</strong> {selectedReport.report.zone_name}</p>
                                <p><strong>Status:</strong> <StatusBadge status={selectedReport.report.status} /></p>
                                <p><strong>Description:</strong> {selectedReport.report.description}</p>
                                <p><strong>Created:</strong> {new Date(selectedReport.report.created_at).toLocaleString()}</p>
                                {selectedReport.report.worker_name && (
                                    <p><strong>Assigned Worker:</strong> {selectedReport.report.worker_name}</p>
                                )}

                                {selectedReport.report.image && (
                                    <div style={{ marginTop: '15px' }}>
                                        <strong>Image:</strong>
                                        <img
                                            src={`http://localhost:5000/uploads/reports/${selectedReport.report.image}`}
                                            alt="Report"
                                            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}

                                <div style={{ marginTop: '20px' }}>
                                    <strong>History:</strong>
                                    <div style={{ marginTop: '10px' }}>
                                        {selectedReport.history.map((entry, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '10px',
                                                    background: '#f5f5f5',
                                                    borderLeft: '3px solid #4CAF50',
                                                    marginBottom: '10px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <strong>{entry.action}</strong>
                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                                    {entry.description} - {entry.performed_by_name || 'System'}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#999' }}>
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDetailModal(false)}
                                    style={{ marginTop: '20px', width: '100%' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyReports;
