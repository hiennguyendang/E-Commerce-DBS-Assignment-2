# Shopzada E‑Commerce Platform

Mini e‑commerce project for CO2013 – Database Systems Assignment 2.

- Frontend: React (CRA) – `frontend/`
- Backend: Node.js / Express – `backend/`
- Database: **Microsoft SQL Server** using T‑SQL schema `database/shopeelike_mssql.sql`

> Lưu ý: nhánh hiện tại là bản đã port từ MySQL sang SQL Server để phù hợp yêu cầu môn học.  
> Các file MySQL gốc (`shopeelike.sql`, `mockup_data_shopeelike.sql`, `setup-database.bat`) vẫn được giữ lại để tham khảo, nhưng khi demo nên chạy bản SQL Server ở đây.

README này tập trung vào **hướng dẫn chạy project** (DB + backend + frontend).  
Thông tin chi tiết hơn về cấu trúc / convention có thể xem thêm trong `AGENTS.md` (nếu có).

---

## 0. Quick Start – Docker (đề xuất)

Đây là cách **nhanh nhất** để chạy full stack (SQL Server + backend + frontend) mà không cần cài SQL Server / Node riêng lẻ.

### 0.1. Yêu cầu môi trường

- Docker Desktop (hoặc Docker Engine tương đương)
- Đã bật WSL2 backend trên Windows (nếu Docker yêu cầu)

### 0.2. Chạy toàn bộ hệ thống bằng Docker

Ở thư mục gốc repo:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce-DBS-Assignment-2
docker compose up --build
```

Docker Compose sẽ khởi động các service sau (xem `docker-compose.yml`):

- `mssql` – SQL Server 2022 (port `1433`)
- `db-init` – container một lần để:
  - tạo DB `shopeelike`
  - chạy `database/shopeelike_mssql.sql` (schema)
  - chạy `database/mockup_data_shopeelike_mssql.sql` (mock data)
  - chạy `database/create_app_user.sql` (tạo login `shopee_user` / `Password123!` và cấp quyền)
- `backend` – API Node/Express (port `5000`), kết nối tới `mssql`
- `frontend` – React (port `3000`), gọi API ở `http://localhost:5000/api`

Chờ tới khi log hiển thị:

- `Database initialized.` (từ `shopeelike-db-init`)
- `SHOPEELIKE BACKEND SERVER STARTED` (từ `shopeelike-backend`)

Sau đó mở trình duyệt:

- Frontend: `http://localhost:3000/app`
- API health: `http://localhost:5000/api/health`

### 0.3. Dừng / reset dữ liệu

- Dừng container nhưng **giữ lại** dữ liệu database (volume `mssql_data`):

  ```bat
  docker compose down
  ```

- Dừng container **và xoá dữ liệu DB** (reset hoàn toàn, seed lại mock data từ đầu):

  ```bat
  docker compose down -v
  docker compose up --build
  ```

Khi đã dùng Docker, **không cần** chạy lại các bước manual ở mục 1 (tạo DB thủ công bằng `sqlcmd`, `npm run dev`, `npm start`). Mục 1 chỉ dành cho trường hợp muốn chạy native không dùng Docker.

---

## 1. Quick Start – SQL Server native (tùy chọn)

Nếu bạn muốn chạy mọi thứ trực tiếp trên máy (không Docker), có thể dùng các bước dưới.

### 1.1. Yêu cầu môi trường

- Node.js >= 16
- npm (hoặc yarn)
- Microsoft SQL Server (Developer/Express) chạy trên `localhost,1433`
- `sqlcmd` (cài cùng SQL Server hoặc ODBC)

### 1.2. Bước 1 – Tạo database `shopeelike`

Tại thư mục gốc repo:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce-DBS-Assignment-2
```

1. Tạo database + schema (T‑SQL):

```bat
sqlcmd -S localhost,1433 -U sa -P YourSAPassword -i database\shopeelike_mssql.sql
```

2. Seed dữ liệu mẫu:

```bat
sqlcmd -S localhost,1433 -U sa -P YourSAPassword -d shopeelike -i database\mockup_data_shopeelike_mssql.sql
```

> Có thể tạo riêng login `shopeelike_user / Shopeelike123!` và cấp quyền trên DB `shopeelike`, sau đó thay `sa` bằng user này trong lệnh `sqlcmd`.

### 1.3. Bước 2 – Backend

```bat
cd backend
npm install
copy .env.example .env
```

Sửa file `backend/.env` để trỏ vào SQL Server:

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

Backend chạy tại:

- Base URL: `http://localhost:5000`
- API base: `http://localhost:5000/api`

### 1.4. Bước 3 – Frontend

Mở terminal khác:

```bat
cd C:\Users\HAD\Desktop\DB\E-Commerce-DBS-Assignment-2\frontend
npm install
npm start
```

Frontend chạy tại `http://localhost:3000`.

Frontend sử dụng biến môi trường:

- `frontend/.env.example`:

  ```env
  REACT_APP_API_URL=http://localhost:5000/api
  ```

Nếu backend đổi port, cập nhật lại URL này rồi `npm start` lại.

---

## 2. Tài khoản demo

Sau khi seed dữ liệu bằng `shopeelike_mssql.sql` + `mockup_data_shopeelike_mssql.sql` (hoặc docker `db-init`), bạn có sẵn:

- **Seller demo**
  - Email: `seller1@demo.com`
  - Password: `password123`
  - Vai trò: Seller (nhiều sản phẩm demo, Seller Dashboard, thống kê gọi stored procedure).

- **Admin demo**
  - Email: `admin1@demo.com`
  - Password: `password123`
  - Vai trò: Admin (quản lý user, sản phẩm, đơn hàng).

- **Buyer demo**
  - Email: `buyer1@demo.com`
  - Email: `buyer2@demo.com`
  - Email: `buyer3@demo.com`
  - Password (giống nhau): `password123`
  - Có thể dùng để:
    - Đăng ký / đăng nhập role Customer
    - Thêm sản phẩm vào giỏ, đặt hàng, xem lịch sử đơn

Ngoài ra có thể tự đăng ký buyer mới từ màn hình `/register`.

---

## 3. Cấu trúc project (tóm tắt)

```text
E-Commerce-DBS-Assignment-2/
├─ database/
│  ├─ shopeelike.sql                      # Schema MySQL gốc (tham khảo)
│  ├─ mockup_data_shopeelike.sql         # Mock data MySQL gốc
│  ├─ shopeelike_mssql.sql               # Schema T‑SQL cho SQL Server (đang dùng)
│  ├─ mockup_data_shopeelike_mssql.sql   # Mock data cho SQL Server (đang dùng)
│  ├─ create_app_user.sql                # Tạo login / user shopee_user cho MSSQL
│  └─ scripts/                           # Script tiện ích
│
├─ backend/
│  ├─ src/
│  │  ├─ server.js                       # Entry point Express
│  │  ├─ config/database.js              # Kết nối SQL Server (mssql + .env)
│  │  ├─ middleware/auth.js              # JWT + load user (buyer/seller/admin)
│  │  └─ routes/
│  │     ├─ auth.js                      # Đăng ký / đăng nhập, profile
│  │     ├─ products.js                  # API sản phẩm (filter, paginate)
│  │     ├─ categories.js                # API danh mục
│  │     ├─ cart.js                      # API giỏ hàng
│  │     ├─ orders.js                    # API đơn hàng
│  │     ├─ seller.js                    # API cho seller (quản lý shop, orders)
│  │     ├─ admin.js                     # API admin (users, products, orders)
│  │     └─ reports.js                   # API gọi stored procedure (thống kê seller)
│  ├─ Dockerfile
│  └─ .env.example
│
├─ frontend/
│  ├─ src/
│  │  ├─ App.js / App.jsx                # Router & layout chính
│  │  ├─ pages/                          # Home, Login, Register, Cart, Checkout, Orders, Seller, Admin...
│  │  ├─ components/                     # Layout, auth, product, cart, common...
│  │  └─ utils/                          # axiosConfig, helpers
│  ├─ Dockerfile
│  └─ .env.example
│
├─ docker-compose.yml                    # Orchestrate mssql + db-init + backend + frontend
└─ README.md                             # File hướng dẫn hiện tại
```

---

## 4. Ghi chú cho Assignment 2 (tóm tắt)

### Part 1 – Create Database

- `database/shopeelike_mssql.sql` chứa đầy đủ DDL: PK, FK, CHECK, computed column, sequence, trigger…
- `database/mockup_data_shopeelike_mssql.sql` seed dữ liệu phong phú: seller, nhiều buyer, products (multi‑category), orders, cart, voucher, review, shipment…

### Part 2 – Functions / Procedures / Triggers

Trong schema SQL Server có tối thiểu:

- **Functions**
  - `fn_monthly_revenue(@p_year INT, @p_month INT)` – tính tổng doanh thu theo tháng/năm, có `IF` kiểm tra tham số hợp lệ.
  - `fn_seller_total_sold(@p_seller_id CHAR(6))` – tính tổng số lượng sản phẩm đã bán của 1 seller, có kiểm tra seller tồn tại.

- **Stored procedures**
  - `sp_get_orders_by_status(@p_status NVARCHAR(20) = NULL)` – truy vấn orders + buyer + user_account, dùng `WHERE` + `ORDER BY` trên nhiều bảng.
  - `sp_get_seller_monthly_revenue(@p_seller_id CHAR(6), @p_year INT)` – GROUP BY tháng, `SUM(oi.line_total)`, `HAVING` > 0, kiểm tra tham số, dùng `THROW` khi seller không tồn tại.
  - `sp_get_seller_stats(@p_seller_id CHAR(6))` – nhiều subquery với `COUNT`, `SUM`, join >= 2 bảng, dùng tham số trong `WHERE`.

- **Triggers**
  - `tr_seller_gen_id` – INSTEAD OF INSERT ON `seller`, tự sinh `seller_id` dạng `SEL001`, `SEL002`, … ⇒ ví dụ trigger sinh **derived column**.
  - `tr_cart_set_updated_at` – AFTER UPDATE ON `cart`, tự set `updated_at = SYSDATETIME()`.
  - `tr_order_item_update_total` – AFTER INSERT ON `order_item`, cập nhật `orders.total_amount = SUM(order_item.line_total) + shipping_fee`.
  - `tr_cart_item_limit_qty` – AFTER INSERT/UPDATE ON `cart_item`, không cho phép `qty > 50`, nếu vi phạm thì `THROW` lỗi ⇒ trigger enforce **business rule**.

Các object trên bao trùm đủ yêu cầu đề bài: WHERE/ORDER BY trên nhiều bảng, GROUP BY + HAVING, IF/THROW, validation tham số, derived column và business rule.

### Part 3 – Application

- Web app (React) + API (Express) kết nối SQL Server qua user `shopee_user` (trong Docker) hoặc `shopeelike_user` (chạy native).
- UI hỗ trợ:
  - Login/logout, phân quyền Buyer / Seller / Admin.
  - Buyer: xem danh mục, lọc sản phẩm, thêm vào giỏ, đặt hàng, xem lịch sử.
  - Seller: quản lý sản phẩm (CRUD), xem đơn hàng theo shop, dashboard thống kê.
  - Admin: quản lý users, sản phẩm, đơn hàng; xem thống kê tổng quan (users, sellers, products, orders, revenue, orders by status).
- Một số endpoint report dùng stored procedure, ví dụ: `/api/reports/seller/stats` gọi `sp_get_seller_stats` và hiển thị trên Seller Dashboard.

Khi viết report nộp bài, có thể trích nội dung chính từ README này để mô tả cách setup, kiến trúc và các thành phần đã triển khai. 
*** End Patch*** }?>
