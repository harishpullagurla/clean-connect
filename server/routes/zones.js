const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get all zones
router.get('/', verifyToken, async (req, res) => {
    try {
        const [zones] = await db.query(
            `SELECT z.*, u.name as admin_name, u.email as admin_email
             FROM zones z
             LEFT JOIN users u ON z.admin_id = u.id
             ORDER BY z.name`
        );

        res.json({
            success: true,
            zones
        });

    } catch (error) {
        console.error('Get zones error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching zones'
        });
    }
});

// Get single zone
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [zones] = await db.query(
            `SELECT z.*, u.name as admin_name, u.email as admin_email
             FROM zones z
             LEFT JOIN users u ON z.admin_id = u.id
             WHERE z.id = ?`,
            [req.params.id]
        );

        if (zones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Zone not found'
            });
        }

        res.json({
            success: true,
            zone: zones[0]
        });

    } catch (error) {
        console.error('Get zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching zone'
        });
    }
});

module.exports = router;
