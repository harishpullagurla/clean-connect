import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { workerAPI, dustbinAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const WorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [dustbins, setDustbins] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignData, setAssignData] = useState({ worker_id: '', bin_id: '' });

    useEffect(() => {
        fetchWorkers();
        fetchDustbins();
    }, []);

    const fetchWorkers = async () => {
        try {
            const response = await workerAPI.getAll();
            setWorkers(response.data.workers);
        } catch (error) {
            toast.error('Failed to load workers');
        }
    };

    const fetchDustbins = async () => {
        try {
            const response = await dustbinAPI.getAll();
            setDustbins(response.data.dustbins);
        } catch (error) {
            console.error('Error fetching dustbins:', error);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await workerAPI.assign(assignData);
            toast.success('Worker assigned successfully');
            setShowAssignModal(false);
            setAssignData({ worker_id: '', bin_id: '' });
            fetchWorkers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign worker');
        }
    };

    return (
        <Layout role="Admin">
            <div className="dashboard-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 className="page-title">Worker Management</h1>
                    <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                        Assign Worker
                    </button>
                </div>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Zone</th>
                                    <th>Assigned Bins</th>
                                    <th>Points</th>
                                    <th>Rank</th>
                                    <th>Badge</th>
                                    <th>Reports Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td><strong>{worker.name}</strong></td>
                                        <td>{worker.contact}</td>
                                        <td>{worker.zone_name}</td>
                                        <td>{worker.assigned_bins}</td>
                                        <td>{worker.total_points || 0}</td>
                                        <td>#{worker.rank_position || '-'}</td>
                                        <td>
                                            <span className={`badge badge-${(worker.badge || 'none').toLowerCase()}`}>
                                                {worker.badge || 'None'}
                                            </span>
                                        </td>
                                        <td>{worker.reports_completed || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Assign Worker Modal */}
                {showAssignModal && (
                    <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Assign Worker to Dustbin</h2>
                            <form onSubmit={handleAssign}>
                                <div className="form-group">
                                    <label>Select Worker *</label>
                                    <select
                                        value={assignData.worker_id}
                                        onChange={(e) => setAssignData({ ...assignData, worker_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose Worker</option>
                                        {workers.map((worker) => (
                                            <option key={worker.id} value={worker.id}>
                                                {worker.name} - {worker.zone_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Select Dustbin *</label>
                                    <select
                                        value={assignData.bin_id}
                                        onChange={(e) => setAssignData({ ...assignData, bin_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose Dustbin</option>
                                        {dustbins.map((bin) => (
                                            <option key={bin.id} value={bin.id}>
                                                {bin.bin_code} - {bin.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="action-buttons" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="btn btn-primary">Assign</button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAssignModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default WorkerManagement;
