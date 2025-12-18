import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const ActiveTasks = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await workerAPI.getMyTasks();
            setTasks(response.data.tasks);
        } catch (error) {
            toast.error('Failed to load tasks');
        }
    };

    const handleResolve = async (taskId) => {
        if (window.confirm('Mark this task as resolved?')) {
            try {
                const response = await workerAPI.resolveTask(taskId);
                toast.success(response.data.message);
                fetchTasks();
            } catch (error) {
                toast.error('Failed to resolve task');
            }
        }
    };

    return (
        <Layout role="Worker">
            <div className="dashboard-container">
                <h1 className="page-title">Active Tasks</h1>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Bin</th>
                                    <th>Location</th>
                                    <th>Issue Description</th>
                                    <th>Started</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>#{task.id}</td>
                                            <td>{task.bin_code}</td>
                                            <td>{task.bin_location}</td>
                                            <td>{task.description}</td>
                                            <td>{new Date(task.accepted_at).toLocaleDateString()}</td>
                                            <td><StatusBadge status={task.status} /></td>
                                            <td>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleResolve(task.id)}
                                                >
                                                    Mark Resolved
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">No active tasks</td>
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

export default ActiveTasks;
