const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Register new user (Simplified for school project)
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
    body('role').isIn(['Admin', 'Worker', 'User']).withMessage('Invalid role'),
    body('contact').optional().trim(),
    body('address').optional().trim(),
    body('zone_id').optional().isInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, role, contact, address, zone_id } = req.body;

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Store password as plain text (NOT SECURE, only for development)
        // In production, use: const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, contact, address, zone_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, password, role, contact || null, address || null, zone_id || null]
        );

        // If role is Worker, initialize worker_points
        if (role === 'Worker') {
            await db.query(
                'INSERT INTO worker_points (worker_id) VALUES (?)',
                [result.insertId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Simple Login - School Project Version
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username (stored in email field)
        const [users] = await db.query(
            'SELECT u.*, z.name as zone_name FROM users u LEFT JOIN zones z ON u.zone_id = z.id WHERE u.email = ?',
            [email]
        );

        // Check if user exists
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Simple password check (plain text)
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Create simple token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                zone_id: user.zone_id
            },
            process.env.JWT_SECRET || 'simple-secret-key-for-school',
            { expiresIn: '7d' }
        );

        // Send success response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                contact: user.contact,
                address: user.address,
                zone_id: user.zone_id,
                zone_name: user.zone_name,
                profile_picture: user.profile_picture
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

module.exports = router;
