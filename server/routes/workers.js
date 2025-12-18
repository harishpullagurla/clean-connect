const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get workers (Admin only - filtered by zone)
router.get('/', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        let query = `
            SELECT u.id, u.name, u.email, u.contact, u.zone_id,
                   z.name as zone_name,
                   wp.total_points, wp.rank_position, wp.badge, wp.reports_completed,
                   COUNT(DISTINCT wa.bin_id) as assigned_bins
            FROM users u
            LEFT JOIN zones z ON u.zone_id = z.id
            LEFT JOIN worker_points wp ON u.id = wp.worker_id
            LEFT JOIN worker_assignments wa ON u.id = wa.worker_id
            WHERE u.role = "Worker"
        `;

        const params = [];

        // Filter by zone for Admin
        if (req.user.zone_id) {
            query += ' AND u.zone_id = ?';
            params.push(req.user.zone_id);
        }

        query += ' GROUP BY u.id ORDER BY wp.total_points DESC';

        const [workers] = await db.query(query, params);

        res.json({
            success: true,
            workers
        });

    } catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workers'
        });
    }
});

// Assign worker to dustbin (Admin only)
router.post('/assign', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { worker_id, bin_id } = req.body;

        // Verify worker and bin are in admin's zone
        if (req.user.zone_id) {
            const [worker] = await db.query(
                'SELECT zone_id FROM users WHERE id = ? AND role = "Worker"',
                [worker_id]
            );

            const [bin] = await db.query(
                'SELECT zone_id FROM dustbins WHERE id = ?',
                [bin_id]
            );

            if (worker.length === 0 || bin.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Worker or dustbin not found'
                });
            }

            if (worker[0].zone_id !== req.user.zone_id || bin[0].zone_id !== req.user.zone_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only assign workers and bins in your zone'
                });
            }
        }

        // Check if already assigned
        const [existing] = await db.query(
            'SELECT id FROM worker_assignments WHERE worker_id = ? AND bin_id = ?',
            [worker_id, bin_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Worker is already assigned to this dustbin'
            });
        }

        // Create assignment
        await db.query(
            'INSERT INTO worker_assignments (worker_id, bin_id) VALUES (?, ?)',
            [worker_id, bin_id]
        );

        res.status(201).json({
            success: true,
            message: 'Worker assigned successfully'
        });

    } catch (error) {
        console.error('Assign worker error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning worker'
        });
    }
});

// Get active tasks for worker
router.get('/my-tasks', verifyToken, checkRole('Worker'), async (req, res) => {
    try {
        const [tasks] = await db.query(
            `SELECT r.*,
                    d.bin_code, d.location as bin_location,
                    z.name as zone_name,
                    u.name as user_name
             FROM reports r
             JOIN dustbins d ON r.bin_id = d.id
             JOIN zones z ON r.zone_id = z.id
             JOIN users u ON r.user_id = u.id
             WHERE r.assigned_worker_id = ? AND r.status = "In Progress"
             ORDER BY r.accepted_at ASC`,
            [req.user.id]
        );

        res.json({
            success: true,
            tasks
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks'
        });
    }
});

// Mark task as resolved (Worker only)
router.put('/tasks/:id/resolve', verifyToken, checkRole('Worker'), async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify task belongs to worker
        const [reports] = await connection.query(
            'SELECT id FROM reports WHERE id = ? AND assigned_worker_id = ?',
            [req.params.id, req.user.id]
        );

        if (reports.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Task not found or not assigned to you'
            });
        }

        // Update report status
        await connection.query(
            'UPDATE reports SET status = "Resolved", resolved_at = NOW() WHERE id = ?',
            [req.params.id]
        );

        // Update worker points
        await connection.query(
            `UPDATE worker_points
             SET total_points = total_points + 10,
                 reports_completed = reports_completed + 1
             WHERE worker_id = ?`,
            [req.user.id]
        );

        // Recalculate ranks
        await connection.query(`
            UPDATE worker_points wp1
            SET rank_position = (
                SELECT COUNT(*) + 1
                FROM worker_points wp2
                WHERE wp2.total_points > wp1.total_points
            )
        `);

        // Update badges
        await connection.query('UPDATE worker_points SET badge = "None"');
        await connection.query('UPDATE worker_points SET badge = "Gold" WHERE rank_position = 1');
        await connection.query('UPDATE worker_points SET badge = "Silver" WHERE rank_position = 2');
        await connection.query('UPDATE worker_points SET badge = "Bronze" WHERE rank_position = 3');

        // Add to report history
        await connection.query(
            'INSERT INTO report_history (report_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
            [req.params.id, 'Task Resolved', 'Cleanup completed successfully', req.user.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Task marked as resolved. You earned 10 points!'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Resolve task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resolving task'
        });
    } finally {
        connection.release();
    }
});

// Get leaderboard
router.get('/leaderboard', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT u.id, u.name, u.zone_id,
                   z.name as zone_name,
                   wp.total_points, wp.rank_position, wp.badge, wp.reports_completed
            FROM users u
            JOIN worker_points wp ON u.id = wp.worker_id
            LEFT JOIN zones z ON u.zone_id = z.id
            WHERE u.role = "Worker"
        `;

        const params = [];

        // Filter by zone if specified
        if (req.query.zone_id) {
            query += ' AND u.zone_id = ?';
            params.push(req.query.zone_id);
        }

        query += ' ORDER BY wp.total_points DESC LIMIT 50';

        const [leaderboard] = await db.query(query, params);

        res.json({
            success: true,
            leaderboard
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard'
        });
    }
});

module.exports = router;
