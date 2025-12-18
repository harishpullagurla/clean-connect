const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reports/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Get reports (filtered by role)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, zone_id } = req.query;

        let query = `
            SELECT r.*,
                   u.name as user_name, u.email as user_email,
                   d.bin_code, d.location as bin_location,
                   z.name as zone_name,
                   w.name as worker_name
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN dustbins d ON r.bin_id = d.id
            LEFT JOIN zones z ON r.zone_id = z.id
            LEFT JOIN users w ON r.assigned_worker_id = w.id
        `;

        const params = [];
        const conditions = [];

        // Filter by role
        if (req.user.role === 'Admin' && req.user.zone_id) {
            conditions.push('r.zone_id = ?');
            params.push(req.user.zone_id);
        } else if (req.user.role === 'Worker') {
            conditions.push('(r.assigned_worker_id = ? OR r.assigned_worker_id IS NULL)');
            params.push(req.user.id);
        } else if (req.user.role === 'User') {
            conditions.push('r.user_id = ?');
            params.push(req.user.id);
        }

        // Filter by status
        if (status) {
            conditions.push('r.status = ?');
            params.push(status);
        }

        // Filter by zone
        if (zone_id) {
            conditions.push('r.zone_id = ?');
            params.push(zone_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY r.created_at DESC';

        const [reports] = await db.query(query, params);

        res.json({
            success: true,
            reports
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports'
        });
    }
});

// Get single report
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [reports] = await db.query(
            `SELECT r.*,
                    u.name as user_name, u.email as user_email, u.contact as user_contact,
                    d.bin_code, d.location as bin_location,
                    z.name as zone_name,
                    w.name as worker_name, w.contact as worker_contact
             FROM reports r
             LEFT JOIN users u ON r.user_id = u.id
             LEFT JOIN dustbins d ON r.bin_id = d.id
             LEFT JOIN zones z ON r.zone_id = z.id
             LEFT JOIN users w ON r.assigned_worker_id = w.id
             WHERE r.id = ?`,
            [req.params.id]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Get report history
        const [history] = await db.query(
            `SELECT rh.*, u.name as performed_by_name
             FROM report_history rh
             LEFT JOIN users u ON rh.performed_by = u.id
             WHERE rh.report_id = ?
             ORDER BY rh.created_at DESC`,
            [req.params.id]
        );

        res.json({
            success: true,
            report: reports[0],
            history
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report'
        });
    }
});

// Create new report (User only)
router.post('/', verifyToken, checkRole('User'), upload.single('image'), async (req, res) => {
    try {
        const { bin_id, description } = req.body;

        // Get bin and zone info
        const [bins] = await db.query(
            'SELECT zone_id FROM dustbins WHERE id = ?',
            [bin_id]
        );

        if (bins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dustbin not found'
            });
        }

        const zone_id = bins[0].zone_id;
        const image = req.file ? req.file.filename : null;

        // Create report
        const [result] = await db.query(
            `INSERT INTO reports (user_id, bin_id, zone_id, description, image)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, bin_id, zone_id, description, image]
        );

        const reportId = result.insertId;

        // Add to report history
        await db.query(
            'INSERT INTO report_history (report_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
            [reportId, 'Report Created', 'Initial report submitted by user', req.user.id]
        );

        // Create alerts for all workers in this zone
        const [workers] = await db.query(
            'SELECT id FROM users WHERE role = "Worker" AND zone_id = ?',
            [zone_id]
        );

        for (const worker of workers) {
            await db.query(
                'INSERT INTO alerts (report_id, worker_id, zone_id) VALUES (?, ?, ?)',
                [reportId, worker.id, zone_id]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            reportId
        });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating report'
        });
    }
});

// Reassign report to worker (Admin only)
router.put('/:id/reassign', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { worker_id } = req.body;

        // Verify report is in admin's zone
        const [reports] = await db.query(
            'SELECT zone_id, assigned_worker_id FROM reports WHERE id = ?',
            [req.params.id]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (req.user.zone_id && reports[0].zone_id !== req.user.zone_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only reassign reports in your zone'
            });
        }

        // Update report
        await db.query(
            'UPDATE reports SET assigned_worker_id = ?, status = "Pending" WHERE id = ?',
            [worker_id, req.params.id]
        );

        // Hide alerts from previous worker
        if (reports[0].assigned_worker_id) {
            await db.query(
                'UPDATE alerts SET is_visible = FALSE WHERE report_id = ? AND worker_id = ?',
                [req.params.id, reports[0].assigned_worker_id]
            );
        }

        // Create new alert for new worker
        await db.query(
            'INSERT INTO alerts (report_id, worker_id, zone_id) VALUES (?, ?, ?)',
            [req.params.id, worker_id, reports[0].zone_id]
        );

        // Add to history
        await db.query(
            'INSERT INTO report_history (report_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
            [req.params.id, 'Report Reassigned', `Report reassigned to worker ID ${worker_id}`, req.user.id]
        );

        res.json({
            success: true,
            message: 'Report reassigned successfully'
        });

    } catch (error) {
        console.error('Reassign report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reassigning report'
        });
    }
});

// Reopen report (User or Admin)
router.put('/:id/reopen', verifyToken, async (req, res) => {
    try {
        const [reports] = await db.query(
            'SELECT user_id, zone_id, assigned_worker_id FROM reports WHERE id = ?',
            [req.params.id]
        );

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const report = reports[0];

        // Check permissions
        if (req.user.role === 'User' && report.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only reopen your own reports'
            });
        }

        if (req.user.role === 'Admin' && req.user.zone_id && report.zone_id !== req.user.zone_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only reopen reports in your zone'
            });
        }

        // Update report status
        await db.query(
            'UPDATE reports SET status = "Reopened" WHERE id = ?',
            [req.params.id]
        );

        // Create new alert for assigned worker or all workers in zone
        if (report.assigned_worker_id) {
            await db.query(
                'INSERT INTO alerts (report_id, worker_id, zone_id) VALUES (?, ?, ?)',
                [req.params.id, report.assigned_worker_id, report.zone_id]
            );
        } else {
            const [workers] = await db.query(
                'SELECT id FROM users WHERE role = "Worker" AND zone_id = ?',
                [report.zone_id]
            );

            for (const worker of workers) {
                await db.query(
                    'INSERT INTO alerts (report_id, worker_id, zone_id) VALUES (?, ?, ?)',
                    [req.params.id, worker.id, report.zone_id]
                );
            }
        }

        // Add to history
        await db.query(
            'INSERT INTO report_history (report_id, action, description, performed_by) VALUES (?, ?, ?, ?)',
            [req.params.id, 'Report Reopened', 'Report reopened for reassessment', req.user.id]
        );

        res.json({
            success: true,
            message: 'Report reopened successfully'
        });

    } catch (error) {
        console.error('Reopen report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reopening report'
        });
    }
});

module.exports = router;
