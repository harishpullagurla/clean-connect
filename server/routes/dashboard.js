const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get dashboard stats based on user role
router.get('/stats', verifyToken, async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'Admin') {
            // Admin Dashboard Stats
            const zoneCondition = req.user.zone_id ? 'WHERE zone_id = ?' : '';
            const params = req.user.zone_id ? [req.user.zone_id] : [];

            const [dustbinCount] = await db.query(
                `SELECT COUNT(*) as total FROM dustbins ${zoneCondition}`,
                params
            );

            const [reportStats] = await db.query(
                `SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
                 FROM reports ${zoneCondition}`,
                params
            );

            const [workerCount] = await db.query(
                `SELECT COUNT(*) as total FROM users WHERE role = 'Worker' ${req.user.zone_id ? 'AND zone_id = ?' : ''}`,
                params
            );

            stats = {
                total_dustbins: dustbinCount[0].total,
                pending_reports: reportStats[0].pending || 0,
                in_progress_reports: reportStats[0].in_progress || 0,
                resolved_reports: reportStats[0].resolved || 0,
                active_workers: workerCount[0].total
            };

        } else if (req.user.role === 'Worker') {
            // Worker Dashboard Stats
            const [alertCount] = await db.query(
                `SELECT COUNT(*) as total FROM alerts
                 WHERE worker_id = ? AND is_visible = TRUE AND status = 'Pending'`,
                [req.user.id]
            );

            const [taskStats] = await db.query(
                `SELECT
                    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
                 FROM reports
                 WHERE assigned_worker_id = ?`,
                [req.user.id]
            );

            const [points] = await db.query(
                `SELECT total_points, rank_position, badge, reports_completed
                 FROM worker_points WHERE worker_id = ?`,
                [req.user.id]
            );

            stats = {
                alerts_pending: alertCount[0].total,
                tasks_in_progress: taskStats[0].in_progress || 0,
                tasks_completed: taskStats[0].resolved || 0,
                total_points: points[0]?.total_points || 0,
                rank: points[0]?.rank_position || 0,
                badge: points[0]?.badge || 'None',
                reports_completed: points[0]?.reports_completed || 0
            };

        } else if (req.user.role === 'User') {
            // User Dashboard Stats
            const [reportStats] = await db.query(
                `SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
                 FROM reports
                 WHERE user_id = ?`,
                [req.user.id]
            );

            const [dustbinCount] = await db.query(
                'SELECT COUNT(*) as total FROM dustbins'
            );

            stats = {
                total_reports: reportStats[0].total || 0,
                pending_reports: reportStats[0].pending || 0,
                in_progress_reports: reportStats[0].in_progress || 0,
                resolved_reports: reportStats[0].resolved || 0,
                total_dustbins: dustbinCount[0].total
            };
        }

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
});

// Get recent activities based on role
router.get('/activities', verifyToken, async (req, res) => {
    try {
        let activities = [];

        if (req.user.role === 'Admin') {
            const zoneCondition = req.user.zone_id ? 'AND r.zone_id = ?' : '';
            const params = req.user.zone_id ? [req.user.zone_id] : [];

            const [recentReports] = await db.query(
                `SELECT r.id, r.description, r.status, r.created_at,
                        d.bin_code, d.location as bin_location,
                        u.name as user_name
                 FROM reports r
                 JOIN dustbins d ON r.bin_id = d.id
                 JOIN users u ON r.user_id = u.id
                 WHERE 1=1 ${zoneCondition}
                 ORDER BY r.created_at DESC
                 LIMIT 10`,
                params
            );

            activities = recentReports;

        } else if (req.user.role === 'Worker') {
            const [recentTasks] = await db.query(
                `SELECT r.id, r.description, r.status, r.accepted_at as created_at,
                        d.bin_code, d.location as bin_location,
                        u.name as user_name
                 FROM reports r
                 JOIN dustbins d ON r.bin_id = d.id
                 JOIN users u ON r.user_id = u.id
                 WHERE r.assigned_worker_id = ?
                 ORDER BY r.accepted_at DESC
                 LIMIT 10`,
                [req.user.id]
            );

            activities = recentTasks;

        } else if (req.user.role === 'User') {
            const [myReports] = await db.query(
                `SELECT r.id, r.description, r.status, r.created_at,
                        d.bin_code, d.location as bin_location,
                        z.name as zone_name
                 FROM reports r
                 JOIN dustbins d ON r.bin_id = d.id
                 JOIN zones z ON r.zone_id = z.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC
                 LIMIT 10`,
                [req.user.id]
            );

            activities = myReports;
        }

        res.json({
            success: true,
            activities
        });

    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities'
        });
    }
});

// Get worker performance (Admin only)
router.get('/worker-performance', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const zoneCondition = req.user.zone_id ? 'WHERE u.zone_id = ?' : '';
        const params = req.user.zone_id ? [req.user.zone_id] : [];

        const [workers] = await db.query(
            `SELECT u.name, wp.total_points, wp.reports_completed, wp.badge
             FROM users u
             JOIN worker_points wp ON u.id = wp.worker_id
             ${zoneCondition}
             ORDER BY wp.total_points DESC
             LIMIT 10`,
            params
        );

        res.json({
            success: true,
            workers
        });

    } catch (error) {
        console.error('Get worker performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching worker performance'
        });
    }
});

module.exports = router;
