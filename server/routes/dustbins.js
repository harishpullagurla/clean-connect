const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all dustbins (filtered by zone for admins)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT d.*, z.name as zone_name
            FROM dustbins d
            LEFT JOIN zones z ON d.zone_id = z.id
        `;

        const params = [];

        // Filter by zone for Admin
        if (req.user.role === 'Admin' && req.user.zone_id) {
            query += ' WHERE d.zone_id = ?';
            params.push(req.user.zone_id);
        }

        query += ' ORDER BY d.last_updated DESC';

        const [dustbins] = await db.query(query, params);

        res.json({
            success: true,
            dustbins
        });

    } catch (error) {
        console.error('Get dustbins error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dustbins'
        });
    }
});

// Get dustbins by zone
router.get('/zone/:zoneId', verifyToken, async (req, res) => {
    try {
        const [dustbins] = await db.query(
            `SELECT d.*, z.name as zone_name
             FROM dustbins d
             LEFT JOIN zones z ON d.zone_id = z.id
             WHERE d.zone_id = ?
             ORDER BY d.location`,
            [req.params.zoneId]
        );

        res.json({
            success: true,
            dustbins
        });

    } catch (error) {
        console.error('Get dustbins by zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dustbins'
        });
    }
});

// Create new dustbin (Admin only)
router.post('/', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { bin_code, zone_id, location, latitude, longitude, status, capacity } = req.body;

        // Verify admin manages this zone
        if (req.user.zone_id && req.user.zone_id !== parseInt(zone_id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only create dustbins in your zone'
            });
        }

        const [result] = await db.query(
            `INSERT INTO dustbins (bin_code, zone_id, location, latitude, longitude, status, capacity)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bin_code, zone_id, location, latitude || null, longitude || null, status || 'Clean', capacity || 100]
        );

        res.status(201).json({
            success: true,
            message: 'Dustbin created successfully',
            dustbinId: result.insertId
        });

    } catch (error) {
        console.error('Create dustbin error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Bin code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating dustbin'
        });
    }
});

// Update dustbin status (Admin only)
router.put('/:id/status', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { status } = req.body;

        // Verify admin manages this bin's zone
        if (req.user.zone_id) {
            const [bins] = await db.query('SELECT zone_id FROM dustbins WHERE id = ?', [req.params.id]);

            if (bins.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Dustbin not found'
                });
            }

            if (bins[0].zone_id !== req.user.zone_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update dustbins in your zone'
                });
            }
        }

        await db.query(
            'UPDATE dustbins SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({
            success: true,
            message: 'Dustbin status updated successfully'
        });

    } catch (error) {
        console.error('Update dustbin status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dustbin status'
        });
    }
});

// Delete dustbin (Admin only)
router.delete('/:id', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        // Verify admin manages this bin's zone
        if (req.user.zone_id) {
            const [bins] = await db.query('SELECT zone_id FROM dustbins WHERE id = ?', [req.params.id]);

            if (bins.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Dustbin not found'
                });
            }

            if (bins[0].zone_id !== req.user.zone_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete dustbins in your zone'
                });
            }
        }

        await db.query('DELETE FROM dustbins WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Dustbin deleted successfully'
        });

    } catch (error) {
        console.error('Delete dustbin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting dustbin'
        });
    }
});

module.exports = router;
