import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { workerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../Admin/AdminPages.css';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await workerAPI.getLeaderboard();
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            toast.error('Failed to load leaderboard');
        }
    };

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return (
        <Layout role="Worker">
            <div className="dashboard-container">
                <h1 className="page-title">🏆 Leaderboard</h1>

                <Card>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Worker Name</th>
                                    <th>Zone</th>
                                    <th>Points</th>
                                    <th>Reports Completed</th>
                                    <th>Badge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((worker, index) => (
                                    <tr
                                        key={worker.id}
                                        style={{
                                            background: index < 3 ? '#f9f9f9' : 'transparent',
                                            fontWeight: index < 3 ? '600' : 'normal'
                                        }}
                                    >
                                        <td>
                                            {getMedalEmoji(worker.rank_position)} #{worker.rank_position}
                                        </td>
                                        <td>{worker.name}</td>
                                        <td>{worker.zone_name}</td>
                                        <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                            {worker.total_points}
                                        </td>
                                        <td>{worker.reports_completed}</td>
                                        <td>
                                            <span className={`badge badge-${worker.badge.toLowerCase()}`}>
                                                {worker.badge}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Leaderboard;
