
IF DB_ID('shopeelike') IS NOT NULL
BEGIN
    ALTER DATABASE shopeelike SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE shopeelike;
END;
GO

CREATE DATABASE shopeelike;
GO

USE shopeelike;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

----------------------------------------------------
-- USERS & ROLES
----------------------------------------------------

CREATE TABLE dbo.user_account (
    user_id       BIGINT IDENTITY(1,1) NOT NULL,
    email         NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    display_name  NVARCHAR(80)  NOT NULL,
    user_name     NVARCHAR(50)  NOT NULL,
    phone_number  NVARCHAR(20)  NULL,
    date_of_birth DATE          NOT NULL,
    created_at    DATETIME2(0)  NOT NULL CONSTRAINT DF_user_account_created_at DEFAULT SYSDATETIME(),
    status        NVARCHAR(20)  NOT NULL CONSTRAINT DF_user_account_status DEFAULT N'Active',
    CONSTRAINT PK_user_account PRIMARY KEY (user_id),
    CONSTRAINT UQ_user_account_email UNIQUE (email),
    CONSTRAINT UQ_user_account_user_name UNIQUE (user_name),
    CONSTRAINT CK_user_account_status CHECK (status IN (N'Active', N'Suspended'))
);
GO

CREATE TABLE dbo.buyer (
    user_id       BIGINT NOT NULL,
    loyalty_level NVARCHAR(20) NULL CONSTRAINT DF_buyer_loyalty DEFAULT N'Bronze',
    CONSTRAINT PK_buyer PRIMARY KEY (user_id),
    CONSTRAINT FK_buyer_user FOREIGN KEY (user_id) REFERENCES dbo.user_account(user_id) ON DELETE CASCADE,
    CONSTRAINT CK_buyer_loyalty CHECK (loyalty_level IN (N'Bronze', N'Silver', N'Gold', N'Platinum'))
);
GO

CREATE TABLE dbo.admin (
    user_id BIGINT NOT NULL,
    role    NVARCHAR(30) NOT NULL,
    CONSTRAINT PK_admin PRIMARY KEY (user_id),
    CONSTRAINT FK_admin_user FOREIGN KEY (user_id) REFERENCES dbo.user_account(user_id) ON DELETE CASCADE,
    CONSTRAINT CK_admin_role CHECK (role IN (
        N'SystemAdmin', N'ContentModerator', N'SupportAgent', N'FinanceOfficer', N'OpsManager'
    ))
);
GO

-- Sequence for seller_id (SEL001, SEL002, ...)
CREATE SEQUENCE dbo.seller_seq
    AS INT
    START WITH 1
    INCREMENT BY 1;
GO

CREATE TABLE dbo.seller (
    seller_id  CHAR(6)        NOT NULL,
    user_id    BIGINT         NOT NULL,
    shop_name  NVARCHAR(120)  NOT NULL,
    tax_id     NVARCHAR(20)   NULL,
    business_email NVARCHAR(255) NULL,
    business_phone NVARCHAR(20) NULL,
    business_license_number NVARCHAR(50) NULL,
    is_active  BIT            NOT NULL CONSTRAINT DF_seller_is_active DEFAULT (1),
    joined_at  DATETIME2(0)   NOT NULL CONSTRAINT DF_seller_joined_at DEFAULT SYSDATETIME(),
    rating_avg DECIMAL(3,2)   NOT NULL CONSTRAINT DF_seller_rating_avg DEFAULT (0.00),
    CONSTRAINT PK_seller PRIMARY KEY (seller_id),
    CONSTRAINT UQ_seller_shop_name UNIQUE (shop_name),
    -- CONSTRAINT UQ_seller_tax_id UNIQUE (tax_id), -- Removed to allow multiple NULLs via filtered index
    CONSTRAINT CK_seller_id_format CHECK (seller_id LIKE 'SEL[0-9][0-9][0-9]'),
    CONSTRAINT FK_seller_user FOREIGN KEY (user_id) REFERENCES dbo.user_account(user_id) ON DELETE CASCADE
);
GO

-- Create filtered unique index for tax_id to allow multiple NULLs
CREATE UNIQUE INDEX IX_seller_tax_id ON dbo.seller(tax_id) WHERE tax_id IS NOT NULL;
GO

-- Trigger to auto-generate seller_id when not provided
CREATE TRIGGER dbo.tr_seller_gen_id
ON dbo.seller
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
      @user_id    BIGINT,
      @shop_name  NVARCHAR(120),
      @tax_id     NVARCHAR(20),
      @business_email NVARCHAR(255),
      @business_phone NVARCHAR(20),
      @business_license_number NVARCHAR(50),
      @is_active  BIT,
      @joined_at  DATETIME2(0),
      @rating_avg DECIMAL(3,2),
      @seller_id  CHAR(6),
      @seq        INT;

    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
      SELECT user_id, shop_name, tax_id, business_email, business_phone, business_license_number, is_active, joined_at, rating_avg, seller_id
      FROM inserted;

    OPEN cur;
    FETCH NEXT FROM cur INTO @user_id, @shop_name, @tax_id, @business_email, @business_phone, @business_license_number, @is_active, @joined_at, @rating_avg, @seller_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
      IF @seller_id IS NULL OR @seller_id = ''
      BEGIN
        SET @seq = NEXT VALUE FOR dbo.seller_seq;
        SET @seller_id = 'SEL' + RIGHT('000' + CAST(@seq AS VARCHAR(10)), 3);
      END;

      INSERT INTO dbo.seller (seller_id, user_id, shop_name, tax_id, business_email, business_phone, business_license_number, is_active, joined_at, rating_avg)
      VALUES (
        @seller_id,
        @user_id,
        @shop_name,
        @tax_id,
        @business_email,
        @business_phone,
        @business_license_number,
        ISNULL(@is_active, 1),
        ISNULL(@joined_at, SYSDATETIME()),
        ISNULL(@rating_avg, 0.00)
      );

      FETCH NEXT FROM cur INTO @user_id, @shop_name, @tax_id, @business_email, @business_phone, @business_license_number, @is_active, @joined_at, @rating_avg, @seller_id;
    END;

    CLOSE cur;
    DEALLOCATE cur;
END;
GO

----------------------------------------------------
-- CATALOG
----------------------------------------------------

CREATE TABLE dbo.category (
    category_id BIGINT IDENTITY(1,1) NOT NULL,
    name        NVARCHAR(120) NOT NULL,
    description NVARCHAR(255) NULL,
    parent_id   BIGINT        NULL,
    CONSTRAINT PK_category PRIMARY KEY (category_id),
    CONSTRAINT UQ_category_name UNIQUE (name),
    CONSTRAINT FK_category_parent FOREIGN KEY (parent_id) REFERENCES dbo.category(category_id)
);
GO

CREATE TABLE dbo.product (
    product_id  BIGINT IDENTITY(1,1) NOT NULL,
    seller_id   CHAR(6)        NOT NULL,
    title       NVARCHAR(200)  NOT NULL,
    description NVARCHAR(MAX)  NULL,
    created_at  DATETIME2(0)   NOT NULL CONSTRAINT DF_product_created_at DEFAULT SYSDATETIME(),
    status      NVARCHAR(20)   NOT NULL CONSTRAINT DF_product_status DEFAULT N'Active',
    CONSTRAINT PK_product PRIMARY KEY (product_id),
    CONSTRAINT FK_product_seller FOREIGN KEY (seller_id) REFERENCES dbo.seller(seller_id),
    CONSTRAINT CK_product_status CHECK (status IN (N'Active', N'Hidden', N'Banned'))
);
GO

CREATE TABLE dbo.product_category (
    product_id  BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT PK_product_category PRIMARY KEY (product_id, category_id),
    CONSTRAINT FK_pc_product  FOREIGN KEY (product_id)  REFERENCES dbo.product(product_id)   ON DELETE CASCADE,
    CONSTRAINT FK_pc_category FOREIGN KEY (category_id) REFERENCES dbo.category(category_id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.product_variant (
    product_id   BIGINT        NOT NULL,
    variant_code NVARCHAR(20)  NOT NULL,
    sku          NVARCHAR(40)  NOT NULL,
    list_price   DECIMAL(12,2) NOT NULL,
    stock_qty    INT           NOT NULL CONSTRAINT DF_product_variant_stock_qty DEFAULT (0),
    is_active    BIT           NOT NULL CONSTRAINT DF_product_variant_is_active DEFAULT (1),
    CONSTRAINT PK_product_variant PRIMARY KEY (product_id, variant_code),
    CONSTRAINT UQ_product_variant_sku UNIQUE (sku),
    CONSTRAINT FK_product_variant_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE,
    CONSTRAINT CK_product_variant_list_price CHECK (list_price >= 0),
    CONSTRAINT CK_product_variant_stock_qty CHECK (stock_qty >= 0)
);
GO

CREATE TABLE dbo.product_image (
    image_id   BIGINT IDENTITY(1,1) NOT NULL,
    product_id BIGINT        NOT NULL,
    url        NVARCHAR(255) NOT NULL,
    caption    NVARCHAR(120) NULL,
    CONSTRAINT PK_product_image PRIMARY KEY (image_id),
    CONSTRAINT FK_product_image_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE,
    CONSTRAINT CK_product_image_url CHECK (url LIKE 'http://%' OR url LIKE 'https://%')
);
GO

----------------------------------------------------
-- ADDRESS & SHIPPING
----------------------------------------------------

CREATE TABLE dbo.address (
    address_id     BIGINT IDENTITY(1,1) NOT NULL,
    buyer_id       BIGINT       NULL,
    seller_id      CHAR(6)      NULL,
    recipient_name NVARCHAR(80) NOT NULL,
    phone          NVARCHAR(20) NOT NULL,
    line1          NVARCHAR(120) NOT NULL,
    line2          NVARCHAR(120) NULL,
    ward           NVARCHAR(80)  NULL,
    district       NVARCHAR(80)  NULL,
    city           NVARCHAR(80)  NULL,
    province       NVARCHAR(80)  NULL,
    country        NVARCHAR(80)  NOT NULL CONSTRAINT DF_address_country DEFAULT N'VN',
    postal_code    NVARCHAR(20)  NULL,
    is_default     BIT           NOT NULL CONSTRAINT DF_address_is_default DEFAULT (0),
    CONSTRAINT PK_address PRIMARY KEY (address_id),
    CONSTRAINT FK_address_buyer  FOREIGN KEY (buyer_id)  REFERENCES dbo.buyer(user_id)   ON DELETE CASCADE,
    CONSTRAINT FK_address_seller FOREIGN KEY (seller_id) REFERENCES dbo.seller(seller_id),
    CONSTRAINT CK_address_line1 CHECK (LEN(line1) > 0),
    CONSTRAINT CK_address_buyer_seller_xor CHECK (
        (CASE WHEN buyer_id  IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN seller_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);
GO

CREATE TABLE dbo.shipping_service (
    service_id   SMALLINT IDENTITY(1,1) NOT NULL,
    carrier      NVARCHAR(50) NOT NULL,
    service_name NVARCHAR(80) NOT NULL,
    est_days_min INT NOT NULL,
    est_days_max INT NOT NULL,
    base_fee     DECIMAL(10,2) NOT NULL,
    per_kg_fee   DECIMAL(10,2) NOT NULL CONSTRAINT DF_shipping_service_per_kg_fee DEFAULT (0),
    CONSTRAINT PK_shipping_service PRIMARY KEY (service_id),
    CONSTRAINT CK_shipping_service_days CHECK (est_days_max >= est_days_min),
    CONSTRAINT CK_shipping_service_fee CHECK (base_fee >= 0 AND per_kg_fee >= 0)
);
GO

----------------------------------------------------
-- CART
----------------------------------------------------

CREATE TABLE dbo.cart (
    cart_id    BIGINT IDENTITY(1,1) NOT NULL,
    buyer_id   BIGINT       NOT NULL,
    status     NVARCHAR(20) NOT NULL CONSTRAINT DF_cart_status DEFAULT N'Active',
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_cart_created_at DEFAULT SYSDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_cart_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_cart PRIMARY KEY (cart_id),
    CONSTRAINT FK_cart_buyer FOREIGN KEY (buyer_id) REFERENCES dbo.buyer(user_id) ON DELETE CASCADE,
    CONSTRAINT CK_cart_status CHECK (status IN (N'Active', N'CheckedOut', N'Abandoned'))
);
GO

CREATE TRIGGER dbo.tr_cart_set_updated_at
ON dbo.cart
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE c
    SET updated_at = SYSDATETIME()
    FROM dbo.cart c
    INNER JOIN inserted i ON c.cart_id = i.cart_id;
END;
GO

-- Tự động tạo cart cho buyer mới
CREATE TRIGGER dbo.tr_buyer_create_cart
ON dbo.buyer
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.cart (buyer_id, status)
    SELECT i.user_id, N'Active'
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.cart c WHERE c.buyer_id = i.user_id
    );
END;
GO

CREATE TABLE dbo.cart_item (
    cart_id      BIGINT       NOT NULL,
    product_id   BIGINT       NOT NULL,
    variant_code NVARCHAR(20) NOT NULL,
    qty          INT          NOT NULL,
    added_at     DATETIME2(0) NOT NULL CONSTRAINT DF_cart_item_added_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_cart_item PRIMARY KEY (cart_id, product_id, variant_code),
    CONSTRAINT FK_cart_item_cart FOREIGN KEY (cart_id) REFERENCES dbo.cart(cart_id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_item_variant FOREIGN KEY (product_id, variant_code)
        REFERENCES dbo.product_variant(product_id, variant_code),
    CONSTRAINT CK_cart_item_qty CHECK (qty > 0)
);
GO

----------------------------------------------------
-- ORDERS
----------------------------------------------------

CREATE TABLE dbo.orders (
    order_id             BIGINT IDENTITY(1,1) NOT NULL,
    buyer_id             BIGINT       NOT NULL,
    seller_id            CHAR(6)      NOT NULL,
    ship_to_address_id   BIGINT       NOT NULL,
    ship_from_address_id BIGINT       NOT NULL,
    service_id           SMALLINT     NOT NULL,
    carrier_name         NVARCHAR(50) NULL,
    service_name         NVARCHAR(80) NULL,
    shipping_fee         DECIMAL(12,2) NOT NULL CONSTRAINT DF_orders_shipping_fee DEFAULT (0),
    order_date           DATETIME2(0)  NOT NULL CONSTRAINT DF_orders_order_date DEFAULT SYSDATETIME(),
    shipped_date         DATETIME2(0)  NULL,
    delivered_date       DATETIME2(0)  NULL,
    status               NVARCHAR(20)  NOT NULL CONSTRAINT DF_orders_status DEFAULT N'Pending',
    total_amount         DECIMAL(14,2) NOT NULL CONSTRAINT DF_orders_total_amount DEFAULT (0),
    CONSTRAINT PK_orders PRIMARY KEY (order_id),
    CONSTRAINT FK_orders_buyer     FOREIGN KEY (buyer_id)             REFERENCES dbo.buyer(user_id),
    CONSTRAINT FK_orders_seller    FOREIGN KEY (seller_id)            REFERENCES dbo.seller(seller_id),
    CONSTRAINT FK_orders_ship_to   FOREIGN KEY (ship_to_address_id)   REFERENCES dbo.address(address_id),
    CONSTRAINT FK_orders_ship_from FOREIGN KEY (ship_from_address_id) REFERENCES dbo.address(address_id),
    CONSTRAINT FK_orders_service   FOREIGN KEY (service_id)           REFERENCES dbo.shipping_service(service_id),
    CONSTRAINT CK_orders_total_amount CHECK (total_amount >= 0),
    CONSTRAINT CK_orders_shipping_fee CHECK (shipping_fee >= 0),
    CONSTRAINT CK_orders_status CHECK (status IN (
        N'Pending', N'Paid', N'Packing', N'Shipped', N'Completed', N'Cancelled', N'Refunded'
    ))
);
GO

CREATE TABLE dbo.order_item (
    order_id     BIGINT       NOT NULL,
    line_no      INT          NOT NULL,
    product_id   BIGINT       NOT NULL,
    variant_code NVARCHAR(20) NOT NULL,
    qty          INT          NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    line_total   AS (qty * unit_price) PERSISTED,
    CONSTRAINT PK_order_item PRIMARY KEY (order_id, line_no),
    CONSTRAINT FK_order_item_order   FOREIGN KEY (order_id)               REFERENCES dbo.orders(order_id) ON DELETE CASCADE,
    CONSTRAINT FK_order_item_variant FOREIGN KEY (product_id, variant_code)
        REFERENCES dbo.product_variant(product_id, variant_code),
    CONSTRAINT CK_order_item_qty CHECK (qty > 0),
    CONSTRAINT CK_order_item_unit_price CHECK (unit_price >= 0)
);
GO

----------------------------------------------------
-- RETURNS, INVOICES & PAYMENTS
----------------------------------------------------

CREATE TABLE dbo.return_request (
    return_request_id BIGINT IDENTITY(1,1) NOT NULL,
    order_id          BIGINT NOT NULL,
    line_no           INT NOT NULL,
    buyer_id          BIGINT NOT NULL,
    seller_id         BIGINT NOT NULL,
    reason            NVARCHAR(500) NOT NULL,
    description       NVARCHAR(MAX),
    status            NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    seller_response   NVARCHAR(MAX),
    refund_amount     DECIMAL(10,2),
    request_date      DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    response_date     DATETIME2(0),
    refunded_at       DATETIME2(0),
    
    CONSTRAINT PK_return_request PRIMARY KEY (return_request_id),
    CONSTRAINT UQ_return_request_order_line UNIQUE (order_id, line_no),
    CONSTRAINT FK_return_request_order_item FOREIGN KEY (order_id, line_no) 
        REFERENCES dbo.order_item(order_id, line_no) ON DELETE CASCADE,
    CONSTRAINT FK_return_request_buyer FOREIGN KEY (buyer_id) 
        REFERENCES dbo.user_account(user_id),
    CONSTRAINT FK_return_request_seller FOREIGN KEY (seller_id) 
        REFERENCES dbo.user_account(user_id),
    CONSTRAINT CK_return_request_status CHECK (status IN (
        N'Pending', N'Approved', N'Rejected', N'Processing', N'Completed', N'Cancelled'
    )),
    CONSTRAINT CK_return_request_refund_amount CHECK (refund_amount >= 0),
    CONSTRAINT CK_return_request_dates CHECK (
        (response_date >= request_date OR response_date IS NULL) AND
        (refunded_at >= response_date OR refunded_at IS NULL)
    )
);
GO

CREATE TABLE dbo.invoice (
    invoice_id     BIGINT IDENTITY(1,1) NOT NULL,
    order_id       BIGINT NOT NULL,
    invoice_number NVARCHAR(50) NOT NULL,
    issue_date     DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    due_date       DATETIME2(0),
    
    -- Amounts
    subtotal       DECIMAL(14,2) NOT NULL,
    tax_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(14,2) NOT NULL DEFAULT 0,
    shipping_fee   DECIMAL(12,2) NOT NULL DEFAULT 0,
    grand_total    DECIMAL(14,2) NOT NULL,
    
    -- Invoice type
    invoice_type   NVARCHAR(20) NOT NULL DEFAULT N'Standard',
    
    -- Tax information
    tax_code       NVARCHAR(50),
    company_name   NVARCHAR(255),
    company_address NVARCHAR(500),
    
    -- Status
    payment_status NVARCHAR(20) NOT NULL DEFAULT N'Unpaid',
    
    -- Tracking
    created_at     DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    updated_at     DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT PK_invoice PRIMARY KEY (invoice_id),
    CONSTRAINT UQ_invoice_number UNIQUE (invoice_number),
    CONSTRAINT UQ_invoice_order UNIQUE (order_id),
    CONSTRAINT FK_invoice_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(order_id) ON DELETE CASCADE,
    CONSTRAINT CK_invoice_type CHECK (invoice_type IN (
        N'Standard', N'VAT', N'Export', N'Proforma'
    )),
    CONSTRAINT CK_invoice_payment_status CHECK (payment_status IN (
        N'Unpaid', N'Partial', N'Paid', N'Overdue', N'Cancelled'
    )),
    CONSTRAINT CK_invoice_amounts CHECK (
        subtotal >= 0 AND tax_amount >= 0 AND 
        shipping_fee >= 0 AND grand_total >= 0
    ),
    CONSTRAINT CK_invoice_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100)
);
GO

CREATE TABLE dbo.invoice_item (
    invoice_id   BIGINT NOT NULL,
    line_no      INT NOT NULL,
    product_id   BIGINT NOT NULL,
    variant_code NVARCHAR(20) NOT NULL,
    description  NVARCHAR(500),
    qty          INT NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    
    -- Tax details
    tax_rate     DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Totals (computed columns)
    line_subtotal AS (qty * unit_price) PERSISTED,
    line_total    AS (qty * unit_price + tax_amount) PERSISTED,
    
    CONSTRAINT PK_invoice_item PRIMARY KEY (invoice_id, line_no),
    CONSTRAINT FK_invoice_item_invoice FOREIGN KEY (invoice_id) 
        REFERENCES dbo.invoice(invoice_id) ON DELETE CASCADE,
    CONSTRAINT FK_invoice_item_product FOREIGN KEY (product_id, variant_code) 
        REFERENCES dbo.product_variant(product_id, variant_code),
    CONSTRAINT CK_invoice_item_qty CHECK (qty > 0),
    CONSTRAINT CK_invoice_item_unit_price CHECK (unit_price >= 0),
    CONSTRAINT CK_invoice_item_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100)
);
GO

CREATE TABLE dbo.payment (
    payment_id     BIGINT IDENTITY(1,1) NOT NULL,
    order_id       BIGINT NOT NULL,
    
    -- Payment details
    amount         DECIMAL(14,2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    
    -- Status tracking
    status         NVARCHAR(20) NOT NULL DEFAULT N'Pending',
    
    -- Transaction info
    transaction_id NVARCHAR(100),
    provider_response NVARCHAR(MAX),
    
    -- Timestamps
    payment_date   DATETIME2(0),
    created_at     DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    updated_at     DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT PK_payment PRIMARY KEY (payment_id),
    CONSTRAINT FK_payment_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(order_id) ON DELETE CASCADE,
    CONSTRAINT CK_payment_amount CHECK (amount >= 0),
    CONSTRAINT CK_payment_method CHECK (payment_method IN (
        N'Cash', N'CreditCard', N'DebitCard', N'BankTransfer', 
        N'EWallet', N'PayPal', N'Momo', N'ZaloPay', N'VNPay'
    )),
    CONSTRAINT CK_payment_status CHECK (status IN (
        N'Pending', N'Processing', N'Success', N'Failed', N'Cancelled', N'Refunded'
    ))
);
GO

----------------------------------------------------
-- REVIEWS
----------------------------------------------------

CREATE TABLE dbo.review (
    review_id  BIGINT IDENTITY(1,1) NOT NULL,
    order_id   BIGINT NOT NULL,
    line_no    INT    NOT NULL,
    buyer_id   BIGINT NOT NULL,
    rating     INT    NOT NULL,
    content    NVARCHAR(MAX) NULL,
    created_at DATETIME2(0)  NOT NULL CONSTRAINT DF_review_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_review PRIMARY KEY (review_id),
    CONSTRAINT UQ_review_order_line UNIQUE (order_id, line_no),
    CONSTRAINT FK_review_order_item FOREIGN KEY (order_id, line_no)
        REFERENCES dbo.order_item(order_id, line_no) ON DELETE CASCADE,
    CONSTRAINT FK_review_buyer FOREIGN KEY (buyer_id) REFERENCES dbo.buyer(user_id) ON DELETE CASCADE,
    CONSTRAINT CK_review_rating CHECK (rating BETWEEN 1 AND 5)
);
GO

----------------------------------------------------
-- INDEXES
----------------------------------------------------

CREATE INDEX IX_product_seller              ON dbo.product(seller_id);
CREATE INDEX IX_address_buyer_default       ON dbo.address(buyer_id, is_default);
CREATE INDEX IX_address_seller_default      ON dbo.address(seller_id, is_default);
CREATE INDEX IX_orders_buyer                ON dbo.orders(buyer_id);
CREATE INDEX IX_order_item_product_variant  ON dbo.order_item(product_id, variant_code);
GO

----------------------------------------------------
-- STORED FUNCTIONS
----------------------------------------------------

CREATE FUNCTION dbo.fn_monthly_revenue
(
    @p_year  INT,
    @p_month INT
)
RETURNS DECIMAL(14,2)
AS
BEGIN
    DECLARE @v_total DECIMAL(14,2);

    IF @p_month < 1 OR @p_month > 12
    BEGIN
        -- Invalid month, return 0 instead of throwing (functions cannot THROW)
        RETURN 0;
    END;

    SELECT @v_total = COALESCE(SUM(total_amount), 0)
    FROM dbo.orders
    WHERE YEAR(order_date) = @p_year
      AND MONTH(order_date) = @p_month
      AND status IN (N'Paid', N'Packing', N'Shipped', N'Completed');

    RETURN @v_total;
END;
GO

CREATE FUNCTION dbo.fn_seller_total_sold
(
    @p_seller_id CHAR(6)
)
RETURNS BIGINT
AS
BEGIN
    DECLARE @v_exists INT;
    DECLARE @v_total  BIGINT;

    SELECT @v_exists = COUNT(*)
    FROM dbo.seller
    WHERE seller_id = @p_seller_id;

    IF @v_exists = 0
    BEGIN
        -- Seller khong ton tai -> tra ve 0
        RETURN 0;
    END;

    SELECT @v_total = COALESCE(SUM(oi.qty), 0)
    FROM dbo.orders o
    JOIN dbo.order_item oi ON oi.order_id = o.order_id
    JOIN dbo.product p     ON p.product_id = oi.product_id
    WHERE p.seller_id = @p_seller_id
      AND o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed');

    RETURN @v_total;
END;
GO

----------------------------------------------------
-- STORED PROCEDURES
----------------------------------------------------

CREATE PROCEDURE dbo.sp_get_orders_by_status
    @p_status NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        o.order_id,
        o.order_date,
        o.status,
        o.total_amount,
        ua.email        AS buyer_email,
        ua.display_name AS buyer_name
    FROM dbo.orders o
    JOIN dbo.buyer b         ON b.user_id = o.buyer_id
    JOIN dbo.user_account ua ON ua.user_id = b.user_id
    WHERE (@p_status IS NULL OR @p_status = N'' OR @p_status = N'ALL' OR o.status = @p_status)
    ORDER BY o.order_date DESC;
END;
GO

CREATE PROCEDURE dbo.sp_get_seller_monthly_revenue
    @p_seller_id CHAR(6),
    @p_year      INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_exists INT;

    SELECT @v_exists = COUNT(*)
    FROM dbo.seller
    WHERE seller_id = @p_seller_id;

    IF @v_exists = 0
    BEGIN
        THROW 50003, 'Seller does not exist.', 1;
    END;

    SELECT 
        MONTH(o.order_date) AS [month],
        SUM(oi.line_total)  AS revenue
    FROM dbo.orders o
    JOIN dbo.order_item oi ON oi.order_id = o.order_id
    JOIN dbo.product p     ON p.product_id = oi.product_id
    WHERE p.seller_id = @p_seller_id
      AND YEAR(o.order_date) = @p_year
      AND o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed')
    GROUP BY MONTH(o.order_date)
    HAVING SUM(oi.line_total) > 0
    ORDER BY [month];
END;
GO

CREATE PROCEDURE dbo.sp_get_seller_stats
    @p_seller_id CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_exists INT;

    SELECT @v_exists = COUNT(*)
    FROM dbo.seller
    WHERE seller_id = @p_seller_id;

    IF @v_exists = 0
    BEGIN
        THROW 50004, 'Seller does not exist.', 1;
    END;

    SELECT
        (SELECT COUNT(*)
         FROM dbo.product
         WHERE seller_id = @p_seller_id
           AND status = N'Active') AS products,
        (SELECT COUNT(DISTINCT o.order_id)
         FROM dbo.orders o
         JOIN dbo.order_item oi ON oi.order_id = o.order_id
         JOIN dbo.product p     ON p.product_id = oi.product_id
         WHERE p.seller_id = @p_seller_id) AS orders,
        (SELECT COALESCE(SUM(oi.line_total), 0)
         FROM dbo.orders o
         JOIN dbo.order_item oi ON oi.order_id = o.order_id
         JOIN dbo.product p     ON p.product_id = oi.product_id
         WHERE p.seller_id = @p_seller_id
           AND o.status IN (N'Paid', N'Packing', N'Shipped', N'Completed')) AS revenue;
END;
GO

----------------------------------------------------
-- TRIGGERS
----------------------------------------------------

CREATE TRIGGER dbo.tr_order_item_update_total
ON dbo.order_item
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE o
    SET total_amount = t.subtotal + o.shipping_fee
    FROM dbo.orders o
    JOIN (
        SELECT oi.order_id, SUM(oi.line_total) AS subtotal
        FROM dbo.order_item oi
        JOIN inserted i ON i.order_id = oi.order_id
        GROUP BY oi.order_id
    ) t ON t.order_id = o.order_id;
END;
GO

-- Business rule: limit quantity per cart line to prevent unrealistic orders
CREATE TRIGGER dbo.tr_cart_item_limit_qty
ON dbo.cart_item
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE qty > 50)
    BEGIN
        THROW 50005, 'Cart item quantity cannot exceed 50 units.', 1;
    END;
END;
GO

CREATE TRIGGER dbo.trg_invoice_updated_at
ON dbo.invoice
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.invoice
    SET updated_at = SYSDATETIME()
    WHERE invoice_id IN (SELECT invoice_id FROM inserted);
END;
GO

CREATE TRIGGER dbo.trg_payment_updated_at
ON dbo.payment
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.payment
    SET updated_at = SYSDATETIME()
    WHERE payment_id IN (SELECT payment_id FROM inserted);
END;
GO

CREATE TRIGGER dbo.trg_payment_update_order_status
ON dbo.payment
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- When payment succeeds, update order status to Paid
    UPDATE o
    SET o.status = N'Paid'
    FROM dbo.orders o
    INNER JOIN inserted i ON o.order_id = i.order_id
    WHERE i.status = N'Success' 
        AND o.status = N'Pending';
END;
GO
