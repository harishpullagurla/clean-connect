import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'Clean':
            case 'Resolved':
            case 'Accepted':
                return 'status-badge status-green';
            case 'Full':
            case 'In Progress':
            case 'Pending':
                return 'status-badge status-yellow';
            case 'Overflowing':
            case 'Reopened':
                return 'status-badge status-red';
            case 'Maintenance':
                return 'status-badge status-blue';
            default:
                return 'status-badge status-gray';
        }
    };

    return <span className={getStatusClass()}>{status}</span>;
};

export default StatusBadge;
