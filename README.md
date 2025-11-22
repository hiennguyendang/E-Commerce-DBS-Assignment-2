# Shopeelike E‑Commerce Platform

Full‑stack mini e‑commerce project for CO2013 – Database Systems Assignment 2.

- Frontend: React (Create React App) in `frontend/`
- Backend: Node.js/Express + MySQL in `backend/`
- Database: MySQL schema `shopeelike` in `database/`

This README tập trung vào **hướng dẫn chạy project** (setup DB, backend, frontend). Thông tin chi tiết hơn về cấu trúc và tiến độ được mô tả trong `AGENTS.md`.

---

## 1. Quick Start

### 1.1. Yêu cầu môi trường

- Node.js >= 16
- npm (hoặc yarn)
- MySQL Server >= 8.0 (chạy trên `localhost`)

---

### 1.2. Bước 1 – Setup Database `shopeelike`

Ở thư mục gốc repo:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce
setup-database.bat
```

Script sẽ hỏi:

- MySQL username (thường là `root`)
- MySQL password
- Database name (mặc định: `shopeelike`)

Và tự động:

- Drop + tạo lại database `shopeelike`
- Import schema từ `database/shopeelike.sql`
- Import dữ liệu mẫu từ `database/mockup_data_shopeelike.sql`

#### (Tuỳ chọn nhưng nên làm) – Tạo user DB `sManager`

Vẫn ở thư mục gốc, mở MySQL client với quyền root:

```bat
mysql -u root -p
```

Trong MySQL prompt:

```sql
SOURCE ./database/scripts/create_smanager_user.sql;
```

Script này sẽ tạo user:

- User: `sManager`
- Password: `sManager123!`
- Quyền: `ALL PRIVILEGES` trên database `shopeelike`.

Sau khi chạy xong bạn có thể thoát MySQL bằng `EXIT;`.

---

### 1.3. Bước 2 – Setup Backend

```bat
cd backend
npm install
copy .env.example .env
```

Mở file `backend/.env` và chỉnh thông tin kết nối DB (khuyến nghị dùng `sManager`):

```env
DB_HOST=localhost
DB_USER=sManager
DB_PASSWORD=sManager123!
DB_NAME=shopeelike
DB_PORT=3306

PORT=5000
JWT_SECRET=your_super_secret_key_here_change_in_production_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
```

Chạy backend ở chế độ dev:

```bat
npm run dev
```

Backend sẽ chạy tại:

- Base URL: `http://localhost:5000`
- API base: `http://localhost:5000/api`

---

### 1.4. Bước 3 – Setup Frontend

Mở terminal mới:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce\frontend
npm install
npm start
```

Frontend sẽ chạy tại:

- `http://localhost:3000`

Ứng dụng frontend mặc định trỏ tới backend qua biến môi trường:

- `frontend/.env.example`:

  ```env
  REACT_APP_API_URL=http://localhost:5000/api
  ```

Nếu backend chạy port khác, cập nhật lại giá trị này rồi restart frontend.

---

## 2. Tài khoản test

Sau khi chạy `setup-database.bat` và seed dữ liệu mới:

- **Seller demo**
  - Email: `seller1@demo.com`
  - Password: `password123`
  - Vai trò: seller (có 3 sản phẩm demo, dashboard seller, thống kê gọi stored procedure)

- **Buyer demo** (tạo sẵn trong seed mới)
  - Email: `buyer1@demo.com`
  - Password: `password123`
  - Có thể dùng để:
    - Đăng nhập với vai trò customer
    - Thêm sản phẩm vào giỏ, đặt hàng, xem lịch sử đơn hàng

Bạn cũng có thể đăng ký thêm buyer mới trực tiếp từ giao diện `/register`.

---

## 3. Cách chạy nhanh cả backend + frontend từ root

Ở thư mục gốc repo, sau khi đã cài đặt dependencies (`npm run install-all`):

```bat
npm run dev
```

Script này sẽ:

- Chạy backend dev (`cd backend && npm run dev`)
- Chạy frontend dev (`cd frontend && npm start`)

Một số script hữu ích khác trong `package.json` (root):

- `npm run server` – chỉ chạy backend dev
- `npm run client` – chỉ chạy frontend dev
- `npm run build` – build frontend cho production
- `npm run install-all` – cài dependency cho backend + frontend

---

## 4. Cấu trúc project (tóm tắt)

```text
E-Commerce/
├── database/
│   ├── shopeelike.sql              # Schema chính (DDL)
│   ├── mockup_data_shopeelike.sql  # Dữ liệu mẫu (DML)
│   ├── scripts/                    # Script tiện ích (tạo sManager, buyer demo, ...)
│   └── archive/                    # Schema/data cũ (không dùng nữa)
├── backend/
│   ├── src/
│   │   ├── server.js               # Entry point Express
│   │   ├── config/database.js      # Kết nối MySQL (dùng .env)
│   │   ├── middleware/auth.js      # JWT + load user từ user_account/seller/admin
│   │   ├── routes/
│   │   │   ├── auth.js             # Đăng ký/đăng nhập, profile
│   │   │   ├── products.js         # API sản phẩm
│   │   │   ├── categories.js       # API danh mục
│   │   │   ├── cart.js             # API giỏ hàng
│   │   │   ├── orders.js           # API đơn hàng
│   │   │   ├── seller.js           # API cho seller (quản lý shop)
│   │   │   ├── admin.js            # API cho admin
│   │   │   └── reports.js          # API gọi stored procedure (thống kê seller)
│   │   └── ...
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Router chính + Toast
│   │   ├── pages/                  # Home, Login, Register, Cart, Checkout, Orders, Seller, Admin...
│   │   ├── components/             # Layout, common, auth, product, cart...
│   │   └── utils/                  # api.js, axiosConfig.js
│   ├── .env.example
│   └── package.json
├── AGENTS.md                       # Tài liệu chi tiết cho agent & tiến độ assignment
└── README.md                       # File bạn đang đọc
```

---

## 5. Ghi chú thêm cho Assignment 2

Thông tin này đã được mô tả kỹ trong `AGENTS.md`, nhưng tóm tắt:

- **Part 1 – Create Database**
  - `shopeelike.sql` chứa toàn bộ DDL (PK, FK, CHECK, trigger, cột computed, ...).
  - `mockup_data_shopeelike.sql` seed đủ dữ liệu để chạy app thực (seller, nhiều buyer, products, orders...).

- **Part 2 – Functions/Procedures/Triggers**
  - Đầy đủ ≥2 function, ≥2 stored procedure, ≥2 trigger, có validation, GROUP BY/HAVING, IF + SIGNAL.

- **Part 3 – Application**
  - App web (React) + API (Express) kết nối MySQL qua user `sManager`.
  - Giao diện login/logout, CRUD đối tượng, list/filter, cart + checkout, seller/admin dashboard.
  - Có endpoint `/api/reports/seller/stats` gọi stored procedure `sp_get_seller_stats` và hiển thị kết quả trên Seller Dashboard.

Khi viết report nộp bài, bạn có thể lấy nội dung/ý chính từ `AGENTS.md` và README này để mô tả cách setup và demo.

