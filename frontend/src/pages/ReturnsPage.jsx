import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { formatDate, formatPrice } from "../utils/api";
import axiosInstance from "../utils/axiosConfig";

export default function ReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, completed

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await axiosInstance.get("/returns/buyer");
      console.log("Returns data:", res.data);
      setReturns(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
      setError("Không thể tải danh sách đổi trả!");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReturn = async (returnId) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu đổi trả này?")) {
      return;
    }

    try {
      await axiosInstance.post(`/returns/cancel/${returnId}`);
      alert("Đã hủy yêu cầu đổi trả thành công!");
      fetchReturns(); // Reload
    } catch (err) {
      console.error("Cancel return error:", err);
      alert(err.response?.data?.error || "Không thể hủy yêu cầu đổi trả!");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-warning text-dark",
      Approved: "bg-success",
      Rejected: "bg-danger",
      Processing: "bg-info",
      Completed: "bg-primary",
      Cancelled: "bg-secondary"
    };
    
    const labels = {
      Pending: "⏳ Chờ xác nhận",
      Approved: "✅ Đã chấp nhận",
      Rejected: "❌ Đã từ chối",
      Processing: "🔄 Đang xử lý",
      Completed: "✓ Hoàn tất",
      Cancelled: "🚫 Đã hủy"
    };

    return (
      <span className={`badge ${badges[status] || "bg-secondary"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredReturns = Array.isArray(returns) ? returns.filter((r) => {
    if (filter === "all") return true;
    return r.status.toLowerCase() === filter;
  }) : [];

  if (loading) {
    return <Spinner message="Đang tải danh sách đổi trả..." />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-arrow-return-left me-2 text-warning"></i>
          Danh sách đổi trả của tôi
        </h4>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/app/orders")}
        >
          <i className="bi bi-box-seam me-2"></i>
          Quản lý đơn hàng
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter tabs */}
      <ul className="nav nav-pills mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({returns.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Chờ xác nhận ({returns.filter((r) => r.status === "Pending").length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Đã chấp nhận ({returns.filter((r) => r.status === "Approved").length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Hoàn tất ({returns.filter((r) => r.status === "Completed").length})
          </button>
        </li>
      </ul>

      {filteredReturns.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Chưa có yêu cầu đổi trả nào.
        </div>
      ) : (
        <div className="row g-3">
          {filteredReturns.map((returnReq) => (
            <div key={returnReq.return_request_id} className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="mb-1">
                        Yêu cầu #{returnReq.return_request_id} - Đơn hàng #{returnReq.order_id}
                      </h6>
                      <small className="text-muted">
                        Ngày gửi: {formatDate(returnReq.request_date)}
                      </small>
                    </div>
                    {getStatusBadge(returnReq.status)}
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <strong>Lý do:</strong> {returnReq.reason}
                    </div>
                    <div className="col-md-6">
                      <strong>Số tiền đơn hàng:</strong>{" "}
                      {formatPrice(returnReq.total_amount)}
                    </div>
                  </div>

                  {returnReq.description && (
                    <div className="mb-2">
                      <strong>Mô tả:</strong> {returnReq.description}
                    </div>
                  )}

                  {returnReq.seller_response && (
                    <div className="alert alert-info py-2 mb-2">
                      <strong>Phản hồi từ Shop:</strong> {returnReq.seller_response}
                      {returnReq.response_date && (
                        <small className="d-block text-muted">
                          {formatDate(returnReq.response_date)}
                        </small>
                      )}
                    </div>
                  )}

                  {returnReq.refund_amount && (
                    <div className="alert alert-success py-2 mb-2">
                      <strong>Số tiền hoàn lại:</strong>{" "}
                      {formatPrice(returnReq.refund_amount)}
                      {returnReq.refunded_at && (
                        <small className="d-block text-muted">
                          Hoàn tiền: {formatDate(returnReq.refunded_at)}
                        </small>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/app/orders/${returnReq.order_id}`)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Xem đơn hàng
                    </button>

                    {returnReq.status === "Pending" && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelReturn(returnReq.return_request_id)}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Hủy yêu cầu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
