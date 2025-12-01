# 🚀 HƯỚNG DẪN CHẠY PROJECT E-COMMERCE (MSSQL VERSION)

Dự án này đã được cập nhật để hỗ trợ **Microsoft SQL Server**. Dưới đây là các bước chi tiết để cài đặt và chạy dự án.

---

## 🛠️ YÊU CẦU HỆ THỐNG
1.  **Node.js**: Phiên bản 16 trở lên.
2.  **Microsoft SQL Server**: Đã cài đặt và đang chạy (bản Developer hoặc Express đều được).
3.  **SQLCMD**: Công cụ dòng lệnh của SQL Server (thường đi kèm khi cài SQL Server).

---

## 📋 BƯỚC 1: THIẾT LẬP DATABASE (TỰ ĐỘNG)

Chúng tôi đã chuẩn bị sẵn script để tự động tạo database và nạp dữ liệu mẫu.

1.  Mở terminal tại thư mục gốc của dự án (`E-Commerce-DBS-Assignment-2`).
2.  Chạy file script sau:

```powershell
.\setup-database-mssql.bat
```

3.  **Nhập thông tin khi được hỏi**:
    *   **Server**: Thường là `localhost` hoặc `.\SQLEXPRESS`.
    *   **Authentication**:
        *   Chọn `1` nếu dùng tài khoản `sa` (cần nhập password).
        *   Chọn `2` nếu dùng **Windows Authentication** (không cần password, khuyến nghị cho máy cá nhân).
    *   **Database Name**: Để mặc định là `shopeelike`.

✅ **Kết quả**: Script sẽ tạo database, tạo bảng (schema) và nạp dữ liệu mẫu (100 sản phẩm, user, đơn hàng...).

---

## 📋 BƯỚC 2: CÀI ĐẶT VÀ CHẠY BACKEND

### 2.1. Cài đặt thư viện
```powershell
cd backend
npm install
```

### 2.2. Cấu hình kết nối (.env)
File `.env` đã được cấu hình sẵn nếu bạn dùng script ở Bước 1. Nếu cần chỉnh sửa thủ công, nội dung file `backend/.env` sẽ như sau:

```env
# Database Configuration (MSSQL)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=shopeelike

# Nếu dùng User/Pass (SQL Auth)
DB_USER=shopee_user
DB_PASSWORD=Password123!

# Server Configuration
PORT=5000
JWT_SECRET=your_super_secret_key_here_change_in_production_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
```

### 2.3. Chạy Server
```powershell
npm run dev
```
Nếu thấy thông báo `SQL Server connected successfully` là thành công!

---

## 📋 BƯỚC 3: CÀI ĐẶT VÀ CHẠY FRONTEND

### 3.1. Cài đặt thư viện
Mở một terminal **mới** (giữ terminal Backend đang chạy) và di chuyển vào thư mục frontend:
```powershell
cd frontend
npm install
```

### 3.2. Chạy ứng dụng (Website)
**Quan trọng:** Đảm bảo bạn đang ở trong thư mục `frontend` (đường dẫn kết thúc bằng `\frontend`).
```powershell
# Nếu chưa vào thư mục frontend thì gõ: cd frontend
npm start
```
> **Lưu ý:** Nếu bạn chạy `npm start` ở thư mục gốc, nó sẽ cố khởi động lại Backend và gây lỗi "Address already in use".

Trình duyệt sẽ tự động mở tại địa chỉ: `http://localhost:3000`

---

## 🧪 TÀI KHOẢN DÙNG THỬ (TEST ACCOUNTS)

Dữ liệu mẫu đã bao gồm các tài khoản sau để bạn test các quyền hạn khác nhau:

| Vai trò (Role) | Email | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Người mua (Buyer)** | `buyer1@demo.com` | `password123` | Mua hàng, xem đơn hàng, đánh giá |
| **Người bán (Seller)** | `seller1@demo.com` | `password123` | Quản lý shop, đăng sản phẩm |
| **Quản trị (Admin)** | `admin@shopeelike.com` | `admin123` | Xem thống kê toàn sàn, quản lý user |

---

## ❓ CÁC LỖI THƯỜNG GẶP

**1. Lỗi "Login failed for user 'sa'" ở Bước 1?**
*   Hãy thử chọn **Option 2 (Windows Authentication)** khi chạy script setup.
*   Hoặc kiểm tra lại password `sa` của bạn.

**2. Lỗi "EADDRINUSE: address already in use :::5000"?**
*   Bạn đang chạy 2 lần Backend. Hãy tắt bớt một terminal đang chạy `npm run dev`.

**3. Lỗi kết nối Database ở Backend?**
*   Kiểm tra xem SQL Server có đang chạy không (vào Services > SQL Server).
*   Kiểm tra TCP/IP đã được bật chưa (trong SQL Server Configuration Manager).
