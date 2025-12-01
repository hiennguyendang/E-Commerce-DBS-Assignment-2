# Shopzada E‑Commerce Platform

Full‑stack mini e‑commerce project for CO2013 – Database Systems Assignment 2.

- Frontend: React (Create React App) – `frontend/`
- Backend: Node.js/Express – `backend/`
- Database (this branch): **Microsoft SQL Server** with T‑SQL schema `database/shopeelike_mssql.sql`

> Lưu ý: branch hiện tại (`feature/mssql-compat`) đã được **port từ MySQL sang SQL Server** để phù hợp yêu cầu mới.  
> Các file MySQL gốc (`shopeelike.sql`, `mockup_data_shopeelike.sql`, `setup-database.bat`) vẫn giữ lại để tham khảo, nhưng khi demo nên dùng hướng dẫn chạy với SQL Server bên dưới.

README này tập trung vào **hướng dẫn chạy project** (setup DB, backend, frontend) trên SQL Server.  
Thông tin chi tiết hơn về cấu trúc và tiến độ có thể được mô tả thêm trong `AGENTS.md` (nếu có).

---

## 1. Quick Start – SQL Server

### 1.1. Yêu cầu môi trường

- Node.js >= 16
- npm (hoặc yarn)
- Microsoft SQL Server (Developer/Express) chạy trên `localhost,1433`
- SQLCMD (cài kèm SQL Server / ODBC)

---

### 1.2. Bước 1 – Setup database `shopeelike` (SQL Server)

Ở thư mục gốc repo:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce-DBS-Assignment-2
```

1. Tạo database + schema (T‑SQL):

```bat
sqlcmd -S localhost,1433 -U sa -P YourSAPassword -i database\shopeelike_mssql.sql
```

2. Seed dữ liệu mẫu cho assignment:

```bat
sqlcmd -S localhost,1433 -U sa -P YourSAPassword -d shopeelike -i database\mockup_data_shopeelike_mssql.sql
```

> Nếu bạn đã tạo login `shopeelike_user / Shopeelike123!` với quyền trên DB `shopeelike` thì có thể dùng user đó thay cho `sa` trong 2 lệnh trên.

---

### 1.3. Bước 2 – Setup backend

```bat
cd backend
npm install
copy .env.example .env
```

Mở file `backend/.env` và chỉnh thông tin kết nối **SQL Server**:

```env
DB_HOST=localhost
DB_USER=shopeelike_user
DB_PASSWORD=Shopeelike123!
DB_NAME=shopeelike
DB_PORT=1433

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

### 1.4. Bước 3 – Setup frontend

Mở terminal mới:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce-DBS-Assignment-2\frontend
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

Nếu backend chạy ở port khác, cập nhật lại giá trị này rồi restart frontend.

---

## 2. Tài khoản test

Sau khi seed dữ liệu bằng `shopeelike_mssql.sql` + `mockup_data_shopeelike_mssql.sql`:

- **Seller demo**
  - Email: `seller1@demo.com`
  - Password: `password123`
  - Vai trò: Seller (có nhiều sản phẩm demo, Seller Dashboard, thống kê gọi stored procedure).

- **Admin demo**
  - Email: `admin1@demo.com`
  - Password: `password123`
  - Vai trò: Admin (quản lý user, sản phẩm, đơn hàng).

- **Buyer demo**
  - Email: `buyer1@demo.com`
  - Email: `buyer2@demo.com`
  - Email: `buyer3@demo.com`
  - Password (cùng dùng): `password123`
  - Có thể dùng để:
    - Đăng nhập với vai trò Customer
    - Thêm sản phẩm vào giỏ, đặt hàng, xem lịch sử đơn hàng

Ngoài ra, có thể đăng ký thêm Buyer mới trực tiếp từ màn hình `/register`.

---

## 3. Chạy nhanh cả backend + frontend từ root (tuỳ chọn)

Nếu bạn muốn thêm script tổng hợp (tuỳ bài nộp), có thể dùng lệnh riêng để chạy cả hai.  
Trong branch hiện tại, nên chạy từng phần như mục 1.3 và 1.4 để dễ debug.

---

## 4. Cấu trúc project (tóm tắt)

```text
E-Commerce-DBS-Assignment-2/
├── database/
│   ├── shopeelike.sql                   # Schema MySQL gốc (tham khảo)
│   ├── mockup_data_shopeelike.sql       # Dữ liệu mẫu MySQL gốc
│   ├── shopeelike_mssql.sql             # Schema T‑SQL cho SQL Server (đang dùng)
│   ├── mockup_data_shopeelike_mssql.sql # Dữ liệu mẫu cho SQL Server (đang dùng)
│   └── scripts/                         # Script tiện ích (nếu có)
├── backend/
│   ├── src/
│   │   ├── server.js                    # Entry point Express
│   │   ├── config/database.js           # Kết nối SQL Server (dùng .env)
│   │   ├── middleware/auth.js           # JWT + load user từ user_account/seller/admin
│   │   └── routes/
│   │       ├── auth.js                  # Đăng ký/đăng nhập, profile
│   │       ├── products.js              # API sản phẩm (SQL Server)
│   │       ├── categories.js            # API danh mục
│   │       ├── cart.js                  # API giỏ hàng
│   │       ├── orders.js                # API đơn hàng
│   │       ├── seller.js                # API cho seller (quản lý shop, đơn hàng)
│   │       ├── admin.js                 # API cho admin
│   │       └── reports.js               # API gọi stored procedure (thống kê seller)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                       # Router chính + layout
│   │   ├── pages/                       # Home, Login, Register, Cart, Checkout, Orders, Seller, Admin...
│   │   ├── components/                  # Layout, common, auth, product, cart...
│   │   └── utils/                       # axiosConfig, helpers
│   ├── .env.example
│   └── package.json
├── 251_DB_Assignment_2 (1).pdf          # Đề bài assignment
├── README.md                            # File hướng dẫn hiện tại
└── (các file tiện ích khác)
```

---

## 5. Ghi chú cho Assignment 2

- **Part 1 – Create Database**
  - `shopeelike_mssql.sql` chứa đầy đủ DDL (PK, FK, CHECK, trigger, computed column, sequence…).
  - `mockup_data_shopeelike_mssql.sql` seed dữ liệu đủ phong phú (seller, nhiều buyer, products, orders, cart, voucher, review, shipment) để demo app.

- **Part 2 – Functions / Procedures / Triggers**
  - Ít nhất 2 function (`fn_monthly_revenue`, `fn_seller_total_sold`), 2 stored procedure (`sp_get_orders_by_status`, `sp_get_seller_monthly_revenue`, `sp_get_seller_stats`), 3 trigger (`tr_seller_gen_id`, `tr_cart_set_updated_at`, `tr_order_item_update_total`) đáp ứng yêu cầu đề.

- **Part 3 – Application**
  - App web (React) + API (Express) kết nối SQL Server qua user `shopeelike_user`.
  - Giao diện login/logout, CRUD sản phẩm cho seller, giỏ hàng + checkout cho buyer, dashboard cho seller/admin.
  - Endpoint `/api/reports/seller/stats` gọi stored procedure `sp_get_seller_stats` và hiển thị kết quả trên Seller Dashboard.

Khi viết report nộp bài, có thể trích nội dung/ý chính từ README này để mô tả cách setup, kịch bản demo và các thành phần đã triển khai.

