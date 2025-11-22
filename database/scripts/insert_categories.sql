-- Insert default categories
USE shopeelike;

INSERT IGNORE INTO category (category_id, name, description) VALUES
(1, 'Electronics', 'Điện tử & Thiết bị'),
(10, 'Thời Trang Nam', 'Quần áo, giày dép nam'),
(11, 'Thời Trang Nữ', 'Quần áo, giày dép nữ'),
(12, 'Điện Thoại & Phụ Kiện', 'Smartphone và phụ kiện'),
(13, 'Máy Tính & Laptop', 'Laptop, PC và linh kiện'),
(14, 'Máy Ảnh & Máy Quay', 'Camera và phụ kiện'),
(15, 'Đồng Hồ', 'Đồng hồ nam, nữ'),
(16, 'Giày Dép Nam', 'Giày sneaker, sandal nam'),
(17, 'Giày Dép Nữ', 'Giày cao gót, sandal nữ'),
(18, 'Túi Ví Nữ', 'Túi xách, ví nữ'),
(19, 'Phụ Kiện & Trang Sức Nữ', 'Dây chuyền, nhẫn, vòng'),
(20, 'Balo & Túi Ví Nam', 'Balo, cặp laptop nam'),
(21, 'Thiết Bị Điện Tử', 'Tivi, loa, tai nghe'),
(22, 'Thiết Bị Gia Dụng', 'Nồi, chảo, máy xay');
