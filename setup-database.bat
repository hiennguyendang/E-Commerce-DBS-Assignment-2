@echo off
echo ============================================
echo     DATABASE SETUP FOR SHOPEELIKE
echo ============================================

echo.
echo This script will help you set up the database for Shopeelike E-Commerce
echo.

REM Get MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD="Enter MySQL password: "

set /p DB_NAME="Enter database name (default: shopeelike): "
if "%DB_NAME%"=="" set DB_NAME=shopeelike

echo.
echo ============================================
echo Setting up database...
echo ============================================

REM Create database and import schema
echo [1/3] Creating database...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to create database. Please check your MySQL credentials.
    pause
    exit /b 1
)

echo ✅ Database created successfully!

echo [2/3] Importing schema...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < database/shopeelike.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to import schema.
    pause
    exit /b 1
)

echo ✅ Schema imported successfully!

echo [3/3] Importing sample data...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < database/mockup_data_shopeelike.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to import sample data.
    pause
    exit /b 1
)

echo ✅ Sample data imported successfully!

echo.
echo ============================================
echo Database setup completed! 🎉
echo ============================================
echo.
echo Database: %DB_NAME%
echo Username: %MYSQL_USER%
echo.
echo Sample accounts created:
echo 👑 Admin: admin@shopeelike.com (password: 123456)
echo 🏪 Seller: seller1@techstore.com (password: 123456)
echo 🛒 Customer: customer1@gmail.com (password: 123456)
echo.
echo Don't forget to update your backend/.env file with these credentials:
echo DB_HOST=localhost
echo DB_USER=%MYSQL_USER%
echo DB_PASSWORD=%MYSQL_PASSWORD%
echo DB_NAME=%DB_NAME%
echo.

pause
