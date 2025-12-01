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
