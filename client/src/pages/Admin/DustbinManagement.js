import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { dustbinAPI, zoneAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const DustbinManagement = () => {
    const [dustbins, setDustbins] = useState([]);
    const [zones, setZones] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBin, setEditingBin] = useState(null);
    const [formData, setFormData] = useState({
        bin_code: '',
        zone_id: '',
        location: '',
        latitude: '',
        longitude: '',
        status: 'Clean',
        capacity: 100
    });

    useEffect(() => {
        fetchDustbins();
        fetchZones();
    }, []);

    const fetchDustbins = async () => {
        try {
            const response = await dustbinAPI.getAll();
            setDustbins(response.data.dustbins);
        } catch (error) {
            toast.error('Failed to load dustbins');
        }
    };

    const fetchZones = async () => {
        try {
            const response = await zoneAPI.getAll();
            setZones(response.data.zones);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dustbinAPI.create(formData);
            toast.success('Dustbin created successfully');
            setShowModal(false);
            resetForm();
            fetchDustbins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create dustbin');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await dustbinAPI.updateStatus(id, newStatus);
            toast.success('Status updated successfully');
            fetchDustbins();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this dustbin?')) {
            try {
                await dustbinAPI.delete(id);
                toast.success('Dustbin deleted successfully');
                fetchDustbins();
            } catch (error) {
                toast.error('Failed to delete dustbin');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            bin_code: '',
            zone_id: '',
            location: '',
            latitude: '',
            longitude: '',
            status: 'Clean',
            capacity: 100
        });
        setEditingBin(null);
    };

    return (
        <Layout role="Admin">
            <div className="dashboard-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 className="page-title">Dustbin Management</h1>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Add New Dustbin
                    </button>
                </div>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Bin Code</th>
                                    <th>Zone</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Fill Level</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dustbins.map((bin) => (
                                    <tr key={bin.id}>
                                        <td><strong>{bin.bin_code}</strong></td>
                                        <td>{bin.zone_name}</td>
                                        <td>{bin.location}</td>
                                        <td><StatusBadge status={bin.status} /></td>
                                        <td>{bin.fill_level}%</td>
                                        <td>{new Date(bin.last_updated).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <select
                                                    value={bin.status}
                                                    onChange={(e) => handleStatusChange(bin.id, e.target.value)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px' }}
                                                >
                                                    <option value="Clean">Clean</option>
                                                    <option value="Full">Full</option>
                                                    <option value="Overflowing">Overflowing</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(bin.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Add Dustbin Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Add New Dustbin</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Bin Code *</label>
                                    <input
                                        type="text"
                                        value={formData.bin_code}
                                        onChange={(e) => setFormData({ ...formData, bin_code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Zone *</label>
                                    <select
                                        value={formData.zone_id}
                                        onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Zone</option>
                                        {zones.map((zone) => (
                                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="action-buttons" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="btn btn-primary">Create Dustbin</button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setShowModal(false); resetForm(); }}
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

export default DustbinManagement;
