import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { alertAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const MyAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await alertAPI.getMyAlerts();
            setAlerts(response.data.alerts);
        } catch (error) {
            toast.error('Failed to load alerts');
        }
    };

    const handleAccept = async (alertId) => {
        try {
            await alertAPI.accept(alertId);
            toast.success('Alert accepted! Task added to your active tasks.');
            fetchAlerts();
        } catch (error) {
            toast.error('Failed to accept alert');
        }
    };

    const handleIgnore = async (alertId) => {
        try {
            await alertAPI.ignore(alertId);
            toast.info('Alert ignored');
            fetchAlerts();
        } catch (error) {
            toast.error('Failed to ignore alert');
        }
    };

    return (
        <Layout role="Worker">
            <div className="dashboard-container">
                <h1 className="page-title">My Alerts</h1>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <Card key={alert.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ marginBottom: '10px', color: '#4CAF50' }}>
                                            Report #{alert.report_id}
                                        </h3>
                                        <p><strong>Bin:</strong> {alert.bin_code} - {alert.bin_location}</p>
                                        <p><strong>Zone:</strong> {alert.zone_name}</p>
                                        <p><strong>Issue:</strong> {alert.report_description}</p>
                                        <p><strong>Reported by:</strong> {alert.user_name}</p>
                                        <p><strong>Alert Time:</strong> {new Date(alert.alert_time).toLocaleString()}</p>
                                    </div>
                                    {alert.report_image && (
                                        <img
                                            src={`http://localhost:5000/uploads/reports/${alert.report_image}`}
                                            alt="Report"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                    )}
                                </div>
                                <div className="action-buttons" style={{ marginTop: '20px' }}>
                                    <button className="btn btn-primary" onClick={() => handleAccept(alert.id)}>
                                        Accept
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => handleIgnore(alert.id)}>
                                        Ignore
                                    </button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <div className="no-data">No pending alerts</div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MyAlerts;
