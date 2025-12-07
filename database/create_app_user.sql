USE shopeelike;
GO

-- 1. Create Login (Server Level) if not exists
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'shopee_user')
BEGIN
    CREATE LOGIN shopee_user WITH PASSWORD = 'Password123!';
END
GO

-- 2. Create User (Database Level) if not exists
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'shopee_user')
BEGIN
    CREATE USER shopee_user FOR LOGIN shopee_user;
END
GO

-- 3. Grant Permissions
ALTER ROLE db_owner ADD MEMBER shopee_user;
GO

-- 4. Create assignment-required DBA user sManager with full rights
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'sManager')
BEGIN
    CREATE LOGIN sManager WITH PASSWORD = 'Password123!';
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'sManager')
BEGIN
    CREATE USER sManager FOR LOGIN sManager;
END
GO

ALTER ROLE db_owner ADD MEMBER sManager;
GO

-- 5. Create application account for sManager so it can log in via UI
DECLARE @smanager_uid BIGINT;

IF NOT EXISTS (SELECT 1 FROM dbo.user_account WHERE email = 'smanager@demo.com')
BEGIN
    INSERT INTO dbo.user_account (email, password_hash, display_name, user_name, phone_number, date_of_birth, status)
    VALUES (
        'smanager@demo.com',
        '$2a$12$O/1osvM/.D8u6QVH3Zn2eul3SC1ZxUyqLYf357qRaCQqDY1ZK82XS', -- password: 123
        N'System Manager',
        'smanager',
        '+840123456789',
        '1990-01-01',
        N'Active'
    );
    SET @smanager_uid = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @smanager_uid = user_id FROM dbo.user_account WHERE email = 'smanager@demo.com';
END

-- Attach admin role for UI authorization
IF NOT EXISTS (SELECT 1 FROM dbo.admin WHERE user_id = @smanager_uid)
BEGIN
    INSERT INTO dbo.admin (user_id, role) VALUES (@smanager_uid, N'SystemAdmin');
END
GO
