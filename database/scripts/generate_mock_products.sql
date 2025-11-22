-- Generate 100+ mock products with various categories
USE shopeelike;

-- First, ensure we have categories
INSERT IGNORE INTO category (category_id, name, parent_id) VALUES
(10, 'Thời Trang Nam', NULL),
(11, 'Thời Trang Nữ', NULL),
(12, 'Điện Thoại & Phụ Kiện', NULL),
(13, 'Máy Tính & Laptop', NULL),
(14, 'Máy Ảnh & Máy Quay Phim', NULL),
(15, 'Đồng Hồ', NULL),
(16, 'Giày Dép Nam', NULL),
(17, 'Giày Dép Nữ', NULL),
(18, 'Túi Ví Nữ', NULL),
(19, 'Phụ Kiện & Trang Sức Nữ', NULL),
(20, 'Balo & Túi Ví Nam', NULL),
(21, 'Thiết Bị Điện Tử', NULL),
(22, 'Thiết Bị Gia Dụng', NULL),
(23, 'Thể Thao & Du Lịch', NULL),
(24, 'Ô Tô & Xe Máy & Xe Đạp', NULL),
(25, 'Sức Khỏe', NULL),
(26, 'Đồ Chơi', NULL),
(27, 'Chăm Sóc Thú Cưng', NULL);

-- Make sure we have a seller (seller1 should exist)
-- Generate products - Thời trang nam (30 products)
INSERT INTO product (product_name, description, is_active) VALUES
('Áo Thun Nam Cotton 100%', 'Áo thun nam chất cotton cao cấp, thoáng mát, nhiều màu sắc', 1),
('Quần Jean Nam Slim Fit', 'Quần jean nam ống côn, form dáng đẹp, chất vải bền đẹp', 1),
('Áo Sơ Mi Nam Công Sở', 'Áo sơ mi nam trắng trơn, phù hợp đi làm và dự tiệc', 1),
('Áo Khoác Gió Nam', 'Áo khoác gió nam 2 lớp chống nước, chống gió tốt', 1),
('Quần Kaki Nam Túi Hộp', 'Quần kaki nam túi hộp, form rộng thoải mái', 1),
('Áo Polo Nam Thể Thao', 'Áo polo nam thể thao, vải thấm hút mồ hôi tốt', 1),
('Quần Short Kaki Nam', 'Quần short kaki nam mùa hè, thoáng mát', 1),
('Áo Hoodie Nam Nỉ Bông', 'Áo hoodie nam nỉ bông dày dặn, giữ ấm tốt', 1),
('Quần Jogger Nam Túi Hộp', 'Quần jogger nam thể thao, co giãn 4 chiều', 1),
('Áo Sweater Nam Len Dệt Kim', 'Áo sweater nam len dệt kim cao cấp, ấm áp', 1),
('Bộ Đồ Thể Thao Nam', 'Bộ đồ thể thao nam áo + quần, vải thun co giãn', 1),
('Áo Phông Nam Form Rộng Oversize', 'Áo phông nam form rộng phong cách Hàn Quốc', 1),
('Quần Baggy Nam Ống Rộng', 'Quần baggy nam ống rộng, phong cách streetwear', 1),
('Áo Blazer Nam Công Sở', 'Áo blazer nam công sở, chất vải cao cấp', 1),
('Quần Tây Nam Âu', 'Quần tây nam ống suông, phù hợp công sở', 1),
('Áo Len Cardigan Nam', 'Áo len cardigan nam dáng dài, phong cách vintage', 1),
('Quần Thể Thao Nam Adidas', 'Quần thể thao nam Adidas chính hãng', 1),
('Áo Tank Top Nam Gym', 'Áo tank top nam tập gym, thoáng khí', 1),
('Quần Bơi Nam', 'Quần bơi nam vải nhanh khô, nhiều màu', 1),
('Áo Thun Nam Cổ Tim', 'Áo thun nam cổ tim basic, dễ phối đồ', 1),
('Quần Culottes Nam Ống Rộng', 'Quần culottes nam ống rộng, xu hướng mới', 1),
('Áo Khoác Bomber Nam', 'Áo khoác bomber nam phi công, phong cách năng động', 1),
('Quần Cargo Nam Túi Hộp', 'Quần cargo nam nhiều túi, phong cách quân đội', 1),
('Áo Thun Polo Nam Lacoste', 'Áo polo nam Lacoste chính hãng, cao cấp', 1),
('Quần Short Jean Nam', 'Quần short jean nam wash nhẹ, phong cách trẻ trung', 1),
('Áo Sơ Mi Nam Họa Tiết', 'Áo sơ mi nam họa tiết hoa, phong cách Hawaii', 1),
('Quần Linen Nam Mát Mẻ', 'Quần linen nam vải thoáng mát, phù hợp mùa hè', 1),
('Áo Thun Nam Tay Dài', 'Áo thun nam tay dài basic, nhiều màu', 1),
('Quần Skinny Jean Nam', 'Quần jean nam ống siêu bó, phong cách Hàn Quốc', 1),
('Áo Khoác Jeans Nam', 'Áo khoác jeans nam wash rách, phong cách vintage', 1);

-- Thời trang nữ (30 products)
INSERT INTO product (product_name, description, is_active) VALUES
('Váy Đầm Nữ Dự Tiệc', 'Váy đầm nữ dự tiệc sang trọng, nhiều màu', 1),
('Áo Kiểu Nữ Công Sở', 'Áo kiểu nữ công sở tay bồng, thanh lịch', 1),
('Quần Jean Nữ Lưng Cao', 'Quần jean nữ lưng cao ôm dáng, tôn chân', 1),
('Áo Thun Nữ Cotton Form Rộng', 'Áo thun nữ cotton form rộng oversize thoải mái', 1),
('Chân Váy Nữ Xếp Ly', 'Chân váy nữ xếp ly dài qua gối, dáng xòe', 1),
('Đầm Maxi Nữ Đi Biển', 'Đầm maxi nữ đi biển họa tiết hoa, thoáng mát', 1),
('Áo Croptop Nữ Sexy', 'Áo croptop nữ sexy hở eo, phong cách trẻ trung', 1),
('Quần Short Nữ Thể Thao', 'Quần short nữ thể thao tập gym, co giãn tốt', 1),
('Áo Sơ Mi Nữ Trắng', 'Áo sơ mi nữ trắng basic, dễ phối đồ', 1),
('Quần Culottes Nữ Ống Rộng', 'Quần culottes nữ ống rộng thanh lịch', 1),
('Váy Babydoll Nữ', 'Váy babydoll nữ dáng xòe ngắn, xinh xắn', 1),
('Áo Hoodie Nữ Form Rộng', 'Áo hoodie nữ form rộng unisex, ấm áp', 1),
('Quần Baggy Nữ Kaki', 'Quần baggy nữ kaki ống rộng, phong cách Hàn', 1),
('Áo Blazer Nữ Công Sở', 'Áo blazer nữ công sở form đẹp, thanh lịch', 1),
('Quần Legging Nữ Gym', 'Quần legging nữ tập gym co giãn 4 chiều', 1),
('Đầm Suông Nữ Tay Ngắn', 'Đầm suông nữ tay ngắn thoải mái, dễ mặc', 1),
('Áo Len Nữ Dệt Kim', 'Áo len nữ dệt kim cổ lọ, ấm áp mùa đông', 1),
('Quần Tây Nữ Ống Ôm', 'Quần tây nữ ống ôm công sở, dáng chuẩn', 1),
('Váy Midi Nữ Xẻ Tà', 'Váy midi nữ xẻ tà gợi cảm, đi tiệc', 1),
('Áo Tanktop Nữ Tập Gym', 'Áo tanktop nữ tập gym thể thao', 1),
('Quần Kaki Nữ Lưng Cao', 'Quần kaki nữ lưng cao tôn dáng', 1),
('Đầm Dạ Hội Nữ Dài', 'Đầm dạ hội nữ dài lộng lẫy, sang trọng', 1),
('Áo Khoác Cardigan Nữ', 'Áo khoác cardigan nữ len mỏng, dễ phối', 1),
('Quần Jogger Nữ Thể Thao', 'Quần jogger nữ thể thao thoải mái', 1),
('Váy Tennis Nữ Xếp Ly', 'Váy tennis nữ xếp ly ngắn, năng động', 1),
('Áo Phông Nữ In Hình', 'Áo phông nữ in hình độc đáo, cá tính', 1),
('Quần Ống Loe Nữ Vintage', 'Quần ống loe nữ phong cách vintage retro', 1),
('Đầm Bodycon Nữ Ôm', 'Đầm bodycon nữ ôm sát gợi cảm', 1),
('Áo Khoác Gió Nữ 2 Lớp', 'Áo khoác gió nữ 2 lớp chống nước', 1),
('Quần Shorts Jean Nữ Rách', 'Quần shorts jean nữ rách cá tính', 1);

-- Điện thoại & Phụ kiện (20 products)
INSERT INTO product (product_name, description, is_active) VALUES
('iPhone 15 Pro Max 256GB', 'iPhone 15 Pro Max màu Titan, camera 48MP, chip A17', 1),
('Samsung Galaxy S24 Ultra', 'Samsung S24 Ultra 512GB, bút S-Pen tích hợp', 1),
('Xiaomi 14 Pro 5G', 'Xiaomi 14 Pro camera Leica, sạc nhanh 120W', 1),
('OPPO Find X7 Pro', 'OPPO Find X7 Pro camera Hasselblad, màn hình 2K', 1),
('Realme GT 5 Pro', 'Realme GT 5 Pro chip Snapdragon 8 Gen 3', 1),
('Vivo V30 Pro 5G', 'Vivo V30 Pro camera selfie 50MP, mỏng nhẹ', 1),
('OnePlus 12 Pro', 'OnePlus 12 Pro màn hình AMOLED 120Hz', 1),
('Ốp lưng iPhone 15 Pro Max', 'Ốp lưng chống sốc iPhone 15 Pro Max trong suốt', 1),
('Miếng dán cường lực iPhone', 'Miếng dán cường lực iPhone chống vỡ, chống xước', 1),
('Tai nghe Bluetooth AirPods Pro 2', 'AirPods Pro 2 chống ồn chủ động ANC', 1),
('Tai nghe Samsung Galaxy Buds 3', 'Galaxy Buds 3 âm thanh Hi-Fi, pin 24h', 1),
('Sạc nhanh 65W GaN', 'Sạc nhanh 65W công nghệ GaN nhỏ gọn', 1),
('Cáp sạc iPhone Lightning to USB-C', 'Cáp sạc iPhone chính hãng MFi 1m', 1),
('Cáp sạc Type-C to Type-C 100W', 'Cáp sạc Type-C hỗ trợ sạc nhanh 100W', 1),
('Gậy chụp ảnh Selfie Stick', 'Gậy chụp ảnh tự sướng kèm tripod, remote bluetooth', 1),
('Giá đỡ điện thoại ô tô', 'Giá đỡ điện thoại gắn taplo ô tô, xoay 360 độ', 1),
('Pin dự phòng 20.000mAh', 'Pin dự phòng sạc nhanh 2 chiều 20.000mAh', 1),
('Loa Bluetooth JBL Flip 6', 'Loa bluetooth JBL Flip 6 chống nước IPX7', 1),
('Đế sạc không dây MagSafe', 'Đế sạc không dây MagSafe 15W cho iPhone', 1),
('Ring light livestream', 'Đèn ring light LED livestream 26cm, có tripod', 1);

-- Máy tính & Laptop (15 products)
INSERT INTO product (product_name, description, is_active) VALUES
('MacBook Pro 14 M3 Pro', 'MacBook Pro 14 inch chip M3 Pro 18GB RAM 512GB SSD', 1),
('Dell XPS 15 9530', 'Dell XPS 15 Intel Core i7-13700H RTX 4050 16GB RAM', 1),
('Asus ROG Zephyrus G14', 'Asus ROG G14 gaming Ryzen 9 RTX 4060 QHD 165Hz', 1),
('Lenovo ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Carbon Gen 11 Intel i7 16GB RAM', 1),
('HP Pavilion Gaming 15', 'HP Pavilion Gaming 15 i5-12500H RTX 3050 8GB RAM', 1),
('Acer Nitro 5 Gaming', 'Acer Nitro 5 i7-12650H RTX 4050 144Hz 16GB RAM', 1),
('MSI Katana 15 Gaming', 'MSI Katana 15 i7-13700H RTX 4070 240Hz', 1),
('Chuột Gaming Logitech G502', 'Chuột gaming Logitech G502 HERO 25K DPI', 1),
('Bàn phím cơ Keychron K2', 'Bàn phím cơ Keychron K2 wireless Gateron switch', 1),
('Tai nghe Gaming HyperX Cloud II', 'Tai nghe gaming HyperX Cloud II 7.1 surround', 1),
('Webcam Logitech C920 HD Pro', 'Webcam Logitech C920 Full HD 1080p tự động lấy nét', 1),
('Màn hình LG 27 inch 4K', 'Màn hình LG 27UP850 4K IPS 99% sRGB HDR400', 1),
('SSD Samsung 980 Pro 1TB', 'Ổ cứng SSD Samsung 980 Pro NVMe 1TB tốc độ 7000MB/s', 1),
('RAM Corsair Vengeance 32GB', 'RAM PC Corsair Vengeance RGB 32GB DDR5 5600MHz', 1),
('Ổ cứng di động WD My Passport 2TB', 'Ổ cứng di động WD My Passport 2TB USB 3.2', 1);

-- Thêm các sản phẩm còn lại (Giày dép, túi xách, đồng hồ, v.v.)
INSERT INTO product (product_name, description, is_active) VALUES
('Giày Nike Air Force 1', 'Giày Nike Air Force 1 trắng full, classic', 1),
('Giày Adidas Superstar', 'Giày Adidas Superstar đen 3 sọc trắng', 1),
('Giày Converse Chuck Taylor', 'Giày Converse Chuck Taylor high top cổ cao', 1),
('Giày Vans Old Skool', 'Giày Vans Old Skool đen trắng classic', 1),
('Dép Adidas Adilette', 'Dép Adidas Adilette đi trong nhà, đi biển', 1),
('Túi xách nữ da thật', 'Túi xách nữ da bò thật cao cấp, sang trọng', 1),
('Balo laptop 15.6 inch', 'Balo laptop chống sốc 15.6 inch nhiều ngăn', 1),
('Ví nam da bò cao cấp', 'Ví nam da bò thật 3 ngăn gập đôi', 1),
('Đồng hồ Casio G-Shock', 'Đồng hồ Casio G-Shock chống nước 200m', 1),
('Đồng hồ Daniel Wellington', 'Đồng hồ Daniel Wellington dây da sang trọng', 1),
('Đồng hồ Apple Watch Series 9', 'Apple Watch Series 9 GPS 45mm dây cao su', 1),
('Nồi cơm điện Panasonic 1.8L', 'Nồi cơm điện Panasonic 1.8L lòng dày', 1),
('Máy xay sinh tố Philips', 'Máy xay sinh tố Philips 700W cối thủy tinh', 1),
('Quạt điều hòa Kangaroo', 'Quạt điều hòa hơi nước Kangaroo KG50F38', 1),
('Máy hút bụi Xiaomi', 'Máy hút bụi không dây Xiaomi Vacuum Cleaner G10', 1);

-- Insert product variants for all products (simplified - random prices)
-- Product 1-30: Thời trang nam
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(1, 'V001-M', 'Size M', 199000, 50),
(1, 'V001-L', 'Size L', 199000, 50),
(1, 'V001-XL', 'Size XL', 199000, 30),
(2, 'V002-29', 'Size 29', 450000, 20),
(2, 'V002-30', 'Size 30', 450000, 25),
(2, 'V002-31', 'Size 31', 450000, 20),
(3, 'V003-39', 'Size 39', 350000, 15),
(3, 'V003-40', 'Size 40', 350000, 20),
(4, 'V004-M', 'Size M', 550000, 30),
(4, 'V004-L', 'Size L', 550000, 25),
(5, 'V005-30', 'Size 30', 380000, 20),
(5, 'V005-31', 'Size 31', 380000, 20),
(6, 'V006-M', 'Size M', 280000, 40),
(6, 'V006-L', 'Size L', 280000, 35),
(7, 'V007-30', 'Size 30', 250000, 30),
(7, 'V007-32', 'Size 32', 250000, 30),
(8, 'V008-L', 'Size L', 420000, 25),
(8, 'V008-XL', 'Size XL', 420000, 20),
(9, 'V009-M', 'Size M', 320000, 30),
(9, 'V009-L', 'Size L', 320000, 30),
(10, 'V010-M', 'Size M', 480000, 20),
(10, 'V010-L', 'Size L', 480000, 15);

-- Continue with more variants for products 11-20
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(11, 'V011-M', 'Size M', 390000, 25),
(11, 'V011-L', 'Size L', 390000, 20),
(12, 'V012-XL', 'Size XL', 220000, 40),
(13, 'V013-31', 'Size 31', 420000, 15),
(14, 'V014-M', 'Size M', 890000, 10),
(15, 'V015-30', 'Size 30', 520000, 12),
(16, 'V016-L', 'Size L', 380000, 18),
(17, 'V017-M', 'Size M', 890000, 8),
(18, 'V018-M', 'Size M', 180000, 50),
(19, 'V019-M', 'Size M', 290000, 30),
(20, 'V020-L', 'Size L', 160000, 45);

-- Products 21-30
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(21, 'V021-32', 'Size 32', 380000, 20),
(22, 'V022-M', 'Size M', 680000, 12),
(23, 'V023-31', 'Size 31', 490000, 15),
(24, 'V024-L', 'Size L', 1200000, 5),
(25, 'V025-30', 'Size 30', 320000, 25),
(26, 'V026-M', 'Size M', 450000, 18),
(27, 'V027-31', 'Size 31', 380000, 20),
(28, 'V028-L', 'Size L', 210000, 40),
(29, 'V029-29', 'Size 29', 580000, 12),
(30, 'V030-M', 'Size M', 720000, 10);

-- Thời trang nữ (31-60)
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(31, 'V031-S', 'Size S', 450000, 25),
(31, 'V031-M', 'Size M', 450000, 30),
(32, 'V032-S', 'Size S', 320000, 20),
(32, 'V032-M', 'Size M', 320000, 25),
(33, 'V033-27', 'Size 27', 480000, 15),
(33, 'V033-28', 'Size 28', 480000, 20),
(34, 'V034-M', 'Size M', 180000, 50),
(35, 'V035-S', 'Size S', 280000, 30),
(36, 'V036-M', 'Size M', 520000, 20),
(37, 'V037-S', 'Size S', 150000, 40),
(38, 'V038-M', 'Size M', 190000, 35),
(39, 'V039-S', 'Size S', 280000, 25),
(40, 'V040-M', 'Size M', 320000, 22);

INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(41, 'V041-S', 'Size S', 380000, 18),
(42, 'V042-M', 'Size M', 350000, 25),
(43, 'V043-27', 'Size 27', 380000, 20),
(44, 'V044-S', 'Size S', 620000, 12),
(45, 'V045-M', 'Size M', 220000, 35),
(46, 'V046-M', 'Size M', 420000, 20),
(47, 'V047-S', 'Size S', 380000, 22),
(48, 'V048-27', 'Size 27', 450000, 15),
(49, 'V049-S', 'Size S', 550000, 12),
(50, 'V050-S', 'Size S', 140000, 40);

INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(51, 'V051-28', 'Size 28', 380000, 18),
(52, 'V052-M', 'Size M', 890000, 8),
(53, 'V053-S', 'Size S', 420000, 15),
(54, 'V054-M', 'Size M', 280000, 25),
(55, 'V055-S', 'Size S', 320000, 20),
(56, 'V056-M', 'Size M', 190000, 35),
(57, 'V057-27', 'Size 27', 450000, 15),
(58, 'V058-S', 'Size S', 680000, 10),
(59, 'V059-M', 'Size M', 520000, 12),
(60, 'V060-S', 'Size S', 280000, 22);

-- Điện thoại & phụ kiện (61-80)
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(61, 'V061-TITAN', 'Màu Titan Tự Nhiên', 32990000, 5),
(61, 'V061-BLACK', 'Màu Titan Đen', 32990000, 5),
(62, 'V062-BLACK', 'Màu Đen', 29990000, 8),
(62, 'V062-GRAY', 'Màu Xám', 29990000, 7),
(63, 'V063-BLACK', 'Màu Đen', 24990000, 10),
(64, 'V064-BLUE', 'Màu Xanh', 22990000, 8),
(65, 'V065-GREEN', 'Màu Xanh Lá', 19990000, 12),
(66, 'V066-PURPLE', 'Màu Tím', 18990000, 10),
(67, 'V067-WHITE', 'Màu Trắng', 21990000, 8),
(68, 'V068-CLEAR', 'Trong Suốt', 150000, 100),
(69, 'V069-DEFAULT', 'Mặc định', 120000, 80),
(70, 'V070-WHITE', 'Màu Trắng', 5990000, 15);

INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(71, 'V071-BLACK', 'Màu Đen', 4990000, 20),
(72, 'V072-WHITE', 'Màu Trắng', 890000, 30),
(73, 'V073-1M', 'Dài 1m', 320000, 50),
(74, 'V074-1M', 'Dài 1m', 280000, 60),
(75, 'V075-BLACK', 'Màu Đen', 390000, 40),
(76, 'V076-DEFAULT', 'Mặc định', 250000, 50),
(77, 'V077-BLACK', 'Màu Đen', 890000, 25),
(78, 'V078-BLACK', 'Màu Đen', 2990000, 15),
(79, 'V079-WHITE', 'Màu Trắng', 790000, 20),
(80, 'V080-26CM', 'Kích thước 26cm', 450000, 30);

-- Máy tính & Laptop (81-95)
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(81, 'V081-GRAY', 'Màu Xám', 49990000, 3),
(82, 'V082-SILVER', 'Màu Bạc', 38990000, 5),
(83, 'V083-BLACK', 'Màu Đen', 42990000, 4),
(84, 'V084-BLACK', 'Màu Đen', 36990000, 6),
(85, 'V085-BLUE', 'Màu Xanh', 22990000, 8),
(86, 'V086-BLACK', 'Màu Đen', 24990000, 7),
(87, 'V087-BLACK', 'Màu Đen', 32990000, 5),
(88, 'V088-BLACK', 'Màu Đen', 1290000, 20),
(89, 'V089-BROWN', 'Keycap Nâu', 2490000, 15),
(90, 'V090-BLACK', 'Màu Đen', 1890000, 18),
(91, 'V091-BLACK', 'Màu Đen', 1790000, 20),
(92, 'V092-DEFAULT', 'Mặc định', 9990000, 10),
(93, 'V093-DEFAULT', 'Mặc định', 4990000, 12),
(94, 'V094-BLACK', 'Màu Đen', 3290000, 15),
(95, 'V095-BLACK', 'Màu Đen', 1890000, 18);

-- Giày dép, túi xách, đồng hồ, v.v. (96-110)
INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(96, 'V096-40', 'Size 40', 2990000, 10),
(96, 'V096-41', 'Size 41', 2990000, 12),
(96, 'V096-42', 'Size 42', 2990000, 10),
(97, 'V097-40', 'Size 40', 2790000, 12),
(97, 'V097-41', 'Size 41', 2790000, 10),
(98, 'V098-40', 'Size 40', 1890000, 15),
(98, 'V098-41', 'Size 41', 1890000, 15),
(99, 'V099-40', 'Size 40', 1690000, 18),
(99, 'V099-41', 'Size 41', 1690000, 16),
(100, 'V100-40', 'Size 40', 590000, 30);

INSERT INTO product_variant (product_id, variant_code, variant_name, price, stock_quantity) VALUES
(101, 'V101-BLACK', 'Màu Đen', 3990000, 8),
(102, 'V102-BLACK', 'Màu Đen', 890000, 20),
(103, 'V103-BROWN', 'Màu Nâu', 680000, 15),
(104, 'V104-BLACK', 'Màu Đen', 4990000, 10),
(105, 'V105-SILVER', 'Màu Bạc', 5990000, 8),
(106, 'V106-BLACK', 'Màu Đen', 12990000, 5),
(107, 'V107-DEFAULT', 'Mặc định', 3290000, 10),
(108, 'V108-DEFAULT', 'Mặc định', 1890000, 12),
(109, 'V109-WHITE', 'Màu Trắng', 4990000, 8),
(110, 'V110-WHITE', 'Màu Trắng', 3590000, 10);

-- Assign all products to seller1 (seller_id = 'SEL001')
UPDATE product SET seller_id = 'SEL001' WHERE seller_id IS NULL;

-- Add product to categories
INSERT INTO product_category (product_id, category_id) VALUES
-- Thời trang nam (1-30) -> category 10
(1, 10), (2, 10), (3, 10), (4, 10), (5, 10), (6, 10), (7, 10), (8, 10), (9, 10), (10, 10),
(11, 10), (12, 10), (13, 10), (14, 10), (15, 10), (16, 10), (17, 10), (18, 10), (19, 10), (20, 10),
(21, 10), (22, 10), (23, 10), (24, 10), (25, 10), (26, 10), (27, 10), (28, 10), (29, 10), (30, 10),
-- Thời trang nữ (31-60) -> category 11
(31, 11), (32, 11), (33, 11), (34, 11), (35, 11), (36, 11), (37, 11), (38, 11), (39, 11), (40, 11),
(41, 11), (42, 11), (43, 11), (44, 11), (45, 11), (46, 11), (47, 11), (48, 11), (49, 11), (50, 11),
(51, 11), (52, 11), (53, 11), (54, 11), (55, 11), (56, 11), (57, 11), (58, 11), (59, 11), (60, 11),
-- Điện thoại & phụ kiện (61-80) -> category 12
(61, 12), (62, 12), (63, 12), (64, 12), (65, 12), (66, 12), (67, 12), (68, 12), (69, 12), (70, 12),
(71, 12), (72, 12), (73, 12), (74, 12), (75, 12), (76, 12), (77, 12), (78, 12), (79, 12), (80, 12),
-- Máy tính & Laptop (81-95) -> category 13
(81, 13), (82, 13), (83, 13), (84, 13), (85, 13), (86, 13), (87, 13), (88, 13), (89, 13), (90, 13),
(91, 13), (92, 13), (93, 13), (94, 13), (95, 13),
-- Giày dép (96-100) -> category 16
(96, 16), (97, 16), (98, 16), (99, 16), (100, 16),
-- Túi xách (101-103) -> category 18
(101, 18), (102, 20), (103, 20),
-- Đồng hồ (104-106) -> category 15
(104, 15), (105, 15), (106, 15),
-- Thiết bị gia dụng (107-110) -> category 22
(107, 22), (108, 22), (109, 22), (110, 22);

-- Add sample product images
INSERT INTO product_image (product_id, image_url, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 1),
(2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 1),
(3, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', 1),
(31, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 1),
(61, 'https://images.unsplash.com/photo-1592286927505-05b8cfb0c704?w=500', 1),
(62, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', 1),
(81, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 1),
(96, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 1);

SELECT 'Mock data generated successfully!' AS message;
SELECT COUNT(*) AS total_products FROM product;
SELECT COUNT(*) AS total_variants FROM product_variant;
