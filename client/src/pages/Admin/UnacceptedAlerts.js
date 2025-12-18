import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { alertAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const UnacceptedAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchUnacceptedAlerts();
    }, []);

    const fetchUnacceptedAlerts = async () => {
        try {
            const response = await alertAPI.getUnaccepted();
            setAlerts(response.data.alerts);
        } catch (error) {
            toast.error('Failed to load unaccepted alerts');
        }
    };

    return (
        <Layout role="Admin">
            <div className="dashboard-container">
                <h1 className="page-title">Unaccepted Alerts (Pending &gt; 2 hours)</h1>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Alert ID</th>
                                    <th>Report ID</th>
                                    <th>Bin Location</th>
                                    <th>Worker</th>
                                    <th>Contact</th>
                                    <th>Alert Time</th>
                                    <th>Pending (mins)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.length > 0 ? (
                                    alerts.map((alert) => (
                                        <tr key={alert.id}>
                                            <td>#{alert.id}</td>
                                            <td>#{alert.report_id}</td>
                                            <td>{alert.bin_location}</td>
                                            <td>{alert.worker_name}</td>
                                            <td>{alert.worker_contact}</td>
                                            <td>{new Date(alert.alert_time).toLocaleString()}</td>
                                            <td>{alert.minutes_pending} minutes</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">No unaccepted alerts</td>
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

export default UnacceptedAlerts;
