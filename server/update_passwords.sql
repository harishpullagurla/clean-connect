-- Quick update script to change passwords to plain text
-- WARNING: This is NOT secure! Only for development/testing

USE clean_connect;

-- Update all passwords to plain text
UPDATE users SET password = 'admin123' WHERE role = 'Admin';
UPDATE users SET password = 'worker123' WHERE role = 'Worker';
UPDATE users SET password = 'user123' WHERE role = 'User';

SELECT 'Passwords updated successfully!' as message;
