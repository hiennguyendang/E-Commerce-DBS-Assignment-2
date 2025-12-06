import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import RatingStars from "../common/RatingStars";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

  const handleClickCard = () => {
    navigate(`/app/product/${product.id}`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      className="card h-100 border-0 shadow-sm product-card"
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
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="card-title text-truncate mb-1">{product.name}</h6>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="text-danger fw-bold">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            <RatingStars rating={product.rating} size={14} />
          </div>
        </div>
        <div className="mt-3">
          <Button label="Thêm vào giỏ" size="sm" onClick={handleAdd} />
        </div>
      </div>
    </div>
  );
}

