import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

  // Kiểm tra ID dùng key nào
  const productId = product.id ?? product.product_id;

  return (
    <div
      className="card h-100 border-0 shadow-sm product-card"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/app/product/${productId}`)}
    >
      <img
        src={product.image}
        alt={product.name}
        className="card-img-top"
        style={{
          height: "220px",
          objectFit: "cover",
        }}
      />

      <div className="card-body d-flex flex-column justify-content-between">

        <div>
          <h6 className="card-title text-truncate fw-bold">{product.name}</h6>

          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="text-danger fw-bold">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>

            <span className="text-warning small">
              {"★".repeat(Math.round(product.rating || 4))}
            </span>
          </div>
        </div>

        <button
          className="btn btn-bk mt-3"
          onClick={(e) => {
            e.stopPropagation(); // tránh mở trang chi tiết khi bấm nút
            onAddToCart(product);
          }}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
