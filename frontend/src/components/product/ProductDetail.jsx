import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import RatingStars from "../common/RatingStars";

// Simple VND formatting using ASCII-only suffix to avoid UTF-8 issues
const formatCurrencyVN = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " VND";

export default function ProductDetail({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  if (!product) return <p>Khong tim thay san pham.</p>;

  const handleChangeQty = (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isNaN(val) || val <= 0) {
      setQuantity(1);
    } else {
      setQuantity(val);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <img
          src={product.image}
          alt={product.name}
          className="img-fluid rounded shadow-sm"
        />
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">{product.name}</h4>

        <div className="d-flex align-items-center mb-3">
          <RatingStars rating={product.rating} />
          <span className="text-muted small ms-2">
            {product.reviews} danh gia
          </span>
        </div>

        {product.seller && (
          <div className="mb-3">
            <div className="small text-muted">Nha ban hang</div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mt-1"
              onClick={() => navigate(`/app/seller/${product.seller.id}`)}
            >
              <span className="fw-semibold">{product.seller.shop_name}</span>
              {product.seller.owner_name && (
                <span className="ms-2 text-muted">
                  ({product.seller.owner_name})
                </span>
              )}
            </button>
          </div>
        )}

        <h5 className="text-danger mb-3">
          {formatCurrencyVN(product.price)}
        </h5>

        <p className="text-muted">{product.description}</p>

        <div className="d-flex align-items-center gap-3 mb-3">
          <label className="fw-bold mb-0">So luong:</label>
          <input
            type="number"
            className="form-control"
            style={{ width: "80px" }}
            min="1"
            value={quantity}
            onChange={handleChangeQty}
          />
        </div>

        <Button
          label="Them vao gio hang"
          onClick={() => onAddToCart({ ...product, quantity })}
          size="lg"
        />
      </div>
    </div>
  );
}

