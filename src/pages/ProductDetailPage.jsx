// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import mockProducts from "../data/mockProducts";

export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        // TH: Backend có API thật
        const res = await axiosInstance.get(`/products/${id}`);
        if (res.data) {
          setProduct(res.data);
          return;
        }
      } catch (_) {
        // ignore lỗi và fallback sang mock
      }

      // TH: Dùng mock data
      const found = mockProducts.find((p) => p.id === Number(id));
      if (found) {
        setProduct(found);
      } else {
        setNotFound(true);
      }
    }

    loadProduct();
  }, [id]);

  if (notFound) {
    return <p className="text-center mt-5 fs-4">Không tìm thấy sản phẩm.</p>;
  }

  if (!product) {
    return <p className="text-center mt-5 fs-5">Đang tải...</p>;
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        
        {/* Ảnh sản phẩm */}
        <div className="col-md-5">
          <img
            src={product.image}
            className="img-fluid rounded shadow-sm"
            alt={product.name}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <h3 className="fw-bold">{product.name}</h3>

          <div className="d-flex align-items-center mb-2">
            <span className="text-warning me-2">
              {"★".repeat(Math.round(product.rating))}
            </span>
            <small className="text-muted">
              {product.reviews} đánh giá
            </small>
          </div>

          <h4 className="text-danger fw-bold mb-3">
            {product.price.toLocaleString("vi-VN")} ₫
          </h4>

          <p className="mb-4">{product.description}</p>

          <button
            className="btn btn-bk px-4 py-2"
            onClick={() => onAddToCart(product)}
          >
            Thêm vào giỏ hàng
          </button>
        </div>

      </div>
    </div>
  );
}
