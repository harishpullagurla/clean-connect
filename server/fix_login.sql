-- Run this if login is not working
-- Copy and paste this entire file into phpMyAdmin SQL tab

USE clean_connect;

UPDATE users SET password = 'admin' WHERE email = 'admin';
UPDATE users SET password = 'worker' WHERE email = 'worker';
UPDATE users SET password = 'user' WHERE email = 'user';

SELECT 'Login fixed! Try: admin/admin or worker/worker or user/user' as Result;
