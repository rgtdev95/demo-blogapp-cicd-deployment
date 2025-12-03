-- MySQL Initialization Script for Blog App
-- This script runs automatically when MySQL container is first created
-- It ensures the application user is created with proper authentication

-- The MYSQL_USER environment variable creates a user, but we need to ensure
-- it uses mysql_native_password authentication for compatibility with aiomysql

-- Note: The database and user are already created by MySQL Docker image
-- via environment variables, but we need to ensure proper authentication method

-- Ensure the user exists with mysql_native_password authentication
-- This is idempotent - won't fail if user already exists
SET @user_exists = (SELECT COUNT(*) FROM mysql.user WHERE User = '${MYSQL_USER}' AND Host = '%');

-- Only create if doesn't exist (though Docker should have created it)
SET @create_user_sql = IF(@user_exists = 0,
    CONCAT('CREATE USER IF NOT EXISTS ''', '${MYSQL_USER}', '''@''%'' IDENTIFIED WITH mysql_native_password BY ''', '${MYSQL_PASSWORD}', ''';'),
    'SELECT ''User already exists'' AS message;'
);

PREPARE stmt FROM @create_user_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure user has proper authentication method (update if needed)
ALTER USER IF EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_PASSWORD}';

-- Grant all privileges on the application database
GRANT ALL PRIVILEGES ON `${MYSQL_DATABASE}`.* TO '${MYSQL_USER}'@'%';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Verify setup
SELECT 
    User, 
    Host, 
    plugin AS 'Auth Plugin',
    'User created and configured successfully' AS Status
FROM mysql.user 
WHERE User = '${MYSQL_USER}';

SELECT 'Database initialization complete - ready for application' AS message;
