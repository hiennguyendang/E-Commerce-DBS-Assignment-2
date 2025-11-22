-- Create DB user 'sManager' with full access to shopeelike database
-- Run this script as a DBA/root user.

CREATE USER IF NOT EXISTS 'sManager'@'localhost' IDENTIFIED BY 'sManager123!';
GRANT ALL PRIVILEGES ON shopeelike.* TO 'sManager'@'localhost';
FLUSH PRIVILEGES;

