@echo off
echo ============================================
echo   SETUP DATABASE FOR E-COMMERCE PROJECT
echo ============================================
echo.

REM Tìm MySQL trong các đường dẫn phổ biến
set MYSQL_PATH=
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
)
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe
)
if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe
)
if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
)
if exist "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe" (
    set MYSQL_PATH=C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe
)

if "%MYSQL_PATH%"=="" (
    echo [ERROR] Khong tim thay MySQL!
    echo.
    echo Hay thu mot trong cac cach sau:
    echo 1. Mo MySQL Workbench va import file SQL thu cong
    echo 2. Them MySQL vao PATH
    echo 3. Su dung PowerShell voi lenh:
    echo    Get-Content shopeelike.sql ^| mysql -u root -p
    echo.
    pause
    exit /b 1
)

echo [OK] Tim thay MySQL tai: %MYSQL_PATH%
echo.

REM Chuyển đến thư mục database
cd /d "%~dp0"

echo Step 1: Import schema (shopeelike.sql)...
echo Nhap password MySQL cua ban:
"%MYSQL_PATH%" -u root -p < shopeelike.sql
if %errorlevel% neq 0 (
    echo [ERROR] Import schema that bai!
    pause
    exit /b 1
)
echo [OK] Schema imported successfully!
echo.

echo Step 2: Import seed data (mockup_data_shopeelike.sql)...
echo Nhap password MySQL cua ban lan nua:
"%MYSQL_PATH%" -u root -p shopeelike < mockup_data_shopeelike.sql
if %errorlevel% neq 0 (
    echo [ERROR] Import seed data that bai!
    pause
    exit /b 1
)
echo [OK] Seed data imported successfully!
echo.

echo ============================================
echo   DATABASE SETUP HOAN THANH!
echo ============================================
echo.
echo Tai khoan co san:
echo - Email: seller1@demo.com
echo - Password: password123
echo.
echo Tiep theo:
echo 1. cd ..\backend
echo 2. npm install
echo 3. copy .env.example .env
echo 4. Sua DB_PASSWORD trong file .env
echo 5. npm run dev
echo.
pause
