import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { formatDate } from "../utils/api";
import Spinner from "../components/common/Spinner";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    rating: "",
    search: "",
  });
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [filters.page, filters.rating]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.rating) params.rating = filters.rating;
      if (filters.search) params.search = filters.search;

      const res = await axiosInstance.get("/reviews/admin/reviews", { params });
      setReviews(res.data.reviews || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/reviews/admin/reviews/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      setDeleting(reviewId);
      await axiosInstance.delete(`/reviews/admin/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.review_id !== reviewId));
      loadStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert("Không thể xóa đánh giá: " + (err.response?.data?.error || "Lỗi không xác định"));
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    loadReviews();
  };

  const renderStars = (rating) => {
    return (
      <span className="text-warning">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`bi bi-star${i < rating ? "-fill" : ""}`}
          ></i>
        ))}
      </span>
    );
  };

  if (loading && reviews.length === 0) {
    return <Spinner message="Đang tải danh sách đánh giá..." />;
  }

  return (
    <div className="container-fluid py-4">
      <h4 className="fw-bold mb-4">Quản lý đánh giá</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="mb-0">{stats.total_reviews}</h2>
                <small className="text-muted">Tổng đánh giá</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="mb-0">{stats.average_rating.toFixed(1)}</h2>
                <small className="text-muted">Điểm trung bình</small>
                <div className="mt-2">{renderStars(Math.round(stats.average_rating))}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="mb-0">{stats.unique_reviewers}</h2>
                <small className="text-muted">Người đánh giá</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <small className="text-muted d-block">Phân bố sao:</small>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="d-flex align-items-center mb-1">
                    <span className="me-2" style={{ width: "20px" }}>{star}</span>
                    <i className="bi bi-star-fill text-warning me-2"></i>
                    <div className="progress flex-grow-1" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{
                          width: `${stats.total_reviews > 0 ? (stats.distribution[star] / stats.total_reviews) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ms-2" style={{ width: "30px" }}>{stats.distribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Lọc theo sao:</label>
              <select
                className="form-select"
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value, page: 1 })
                }
              >
                <option value="">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tìm kiếm:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo sản phẩm, người dùng, nội dung..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-search me-2"></i>Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sản phẩm</th>
                  <th>Người đánh giá</th>
                  <th>Đơn hàng</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Không có đánh giá nào
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.review_id}>
                      <td>{review.review_id}</td>
                      <td>
                        <strong>{review.product_name}</strong>
                        {review.variant_code && review.variant_code !== "DEFAULT" && (
                          <div>
                            <small className="text-muted">
                              Phiên bản: {review.variant_code}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{review.buyer_name}</div>
                        <small className="text-muted">{review.buyer_email}</small>
                      </td>
                      <td>{review.order_code}</td>
                      <td>{renderStars(review.rating)}</td>
                      <td>
                        <div
                          style={{
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={review.content}
                        >
                          {review.content || <em className="text-muted">Không có nhận xét</em>}
                        </div>
                      </td>
                      <td>{formatDate(review.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(review.review_id)}
                          disabled={deleting === review.review_id}
                        >
                          {deleting === review.review_id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${!pagination.hasPrev ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={!pagination.hasPrev}
                  >
                    Trước
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </span>
                </li>
                <li className={`page-item ${!pagination.hasNext ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={!pagination.hasNext}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
