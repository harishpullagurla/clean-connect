const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get alerts for worker
router.get('/my-alerts', verifyToken, checkRole('Worker'), async (req, res) => {
    try {
        const [alerts] = await db.query(
            `SELECT a.*,
                    r.description as report_description, r.image as report_image,
                    d.bin_code, d.location as bin_location,
                    z.name as zone_name,
                    u.name as user_name
             FROM alerts a
             JOIN reports r ON a.report_id = r.id
             JOIN dustbins d ON r.bin_id = d.id
             JOIN zones z ON a.zone_id = z.id
             JOIN users u ON r.user_id = u.id
             WHERE a.worker_id = ? AND a.is_visible = TRUE AND a.status = "Pending"
             ORDER BY a.alert_time DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            alerts
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts'
        });
    }
});

// Accept alert (Worker only)
router.put('/:id/accept', verifyToken, checkRole('Worker'), async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get alert info
        const [alerts] = await connection.query(
            'SELECT report_id, zone_id FROM alerts WHERE id = ? AND worker_id = ?',
            [req.params.id, req.user.id]
        );

        if (alerts.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        const { report_id, zone_id } = alerts[0];

        // Update alert status
        await connection.query(
            'UPDATE alerts SET status = "Accepted", accepted_at = NOW() WHERE id = ?',
            [req.params.id]
        );

        // Hide this alert from all other workers
        await connection.query(
            'UPDATE alerts SET is_visible = FALSE WHERE report_id = ? AND worker_id != ?',
            [report_id, req.user.id]
        );

        // Update report
        await connection.query(
            'UPDATE reports SET assigned_worker_id = ?, status = "In Progress", accepted_at = NOW() WHERE id = ?',
            [req.user.id, report_id]
        );

        // Add to report history
        await connection.query(
            'INSERT INTO report_history (report_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
            [report_id, 'Alert Accepted', 'Worker accepted the alert and started working', req.user.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Alert accepted successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Accept alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting alert'
        });
    } finally {
        connection.release();
    }
});

// Ignore alert (Worker only)
router.put('/:id/ignore', verifyToken, checkRole('Worker'), async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE alerts SET status = "Ignored", is_visible = FALSE WHERE id = ? AND worker_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            message: 'Alert ignored'
        });

    } catch (error) {
        console.error('Ignore alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Error ignoring alert'
        });
    }
});

// Get unaccepted alerts (Admin only - alerts pending for > 2 hours)
router.get('/unaccepted', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        let query = `
            SELECT a.*,
                   r.description as report_description,
                   d.bin_code, d.location as bin_location,
                   w.name as worker_name, w.contact as worker_contact,
                   TIMESTAMPDIFF(MINUTE, a.alert_time, NOW()) as minutes_pending
            FROM alerts a
            JOIN reports r ON a.report_id = r.id
            JOIN dustbins d ON r.bin_id = d.id
            JOIN users w ON a.worker_id = w.id
            WHERE a.status = "Pending"
              AND a.is_visible = TRUE
              AND TIMESTAMPDIFF(MINUTE, a.alert_time, NOW()) > 120
        `;

        const params = [];

        // Filter by zone for Admin
        if (req.user.zone_id) {
            query += ' AND a.zone_id = ?';
            params.push(req.user.zone_id);
        }

        query += ' ORDER BY a.alert_time ASC';

        const [alerts] = await db.query(query, params);

        res.json({
            success: true,
            alerts
        });

    } catch (error) {
        console.error('Get unaccepted alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unaccepted alerts'
        });
    }
});

module.exports = router;
