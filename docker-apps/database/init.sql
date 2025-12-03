-- Initial database setup for Blog App
-- 
-- NOTE: User creation and database creation are handled automatically
-- by MySQL Docker image via environment variables:
--   - MYSQL_DATABASE: Creates the database
--   - MYSQL_USER: Creates the user
--   - MYSQL_PASSWORD: Sets user password
--   - MYSQL_ROOT_PASSWORD: Sets root password
--
-- This file is executed when the MySQL container is first created.
-- Use this file ONLY for additional custom SQL setup if needed.
--
-- Database tables will be created by SQLAlchemy migrations in the backend.

SELECT 'Database initialized - ready for migrations' AS message;
