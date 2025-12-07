import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

<<<<<<< HEAD:src/components/product/ProductCard.jsx
  // Kiểm tra ID dùng key nào
  const productId = product.id ?? product.product_id;
=======
  const handleClickCard = () => {
    navigate(`/app/product/${product.id}`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };
>>>>>>> feature/mssql-compat:frontend/src/components/product/ProductCard.jsx

  return (
    <div
      className="card h-100 border-0 shadow-sm product-card"
<<<<<<< HEAD:src/components/product/ProductCard.jsx
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

=======
      style={{ cursor: "pointer", borderRadius: "16px", overflow: "hidden" }}
      onClick={handleClickCard}
    >
      <div className="position-relative">
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{
            height: "210px",
            objectFit: "cover",
          }}
        />
      </div>
>>>>>>> feature/mssql-compat:frontend/src/components/product/ProductCard.jsx
      <div className="card-body d-flex flex-column justify-content-between">

        <div>
<<<<<<< HEAD:src/components/product/ProductCard.jsx
          <h6 className="card-title text-truncate fw-bold">{product.name}</h6>

=======
          <h6 className="card-title text-truncate mb-1">{product.name}</h6>
>>>>>>> feature/mssql-compat:frontend/src/components/product/ProductCard.jsx
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="text-danger fw-bold">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>

            <span className="text-warning small">
              {"★".repeat(Math.round(product.rating || 4))}
            </span>
          </div>
        </div>
<<<<<<< HEAD:src/components/product/ProductCard.jsx

        <button
          className="btn btn-bk mt-3"
          onClick={(e) => {
            e.stopPropagation(); // tránh mở trang chi tiết khi bấm nút
            onAddToCart(product);
          }}
        >
          Thêm vào giỏ
        </button>
=======
        <div className="mt-3">
          <Button label="Thêm vào giỏ" size="sm" onClick={handleAdd} />
        </div>
>>>>>>> feature/mssql-compat:frontend/src/components/product/ProductCard.jsx
      </div>
    </div>
  );
}

