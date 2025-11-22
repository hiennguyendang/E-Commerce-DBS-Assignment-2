-- Quick database setup for testing
CREATE DATABASE IF NOT EXISTS shopeelike;
USE shopeelike;

-- Create a simple test table
CREATE TABLE IF NOT EXISTS test_connection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO test_connection (message) VALUES ('Database connection successful!');

-- Show result
SELECT * FROM test_connection;