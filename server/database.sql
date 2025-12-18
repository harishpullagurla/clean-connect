-- CLEAN CONNECT Database Schema
-- Smart City Waste Management System

CREATE DATABASE IF NOT EXISTS clean_connect;
USE clean_connect;

-- Users Table (All roles: Admin, Worker, User)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Worker', 'User') NOT NULL,
    contact VARCHAR(20),
    address TEXT,
    zone_id INT,
    profile_picture VARCHAR(255) DEFAULT 'default-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_zone (zone_id)
);

-- Zones Table
CREATE TABLE zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Dustbins Table
CREATE TABLE dustbins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bin_code VARCHAR(50) UNIQUE NOT NULL,
    zone_id INT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('Clean', 'Full', 'Overflowing', 'Maintenance') DEFAULT 'Clean',
    capacity INT DEFAULT 100,
    fill_level INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    INDEX idx_zone (zone_id),
    INDEX idx_status (status)
);

-- Worker Points Table
CREATE TABLE worker_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    total_points INT DEFAULT 0,
    rank_position INT,
    badge ENUM('Gold', 'Silver', 'Bronze', 'None') DEFAULT 'None',
    reports_completed INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker (worker_id)
);

-- Worker Assignments Table
CREATE TABLE worker_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    bin_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bin_id) REFERENCES dustbins(id) ON DELETE CASCADE,
    INDEX idx_worker (worker_id),
    INDEX idx_bin (bin_id)
);

-- Reports Table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bin_id INT NOT NULL,
    zone_id INT NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255),
    status ENUM('Pending', 'In Progress', 'Resolved', 'Reopened') DEFAULT 'Pending',
    assigned_worker_id INT,
    accepted_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bin_id) REFERENCES dustbins(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_zone (zone_id),
    INDEX idx_worker (assigned_worker_id)
);

-- Alerts Table
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    worker_id INT NOT NULL,
    zone_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Ignored') DEFAULT 'Pending',
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    INDEX idx_worker (worker_id),
    INDEX idx_status (status),
    INDEX idx_visible (is_visible)
);

-- Report History Table (Timeline)
CREATE TABLE report_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Insert Sample Data

-- Insert Zones
INSERT INTO zones (name, description) VALUES
('North Zone', 'Northern district of the city'),
('South Zone', 'Southern district of the city'),
('East Zone', 'Eastern district of the city'),
('West Zone', 'Western district of the city');

-- Insert Admin Users (Simple Login: admin / admin)
INSERT INTO users (name, email, password, role, contact, address, zone_id) VALUES
('Admin User', 'admin', 'admin', 'Admin', '9876543210', 'North Zone Office', 1),
('Sarah Manager', 'admin@southzone.com', 'admin', 'Admin', '9876543211', 'South Zone Office', 2);

-- Update zone admin references
UPDATE zones SET admin_id = 1 WHERE id = 1;
UPDATE zones SET admin_id = 2 WHERE id = 2;

-- Insert Workers (Simple Login: worker / worker)
INSERT INTO users (name, email, password, role, contact, address, zone_id) VALUES
('Worker User', 'worker', 'worker', 'Worker', '9876543220', 'North Zone', 1),
('Amit Singh', 'amit', 'worker', 'Worker', '9876543221', 'North Zone', 1),
('Priya Sharma', 'priya', 'worker', 'Worker', '9876543222', 'South Zone', 2);

-- Insert Regular Users (Simple Login: user / user)
INSERT INTO users (name, email, password, role, contact, address) VALUES
('Citizen User', 'user', 'user', 'User', '9876543230', 'Sector 5, North Zone'),
('Anjali Patel', 'anjali', 'user', 'User', '9876543231', 'Area 12, South Zone');

-- Insert Dustbins
INSERT INTO dustbins (bin_code, zone_id, location, latitude, longitude, status, fill_level) VALUES
('NZ-001', 1, 'Main Street, North Zone', 28.7041, 77.1025, 'Clean', 20),
('NZ-002', 1, 'Park Avenue, North Zone', 28.7051, 77.1035, 'Full', 80),
('NZ-003', 1, 'School Road, North Zone', 28.7061, 77.1045, 'Clean', 30),
('SZ-001', 2, 'Market Square, South Zone', 28.6941, 77.1125, 'Overflowing', 100),
('SZ-002', 2, 'Station Road, South Zone', 28.6951, 77.1135, 'Clean', 25);

-- Initialize Worker Points
INSERT INTO worker_points (worker_id, total_points, reports_completed) VALUES
(3, 150, 15),
(4, 200, 20),
(5, 100, 10);

-- Calculate initial ranks
UPDATE worker_points wp1
SET rank_position = (
    SELECT COUNT(*) + 1
    FROM worker_points wp2
    WHERE wp2.total_points > wp1.total_points
);

-- Assign badges
UPDATE worker_points SET badge = 'Gold' WHERE rank_position = 1;
UPDATE worker_points SET badge = 'Silver' WHERE rank_position = 2;
UPDATE worker_points SET badge = 'Bronze' WHERE rank_position = 3;

-- Insert Worker Assignments
INSERT INTO worker_assignments (worker_id, bin_id) VALUES
(3, 1), (3, 2), (3, 3),
(4, 1), (4, 2),
(5, 4), (5, 5);

-- Insert Sample Reports
INSERT INTO reports (user_id, bin_id, zone_id, description, status) VALUES
(6, 2, 1, 'Dustbin is almost full and needs immediate attention', 'Pending'),
(7, 4, 2, 'Overflowing dustbin causing smell and attracting flies', 'Pending');
