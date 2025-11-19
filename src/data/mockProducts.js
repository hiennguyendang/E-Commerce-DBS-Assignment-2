const mockProducts = Array.from({ length: 48 }).map((_, i) => {
  const id = i + 1;
  const price = Math.round((Math.random() * 900 + 50) * 1000); // 50k..950k
  const cats = ["Thời trang", "Điện tử", "Gia dụng", "Sách", "Làm đẹp"];
  const category = cats[i % cats.length];
  return {
    id,
    name: `Sản phẩm demo #${id} — ${category}`,
    price,
    image: `https://picsum.photos/seed/product${id}/600/600`, // ảnh ngẫu nhiên
    rating: +(Math.random() * 1.5 + 3.5).toFixed(1), // 3.5..5.0
    reviews: Math.floor(Math.random() * 200),
    category,
    description: `Mô tả ngắn cho sản phẩm demo #${id}. Dùng để test giao diện.`,
  };
});

export default mockProducts;