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

### 2.1. Tài khoản Seller

| Email | Password | Mô tả |
|-------|----------|-------|
| seller1@demo.com | 123 | Tech Store - Shop công nghệ, có nhiều sản phẩm điện tử và ô tô |
| seller2@demo.com | 123 | Fashion Hub - Shop thời trang |
| seller3@demo.com | 123 | Home Decor Plus - Shop nội thất |
| seller4@demo.com | 123 | Book World - Shop sách văn phòng phẩm |
| seller5@demo.com | 123 | Sports Pro - Shop thể thao và thú cưng |

**Chức năng Seller Dashboard:**
- Quản lý sản phẩm (thêm, sửa, xóa)
- Quản lý đơn hàng của shop (xem chi tiết, cập nhật trạng thái)
- Xem thống kê doanh thu theo tháng (gọi stored procedure `sp_get_seller_monthly_revenue`)
- Quản lý yêu cầu hoàn trả từ khách hàng
- Cập nhật trạng thái đơn hàng (Shipped, Completed) - tự động ghi nhận ngày gửi hàng và ngày giao hàng

### 2.2. Tài khoản Admin

| Email | Password | Vai trò |
|-------|----------|---------|
| admin1@demo.com | 123 | System Admin |
| admin2@demo.com | 123 | Content Moderator |
| admin3@demo.com | 123 | Support Agent |
| admin4@demo.com | 123 | Finance Officer |

**Chức năng Admin Dashboard:**
- Quản lý người dùng (xem, tìm kiếm, xóa)
- Quản lý sản phẩm (duyệt, chỉnh sửa, xóa)
- Quản lý đơn hàng (xem tất cả, chi tiết, cập nhật trạng thái)
- Quản lý đánh giá (xem, lọc theo rating, xóa đánh giá không phù hợp)
- Thống kê tổng quan: users, sellers, products, orders, revenue, orders by status

### 2.3. Tài khoản Buyer

| Email | Password | Thông tin |
|-------|----------|-----------|
| buyer1@demo.com | 123 | Minh Nguyen - Silver member |
| buyer2@demo.com | 123 | Lan Tran - Bronze member |
| buyer3@demo.com | 123 | Quang Le - Gold member |
| buyer4@demo.com | 123 | Hoa Pham - Platinum member |

**Chức năng Buyer:**
- Xem danh mục sản phẩm, lọc theo category, giá, tìm kiếm
- Thêm sản phẩm vào giỏ hàng
- Chọn địa chỉ giao hàng (hoặc thêm địa chỉ mới)
- Chọn đơn vị vận chuyển (5 carriers: DefaultCarrier, VNPost, GHN, J&T Express, Grab Express)
- Đặt hàng và thanh toán
- Xem lịch sử đơn hàng (bao gồm ngày đặt, ngày gửi hàng, ngày giao hàng)
- Đánh giá sản phẩm đã mua (chỉ với đơn hàng Completed)
- Yêu cầu hoàn trả sản phẩm

**Lưu ý:** Ngoài ra có thể tự đăng ký buyer mới từ màn hình `/register` hoặc đăng ký seller từ `/seller-register`.

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
- `database/mockup_data_shopeelike_mssql.sql` seed dữ liệu phong phú gồm:
  - 5 sellers với shop riêng
  - 4 buyers với loyalty levels khác nhau
  - 4 admins với roles khác nhau
  - 110+ products thuộc 10 categories (Electronics, Fashion, Home & Living, Books, Sports, Automotive, Pet Supplies, ...)
  - 5 shipping services với giá và thời gian giao hàng khác nhau
  - Orders mẫu với nhiều trạng thái (Pending, Paid, Shipped, Completed)
  - Reviews, cart items, addresses, shipments, invoices, payments

### Part 2 – Functions / Procedures / Triggers

Trong schema SQL Server có đầy đủ các yêu cầu:

#### **Functions**
- `fn_monthly_revenue(@p_year INT, @p_month INT)` – tính tổng doanh thu theo tháng/năm, có `IF` kiểm tra tham số hợp lệ.
- `fn_seller_total_sold(@p_seller_id CHAR(6))` – tính tổng số lượng sản phẩm đã bán của 1 seller, có kiểm tra seller tồn tại.

#### **Stored Procedures**
- `sp_get_orders_by_status(@p_status NVARCHAR(20) = NULL)` – truy vấn orders + buyer + user_account, dùng `WHERE` + `ORDER BY` trên nhiều bảng.
- `sp_get_seller_monthly_revenue(@p_seller_id CHAR(6), @p_year INT)` – GROUP BY tháng, `SUM(oi.line_total)`, `HAVING` > 0, kiểm tra tham số, dùng `THROW` khi seller không tồn tại.
- `sp_get_seller_stats(@p_seller_id CHAR(6))` – nhiều subquery với `COUNT`, `SUM`, join >= 2 bảng, dùng tham số trong `WHERE`.

#### **Triggers**
- `tr_seller_gen_id` – INSTEAD OF INSERT ON `seller`, tự sinh `seller_id` dạng `SEL001`, `SEL002`, … ⇒ ví dụ trigger sinh **derived column**.
- `tr_cart_set_updated_at` – AFTER UPDATE ON `cart`, tự set `updated_at = SYSDATETIME()`.
- `tr_order_item_update_total` – AFTER INSERT ON `order_item`, cập nhật `orders.total_amount = SUM(order_item.line_total) + shipping_fee`.
- `tr_cart_item_limit_qty` – AFTER INSERT/UPDATE ON `cart_item`, không cho phép `qty > 50`, nếu vi phạm thì `THROW` lỗi ⇒ trigger enforce **business rule**.

Các object trên bao trùm đủ yêu cầu đề bài: WHERE/ORDER BY trên nhiều bảng, GROUP BY + HAVING, IF/THROW, validation tham số, derived column và business rule.

### Part 3 – Application

Web app full-stack với các tính năng chính:

#### **Kiến trúc**
- **Frontend:** React 18 + Vite, Bootstrap 5, Axios
- **Backend:** Node.js + Express, JWT authentication, bcrypt password hashing
- **Database:** Microsoft SQL Server 2022 với mssql driver
- **Deployment:** Docker Compose orchestrating 4 containers (mssql, db-init, backend, frontend)

#### **Chức năng chính đã triển khai**

**Buyer Features:**
- Đăng ký / đăng nhập với JWT authentication
- Xem danh mục sản phẩm với filter (category, price range) và pagination
- Tìm kiếm sản phẩm theo tên
- Xem chi tiết sản phẩm với variant, images, reviews
- Thêm sản phẩm vào giỏ hàng
- Quản lý giỏ hàng (cập nhật số lượng, xóa item)
- Chọn địa chỉ giao hàng (hoặc tạo địa chỉ mới)
- **Chọn đơn vị vận chuyển** với 5 carriers và giá tính động
- Đặt hàng với shipping fee tự động tính vào tổng tiền
- Xem lịch sử đơn hàng với **timeline đầy đủ** (ngày đặt, ngày gửi, ngày giao)
- Xem thông tin **người gửi (shop)** và **người nhận** trong chi tiết đơn hàng
- Đánh giá sản phẩm (1-5 sao + nội dung) cho đơn hàng Completed
- Xem lại đánh giá đã viết (read-only mode)
- Yêu cầu hoàn trả sản phẩm với lý do chi tiết

**Seller Features:**
- Dashboard thống kê tổng quan (doanh thu, đơn hàng, sản phẩm)
- Quản lý sản phẩm (CRUD operations)
- Upload/quản lý hình ảnh sản phẩm
- Quản lý variants (SKU, giá, tồn kho)
- Xem đơn hàng của shop với filter theo status
- **Cập nhật trạng thái đơn hàng** (Shipped, Completed)
  - Tự động ghi nhận `shipped_date` khi chuyển sang Shipped
  - Tự động ghi nhận `delivered_date` khi chuyển sang Completed
- Xem biểu đồ doanh thu theo tháng (sử dụng `sp_get_seller_monthly_revenue`)
- Quản lý yêu cầu hoàn trả từ khách hàng
- Cập nhật địa chỉ kho hàng (ship_from_address)

**Admin Features:**
- Dashboard tổng quan hệ thống (users, sellers, products, orders, revenue)
- Quản lý người dùng (xem, tìm kiếm, xóa)
- Quản lý sản phẩm toàn hệ thống (duyệt, chỉnh sửa, xóa)
- Quản lý đơn hàng (xem tất cả, filter, cập nhật status)
- **Quản lý đánh giá:**
  - Xem danh sách reviews với pagination
  - Thống kê (tổng số, rating trung bình, phân bố rating)
  - Filter theo rating (1-5 sao)
  - Tìm kiếm theo tên sản phẩm hoặc buyer
  - Xóa đánh giá không phù hợp
- Thống kê orders by status (Pending, Paid, Shipped, Completed, ...)

#### **Tích hợp Database Features**

- **Stored Procedures:** API `/api/reports/seller/stats` gọi `sp_get_seller_stats` để hiển thị thống kê seller
- **Functions:** Sử dụng trong queries để tính toán doanh thu
- **Triggers:** Tự động hoạt động khi INSERT/UPDATE (seller_id auto-gen, cart updated_at, order total calculation)
- **Computed Columns:** `line_total` trong order_item tự động tính từ `qty * unit_price`

#### **Tính năng nổi bật**

1. **Shipping System hoàn chỉnh:**
   - 5 đơn vị vận chuyển với pricing khác nhau
   - Tính phí ship dựa trên base_fee + per_kg_fee
   - Hiển thị thời gian giao hàng ước tính (est_days_min - est_days_max)
   - Lưu carrier_name và service_name vào đơn hàng

2. **Order Tracking Timeline:**
   - `order_date`: Khi khách đặt hàng
   - `shipped_date`: Khi seller đánh dấu đã gửi hàng
   - `delivered_date`: Khi đơn hàng hoàn thành
   - Frontend hiển thị đầy đủ 3 mốc thời gian

3. **Review System:**
   - Review per order item (không phải per product)
   - Chỉ buyer đã mua mới review được
   - Admin có quyền xóa review
   - Hiển thị read-only mode cho review đã viết

4. **Authentication & Authorization:**
   - JWT token với refresh mechanism
   - Role-based access control (Buyer/Seller/Admin)
   - Middleware kiểm tra ownership (chỉ seller của sản phẩm mới sửa được)

---

## 5. API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký buyer mới
- `POST /api/auth/seller-register` - Đăng ký seller
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user

### Products
- `GET /api/products` - Danh sách sản phẩm (filter, search, paginate)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (seller)
- `PUT /api/products/:id` - Cập nhật sản phẩm (seller)

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ
- `PUT /api/cart/items/:id` - Cập nhật số lượng
- `DELETE /api/cart/items/:id` - Xóa khỏi giỏ

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng (bao gồm sender_address, shipped_date, delivered_date)
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (tự động set shipped_date/delivered_date)
- `GET /api/orders/shipping-services` - Danh sách carriers

### Reviews
- `POST /api/reviews` - Tạo đánh giá
- `GET /api/reviews/my-reviews` - Đánh giá của tôi
- `GET /api/admin/reviews` - Admin xem tất cả (filter, search, paginate)
- `GET /api/admin/reviews/stats` - Thống kê đánh giá
- `DELETE /api/admin/reviews/:id` - Admin xóa đánh giá

### Reports (Stored Procedures)
- `GET /api/reports/seller/stats` - Gọi `sp_get_seller_stats`
- `GET /api/reports/seller/monthly-revenue` - Gọi `sp_get_seller_monthly_revenue`

---

## 6. Testing & Demo

### Kịch bản test đầy đủ

1. **Setup:**
   ```bat
   docker compose down -v
   docker compose up -d
   ```

2. **Buyer Flow:**
   - Đăng nhập: buyer1@demo.com / 123
   - Browse products, filter by category
   - Add to cart
   - Checkout, chọn shipping carrier (VNPost, GHN, ...)
   - Place order
   - View order detail → thấy shipping info đầy đủ

3. **Seller Flow:**
   - Đăng nhập: seller1@demo.com / 123
   - View orders của shop
   - Cập nhật order status → Shipped (tự động set shipped_date)
   - Cập nhật order status → Completed (tự động set delivered_date)
   - View monthly revenue chart

4. **Buyer Review:**
   - Quay lại buyer1@demo.com
   - Vào order đã Completed
   - Click "Đánh giá" → viết review
   - Reload → thấy button "Đã đánh giá", click để xem lại

5. **Admin Management:**
   - Đăng nhập: admin1@demo.com / 123
   - View review management
   - Filter by rating, search
   - Delete inappropriate review
   - View dashboard statistics

Khi viết report nộp bài, có thể trích nội dung chính từ README này để mô tả cách setup, kiến trúc và các thành phần đã triển khai.
