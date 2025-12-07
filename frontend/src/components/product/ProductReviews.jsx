import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import RatingStars from "../common/RatingStars";
import { formatDate } from "../../utils/api";

export default function ProductReviews({ productId, onStatsLoad }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: {} });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${productId}/reviews`);
      setReviews(res.data.reviews || []);
      const loadedStats = res.data.stats || { average: 0, total: 0, distribution: {} };
      setStats(loadedStats);
      if (onStatsLoad) onStatsLoad(loadedStats);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  }

  return (
    <div className="product-reviews">
      <h5 className="fw-bold mb-4">Đánh giá sản phẩm</h5>

      {/* Rating summary */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4 text-center border-end">
              <div className="display-4 fw-bold text-warning">
                {stats.average.toFixed(1)}
              </div>
              <RatingStars rating={stats.average} />
              <div className="text-muted mt-2">{stats.total} đánh giá</div>
            </div>
            <div className="col-md-8">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{ width: "60px" }}>
                      {star} <i className="bi bi-star-fill text-warning"></i>
                    </span>
                    <div className="progress flex-grow-1 me-2" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-muted" style={{ width: "40px" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="text-center text-muted py-4">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{review.buyer_name || "Khách hàng"}</strong>
                    <div className="mt-1">
                      <RatingStars rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <small className="text-muted">
                    {formatDate(review.created_at)}
                  </small>
                </div>
                {review.content && (
                  <p className="mb-0 mt-2">{review.content}</p>
                )}
                {review.order_code && (
                  <small className="text-muted">
                    Đơn hàng: {review.order_code}
                  </small>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
