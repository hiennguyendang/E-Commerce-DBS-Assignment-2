@echo off
chcp 65001 >nul
echo ============================================
echo     MSSQL DATABASE SETUP FOR SHOPEELIKE
echo ============================================

echo.
echo This script will help you set up the database for Shopeelike E-Commerce (MSSQL)
echo.

set /p DB_SERVER="Enter MSSQL Server (default: localhost): "
if "%DB_SERVER%"=="" set DB_SERVER=localhost

echo.
echo Choose Authentication Method:
echo [1] SQL Server Authentication (User/Password)
echo [2] Windows Authentication (Current User)
set /p AUTH_CHOICE="Enter choice (1 or 2, default 1): "
if "%AUTH_CHOICE%"=="" set AUTH_CHOICE=1

if "%AUTH_CHOICE%"=="2" (
    set AUTH_FLAGS=-E
    echo Using Windows Authentication...
) else (
    set /p DB_USER="Enter MSSQL username (default: sa): "
    if "%DB_USER%"=="" set DB_USER=sa
    set /p DB_PASSWORD="Enter MSSQL password: "
    set AUTH_FLAGS=-U %DB_USER% -P "%DB_PASSWORD%"
)

set /p DB_NAME="Enter database name (default: shopeelike): "
if "%DB_NAME%"=="" set DB_NAME=shopeelike

echo.
echo ============================================
echo Setting up database...
echo ============================================

REM Create database if not exists
echo [1/3] Creating database...
sqlcmd -S %DB_SERVER% %AUTH_FLAGS% -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '%DB_NAME%') BEGIN CREATE DATABASE [%DB_NAME%]; END"

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to create database. Please check your credentials.
    pause
    exit /b 1
)

echo ✅ Database created/checked successfully!

echo [2/3] Importing schema...
sqlcmd -S %DB_SERVER% %AUTH_FLAGS% -d %DB_NAME% -i database/shopeelike_mssql.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to import schema.
    pause
    exit /b 1
)

echo ✅ Schema imported successfully!

echo [3/3] Importing sample data...
sqlcmd -S %DB_SERVER% %AUTH_FLAGS% -d %DB_NAME% -i database/mockup_data_shopeelike_mssql.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to import sample data.
    pause
    exit /b 1
)

echo ✅ Sample data imported successfully!

echo.
echo ============================================
echo   DATABASE SETUP COMPLETE! ✓
echo ============================================
echo.
echo Please update your backend/.env file with the MSSQL credentials.
echo.
pause
