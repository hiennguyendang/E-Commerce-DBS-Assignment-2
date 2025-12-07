import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import RatingStars from "../common/RatingStars";

// Simple VND formatting using ASCII-only suffix to avoid UTF-8 issues
const formatCurrencyVN = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " VND";

export default function ProductDetail({ product, user, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigate = useNavigate();

  // Check if current user is the seller of this product
  const isOwnProduct = user && product && product.seller && user.id === product.seller.user_id;

  // Auto-select first active variant when product loads
  // MUST be called before any early returns (Rules of Hooks)
  React.useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      const firstActive = product.variants.find(v => v.is_active && v.stock > 0);
      if (firstActive) {
        setSelectedVariant(firstActive);
      }
    }
  }, [product, selectedVariant]);

  if (!product) return <p>Khong tim thay san pham.</p>;

  const handleChangeQty = (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isNaN(val) || val <= 0) {
      setQuantity(1);
    } else {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn phiên bản sản phẩm');
      return;
    }
    onAddToCart({
      ...product,
      quantity,
      variant_code: selectedVariant.variant_code,
      price: selectedVariant.price,
    });
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
          {selectedVariant 
            ? formatCurrencyVN(selectedVariant.price)
            : formatCurrencyVN(product.price)}
        </h5>

        <p className="text-muted">{product.description}</p>

        {/* Variant Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <label className="fw-bold mb-2">Phiên bản:</label>
            <div className="d-flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.variant_code}
                  type="button"
                  className={`btn ${
                    selectedVariant?.variant_code === variant.variant_code
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  } ${!variant.is_active || variant.stock === 0 ? "disabled" : ""}`}
                  onClick={() => variant.is_active && variant.stock > 0 && setSelectedVariant(variant)}
                  disabled={!variant.is_active || variant.stock === 0}
                >
                  <div className="d-flex flex-column align-items-start">
                    <span className="fw-semibold">{variant.variant_code}</span>
                    <span className="small">{formatCurrencyVN(variant.price)}</span>
                    {variant.stock === 0 && (
                      <span className="badge bg-danger small">Hết hàng</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedVariant && (
              <div className="mt-2 text-muted small">
                Kho: {selectedVariant.stock} sản phẩm | SKU: {selectedVariant.sku}
              </div>
            )}
          </div>
        )}

        {!isOwnProduct && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              <label className="fw-bold mb-0">So luong:</label>
              <input
                type="number"
                className="form-control"
                style={{ width: "80px" }}
                min="1"
                max={selectedVariant?.stock || 999}
                value={quantity}
                onChange={handleChangeQty}
              />
            </div>

            <Button
              label="Them vao gio hang"
              onClick={handleAddToCart}
              size="lg"
            />
          </>
        )}
        {isOwnProduct && (
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Đây là sản phẩm của bạn. Bạn không thể mua sản phẩm của chính mình.
          </div>
        )}
      </div>
    </div>
  );
}

