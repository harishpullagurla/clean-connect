import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { reportAPI, zoneAPI, dustbinAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../Admin/AdminPages.css';

const ReportIssue = () => {
    const [zones, setZones] = useState([]);
    const [dustbins, setDustbins] = useState([]);
    const [formData, setFormData] = useState({
        zone_id: '',
        bin_id: '',
        description: '',
        image: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchZones();
    }, []);

    useEffect(() => {
        if (formData.zone_id) {
            fetchDustbinsByZone(formData.zone_id);
        }
    }, [formData.zone_id]);

    const fetchZones = async () => {
        try {
            const response = await zoneAPI.getAll();
            setZones(response.data.zones);
        } catch (error) {
            toast.error('Failed to load zones');
        }
    };

    const fetchDustbinsByZone = async (zoneId) => {
        try {
            const response = await dustbinAPI.getByZone(zoneId);
            setDustbins(response.data.dustbins);
        } catch (error) {
            toast.error('Failed to load dustbins');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('bin_id', formData.bin_id);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await reportAPI.create(data);
            toast.success('Report created successfully!');
            navigate('/user/my-reports');
        } catch (error) {
            toast.error('Failed to create report');
        }
    };

    return (
        <Layout role="User">
            <div className="dashboard-container">
                <h1 className="page-title">Report an Issue</h1>

                <Card style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Select Zone *</label>
                            <select
                                value={formData.zone_id}
                                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value, bin_id: '' })}
                                required
                            >
                                <option value="">Choose Zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Select Dustbin *</label>
                            <select
                                value={formData.bin_id}
                                onChange={(e) => setFormData({ ...formData, bin_id: e.target.value })}
                                required
                                disabled={!formData.zone_id}
                            >
                                <option value="">Choose Dustbin</option>
                                {dustbins.map((bin) => (
                                    <option key={bin.id} value={bin.id}>
                                        {bin.bin_code} - {bin.location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Issue Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows="5"
                                placeholder="Describe the issue in detail..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Submit Report
                        </button>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};

export default ReportIssue;
