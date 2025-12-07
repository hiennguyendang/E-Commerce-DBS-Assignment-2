import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import ProductDetail from "../components/product/ProductDetail";
import ProductReviews from "../components/product/ProductReviews";

export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        const p = res.data;
        const image =
          p.images?.[0]?.image_url ||
          p.primary_image ||
          "https://placehold.co/400x300?text=No+Image";
        setProduct({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price || p.min_price || 0),
          image,
          rating: p.rating_average || 0,
          reviews: p.rating_count || 0,
          seller: p.seller || null,
        });
      } catch (err) {
        console.error("Failed to load product:", err);
      }
    }
    fetchProduct();
  }, [id]);

  return (
    <div className="container py-4">
      <ProductDetail product={product} onAddToCart={onAddToCart} />

      {/* Tabs for Description and Reviews */}
      <div className="mt-5">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Chi tiết sản phẩm
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({reviewCount})
            </button>
          </li>
        </ul>

        <div className="tab-content mt-4">
          {activeTab === "details" && (
            <div className="tab-pane fade show active">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Mô tả sản phẩm</h5>
                  <p>{product?.description || "Không có mô tả chi tiết."}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && product && (
            <div className="tab-pane fade show active">
              <ProductReviews 
                productId={id} 
                onStatsLoad={(stats) => setReviewCount(stats.total)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
