DROP DATABASE IF EXISTS shopeelike;
CREATE DATABASE shopeelike CHARACTER SET utf8mb4;
USE shopeelike;

SET sql_mode = 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION';

-- ========================= USERS & ROLES =========================
CREATE TABLE user_account (
  user_id       BIGINT UNSIGNED AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(80)  NOT NULL,
  user_name     VARCHAR(50)  NOT NULL,
  phone_number  VARCHAR(20),
  date_of_birth DATE         NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('Active','Suspended') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (user_id),
  UNIQUE (email),
  UNIQUE (user_name)
) ENGINE=InnoDB;

CREATE TABLE buyer (
  user_id BIGINT UNSIGNED,
  loyalty_level ENUM('Bronze','Silver','Gold','Platinum') DEFAULT 'Bronze',
  PRIMARY KEY (user_id),
  CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng sequence tạo số thứ tự an toàn (mỗi INSERT tăng 1)
CREATE TABLE seller_id_seq (
  seq INT UNSIGNED NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (seq)
) ENGINE=InnoDB;

-- -- PK là chuỗi 'SEL001', 'SEL002', ...
CREATE TABLE seller (
  seller_id  CHAR(6) NOT NULL,            -- PK là chuỗi: 'SEL001', 'SEL002',...
  user_id    BIGINT UNSIGNED NOT NULL,
  shop_name  VARCHAR(120) NOT NULL,
  tax_id     VARCHAR(20),
  joined_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  PRIMARY KEY (seller_id),
  UNIQUE (shop_name),
  UNIQUE (tax_id),
  CHECK (seller_id REGEXP '^SEL[0-9]{3}$'),
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Trigger tạo seller_id tự động khi seller_id không có giá trị
DELIMITER $$
CREATE TRIGGER bi_seller_gen_id
BEFORE INSERT ON seller
FOR EACH ROW
BEGIN
  IF NEW.seller_id IS NULL OR NEW.seller_id = '' THEN
    INSERT INTO seller_id_seq VALUES (NULL);        -- lấy số mới
    SET @n := LAST_INSERT_ID();                     -- số vừa sinh (theo session)
    SET NEW.seller_id = CONCAT('SEL', LPAD(@n,3,'0'));  -- Định dạng: 'SEL001', 'SEL002', ...
  END IF;
END$$
DELIMITER ;

CREATE TABLE admin (
  user_id BIGINT UNSIGNED,
  role ENUM('SystemAdmin','ContentModerator','SupportAgent','FinanceOfficer','OpsManager') NOT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================= CATALOG ===========================
CREATE TABLE category (
  category_id BIGINT UNSIGNED AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  parent_id   BIGINT UNSIGNED NULL,
  PRIMARY KEY (category_id),
  UNIQUE (name),
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES category(category_id)
) ENGINE=InnoDB;

CREATE TABLE product (
  product_id  BIGINT UNSIGNED AUTO_INCREMENT,
  seller_id   CHAR(6) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status      ENUM('Active','Hidden','Banned') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (product_id),
  CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES seller(seller_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE product_category (
  product_id  BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_p FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_c FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_variant (
  product_id   BIGINT UNSIGNED NOT NULL,
  variant_code VARCHAR(20)     NOT NULL,
  sku          VARCHAR(40)     NOT NULL,
  list_price   DECIMAL(12,2)   NOT NULL,
  stock_qty    INT             NOT NULL DEFAULT 0,
  is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
  PRIMARY KEY (product_id, variant_code),
  UNIQUE (sku),
  CHECK (list_price >= 0),
  CHECK (stock_qty >= 0),
  CONSTRAINT fk_var_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_image (
  image_id   BIGINT UNSIGNED AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  url        VARCHAR(255) NOT NULL,
  caption    VARCHAR(120),
  PRIMARY KEY (image_id),
  CHECK (url REGEXP '^(https?://).+'),
  CONSTRAINT fk_img_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ADDRESS (cho Buyer HOẶC Seller – dùng XOR)
CREATE TABLE address (
  address_id     BIGINT UNSIGNED AUTO_INCREMENT,
  buyer_id       BIGINT UNSIGNED NULL,
  seller_id      CHAR(6)        NULL,
  recipient_name VARCHAR(80) NOT NULL,
  phone          VARCHAR(20) NOT NULL,
  line1          VARCHAR(120) NOT NULL,
  line2          VARCHAR(120),
  ward           VARCHAR(80),
  district       VARCHAR(80),
  city           VARCHAR(80),
  province       VARCHAR(80),
  country        VARCHAR(80) NOT NULL DEFAULT 'VN',
  postal_code    VARCHAR(20),
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (address_id),
  CHECK ( ((buyer_id IS NOT NULL) + (seller_id IS NOT NULL)) = 1 ),
  CHECK (CHAR_LENGTH(line1) > 0),
  CONSTRAINT fk_addr_buyer  FOREIGN KEY (buyer_id)  REFERENCES buyer(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_addr_seller FOREIGN KEY (seller_id) REFERENCES seller(seller_id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- SHIPPING SERVICE
CREATE TABLE shipping_service (
  service_id   SMALLINT UNSIGNED AUTO_INCREMENT,
  carrier      VARCHAR(50)  NOT NULL,
  service_name VARCHAR(80)  NOT NULL,
  est_days_min INT NOT NULL,
  est_days_max INT NOT NULL,
  base_fee     DECIMAL(10,2) NOT NULL,
  per_kg_fee   DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id),
  CHECK (est_days_max >= est_days_min),
  CHECK (base_fee >= 0 AND per_kg_fee >= 0)
) ENGINE=InnoDB;

-- CART
CREATE TABLE cart (
  cart_id    BIGINT UNSIGNED AUTO_INCREMENT,
  buyer_id   BIGINT UNSIGNED NOT NULL,
  status     ENUM('Active','CheckedOut','Abandoned') NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id),
  CONSTRAINT fk_cart_buyer FOREIGN KEY (buyer_id) REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_item (
  cart_id      BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  variant_code VARCHAR(20)     NOT NULL,
  qty          INT             NOT NULL,
  added_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id, product_id, variant_code),
  CHECK (qty > 0),
  CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)               REFERENCES cart(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_variant FOREIGN KEY (product_id, variant_code) REFERENCES product_variant(product_id, variant_code) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ORDERS: có ShipTo (Buyer) & ShipFrom (Seller)
CREATE TABLE orders (
  order_id             BIGINT UNSIGNED AUTO_INCREMENT,
  buyer_id             BIGINT UNSIGNED NOT NULL,
  ship_to_address_id   BIGINT UNSIGNED NOT NULL,
  ship_from_address_id BIGINT UNSIGNED NOT NULL,
  service_id           SMALLINT UNSIGNED NOT NULL,
  shipping_fee         DECIMAL(12,2) NOT NULL DEFAULT 0,
  order_date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status               ENUM('Pending','Paid','Packing','Shipped','Completed','Cancelled','Refunded') NOT NULL DEFAULT 'Pending',
  total_amount         DECIMAL(14,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id),
  CHECK (total_amount >= 0),
  CHECK (shipping_fee >= 0),
  CONSTRAINT fk_order_buyer     FOREIGN KEY (buyer_id)             REFERENCES buyer(user_id),
  CONSTRAINT fk_order_ship_to   FOREIGN KEY (ship_to_address_id)   REFERENCES address(address_id),
  CONSTRAINT fk_order_ship_from FOREIGN KEY (ship_from_address_id) REFERENCES address(address_id),
  CONSTRAINT fk_order_service   FOREIGN KEY (service_id)           REFERENCES shipping_service(service_id)
) ENGINE=InnoDB;

CREATE TABLE order_item (
  order_id     BIGINT UNSIGNED NOT NULL,
  line_no      INT             NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  variant_code VARCHAR(20)     NOT NULL,
  qty          INT             NOT NULL,
  unit_price   DECIMAL(12,2)   NOT NULL,
  line_total   DECIMAL(14,2)   AS (qty * unit_price) STORED,
  PRIMARY KEY (order_id, line_no),
  CHECK (qty > 0),
  CHECK (unit_price >= 0),
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)               REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_variant FOREIGN KEY (product_id, variant_code) REFERENCES product_variant(product_id, variant_code)
) ENGINE=InnoDB;

-- VOUCHERS
CREATE TABLE voucher (
  voucher_id      BIGINT UNSIGNED AUTO_INCREMENT,
  code            VARCHAR(20) NOT NULL,
  title           VARCHAR(150) NOT NULL,
  start_at        DATETIME NOT NULL,
  end_at          DATETIME NOT NULL,
  discount_type   ENUM('Percent','Fixed') NOT NULL,
  discount_value  DECIMAL(12,2) NOT NULL,
  min_order_value DECIMAL(12,2) DEFAULT 0,
  stackable       BOOLEAN NOT NULL DEFAULT TRUE,
  max_uses_per_buyer INT DEFAULT NULL,
  PRIMARY KEY (voucher_id),
  UNIQUE (code),
  CHECK (end_at > start_at),
  CHECK (discount_value > 0)
) ENGINE=InnoDB;

CREATE TABLE voucher_product (
  voucher_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (voucher_id, product_id),
  CONSTRAINT fk_vp_v FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id) ON DELETE CASCADE,
  CONSTRAINT fk_vp_p FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE voucher_seller (
  voucher_id BIGINT UNSIGNED NOT NULL,
  seller_id  CHAR(6) NOT NULL,
  PRIMARY KEY (voucher_id, seller_id),
  CONSTRAINT fk_vs_v FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id) ON DELETE CASCADE,
  CONSTRAINT fk_vs_s FOREIGN KEY (seller_id)  REFERENCES seller(seller_id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE voucher_category (
  voucher_id  BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (voucher_id, category_id),
  CONSTRAINT fk_vc_v FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id) ON DELETE CASCADE,
  CONSTRAINT fk_vc_c FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_voucher (
  order_id       BIGINT UNSIGNED NOT NULL,
  voucher_id     BIGINT UNSIGNED NOT NULL,
  applied_amount DECIMAL(14,2) NOT NULL,
  applied_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id, voucher_id),
  CHECK (applied_amount >= 0),
  CONSTRAINT fk_ov_o FOREIGN KEY (order_id)   REFERENCES orders(order_id)   ON DELETE CASCADE,
  CONSTRAINT fk_ov_v FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- REVIEWS
CREATE TABLE review (
  review_id  BIGINT UNSIGNED AUTO_INCREMENT,
  order_id   BIGINT UNSIGNED NOT NULL,
  line_no    INT NOT NULL,
  buyer_id   BIGINT UNSIGNED NOT NULL,
  rating     INT NOT NULL,
  content    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE (order_id, line_no),
  CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_rv_oi    FOREIGN KEY (order_id, line_no) REFERENCES order_item(order_id, line_no) ON DELETE CASCADE,
  CONSTRAINT fk_rv_buyer FOREIGN KEY (buyer_id)          REFERENCES buyer(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SHIPMENT 1–1 với ORDER
CREATE TABLE shipment (
  shipment_id  BIGINT UNSIGNED AUTO_INCREMENT,
  order_id     BIGINT UNSIGNED NOT NULL,
  tracking_no  VARCHAR(40) NOT NULL,
  weight_kg    DECIMAL(10,3) NOT NULL DEFAULT 0,
  status       ENUM('Ready','Shipping','Delivered','Returned','Cancelled') NOT NULL DEFAULT 'Ready',
  shipped_at   DATETIME NULL,
  delivered_at DATETIME NULL,
  PRIMARY KEY (shipment_id),
  UNIQUE (order_id),
  CHECK (weight_kg >= 0),
  CHECK (delivered_at IS NULL OR (shipped_at IS NOT NULL AND delivered_at > shipped_at)),
  CONSTRAINT fk_shp_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- (Tuỳ chọn) CHỈ MỤC GỢI Ý
CREATE INDEX ix_product_seller ON product(seller_id);
CREATE INDEX ix_addr_buyer    ON address(buyer_id, is_default);
CREATE INDEX ix_addr_seller   ON address(seller_id, is_default);
CREATE INDEX ix_order_buyer   ON orders(buyer_id);
CREATE INDEX ix_oi_product    ON order_item(product_id, variant_code);

-- ============================================================
-- STORED FUNCTIONS
-- ============================================================

DELIMITER $$
CREATE FUNCTION fn_monthly_revenue(p_year INT, p_month INT)
RETURNS DECIMAL(14,2)
DETERMINISTIC
BEGIN
  DECLARE v_total DECIMAL(14,2);

  IF p_month < 1 OR p_month > 12 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid month. Must be between 1 and 12.';
  END IF;

  SELECT COALESCE(SUM(total_amount), 0)
    INTO v_total
  FROM orders
  WHERE YEAR(order_date) = p_year
    AND MONTH(order_date) = p_month
    AND status IN ('Paid','Packing','Shipped','Completed');

  RETURN v_total;
END$$

CREATE FUNCTION fn_seller_total_sold(p_seller_id CHAR(6))
RETURNS BIGINT
DETERMINISTIC
BEGIN
  DECLARE v_exists INT;
  DECLARE v_total BIGINT;

  SELECT COUNT(*) INTO v_exists
  FROM seller
  WHERE seller_id = p_seller_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Seller does not exist.';
  END IF;

  SELECT COALESCE(SUM(oi.qty), 0)
    INTO v_total
  FROM orders o
  JOIN order_item oi ON oi.order_id = o.order_id
  JOIN product p ON p.product_id = oi.product_id
  WHERE p.seller_id = p_seller_id
    AND o.status IN ('Paid','Packing','Shipped','Completed');

  RETURN v_total;
END$$
DELIMITER ;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$
CREATE PROCEDURE sp_get_orders_by_status(IN p_status VARCHAR(20))
BEGIN
  /*
    Returns a list of orders with basic buyer info,
    optionally filtered by status ('ALL' for no filter).
  */
  SELECT 
    o.order_id,
    o.order_date,
    o.status,
    o.total_amount,
    ua.email       AS buyer_email,
    ua.display_name AS buyer_name
  FROM orders o
  JOIN buyer b         ON b.user_id = o.buyer_id
  JOIN user_account ua ON ua.user_id = b.user_id
  WHERE (p_status IS NULL OR p_status = '' OR p_status = 'ALL' OR o.status = p_status)
  ORDER BY o.order_date DESC;
END$$

CREATE PROCEDURE sp_get_seller_monthly_revenue(
  IN p_seller_id CHAR(6),
  IN p_year INT
)
BEGIN
  /*
    Returns monthly revenue for a seller in a given year.
    Demonstrates GROUP BY and HAVING with input parameters.
  */
  DECLARE v_exists INT;

  SELECT COUNT(*) INTO v_exists
  FROM seller
  WHERE seller_id = p_seller_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Seller does not exist.';
  END IF;

  SELECT 
    MONTH(o.order_date) AS month,
    SUM(oi.line_total)  AS revenue
  FROM orders o
  JOIN order_item oi ON oi.order_id = o.order_id
  JOIN product p     ON p.product_id = oi.product_id
  WHERE p.seller_id = p_seller_id
    AND YEAR(o.order_date) = p_year
    AND o.status IN ('Paid','Packing','Shipped','Completed')
  GROUP BY MONTH(o.order_date)
  HAVING SUM(oi.line_total) > 0
  ORDER BY month;
END$$

CREATE PROCEDURE sp_get_seller_stats(
  IN p_seller_id CHAR(6)
)
BEGIN
  /*
    Returns aggregated stats for a seller:
    - number of active products
    - number of orders containing seller products
    - total revenue from those orders
  */
  DECLARE v_exists INT;

  SELECT COUNT(*) INTO v_exists
  FROM seller
  WHERE seller_id = p_seller_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Seller does not exist.';
  END IF;

  SELECT
    (SELECT COUNT(*) 
       FROM product 
      WHERE seller_id = p_seller_id 
        AND status = 'Active') AS products,
    (SELECT COUNT(DISTINCT o.order_id)
       FROM orders o
       JOIN order_item oi ON oi.order_id = o.order_id
       JOIN product p     ON p.product_id = oi.product_id
      WHERE p.seller_id = p_seller_id) AS orders,
    (SELECT COALESCE(SUM(oi.line_total), 0)
       FROM orders o
       JOIN order_item oi ON oi.order_id = o.order_id
       JOIN product p     ON p.product_id = oi.product_id
      WHERE p.seller_id = p_seller_id
        AND o.status IN ('Paid','Packing','Shipped','Completed')) AS revenue;
END$$
DELIMITER ;

-- ============================================================
-- ADDITIONAL TRIGGERS
-- ============================================================

DELIMITER $$
CREATE TRIGGER ai_order_item_update_total
AFTER INSERT ON order_item
FOR EACH ROW
BEGIN
  /*
    Keep orders.total_amount in sync with the sum of line_total
    from order_item plus shipping_fee.
  */
  UPDATE orders o
  JOIN (
    SELECT order_id, SUM(line_total) AS subtotal
    FROM order_item
    WHERE order_id = NEW.order_id
    GROUP BY order_id
  ) t ON t.order_id = o.order_id
  SET o.total_amount = t.subtotal + o.shipping_fee;
END$$
DELIMITER ;
