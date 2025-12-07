import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { formatDate, formatPrice } from "../utils/api";
import axiosInstance from "../utils/axiosConfig";

export default function SellerReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await axiosInstance.get("/returns/seller");
      console.log("Seller returns data:", res.data);
      const list = Array.isArray(res.data?.requests) ? res.data.requests : (Array.isArray(res.data) ? res.data : []);
      setReturns(list);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
      setError("Không thể tải danh sách đổi trả!");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (returnId, approve) => {
    const response = prompt(
      approve 
        ? "Nhập lý do chấp nhận (tùy chọn):"
        : "Nhập lý do từ chối:"
    );

    if (!approve && !response) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    setProcessingId(returnId);

    try {
      await axiosInstance.post(`/returns/respond/${returnId}`, {
        action: approve ? "approve" : "reject",
        response
      });

      alert(approve ? "Đã chấp nhận yêu cầu đổi trả!" : "Đã từ chối yêu cầu đổi trả!");
      fetchReturns(); // Reload
    } catch (err) {
      console.error("Respond error:", err);
      alert(err.response?.data?.error || "Không thể xử lý yêu cầu!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefund = async (returnId, totalAmount) => {
    const refundAmount = prompt(
      `Nhập số tiền hoàn lại (Tối đa: ${formatPrice(totalAmount)}):`,
      totalAmount
    );

    if (!refundAmount || isNaN(refundAmount)) {
      alert("Số tiền không hợp lệ!");
      return;
    }

    if (parseFloat(refundAmount) > totalAmount) {
      alert("Số tiền hoàn lại không được vượt quá tổng đơn hàng!");
      return;
    }

    setProcessingId(returnId);

    try {
      await axiosInstance.post(`/returns/refund/${returnId}`, {
        refundAmount: parseFloat(refundAmount)
      });

      alert("Đã xử lý hoàn tiền thành công!");
      fetchReturns(); // Reload
    } catch (err) {
      console.error("Refund error:", err);
      alert(err.response?.data?.error || "Không thể xử lý hoàn tiền!");
    } finally {
      setProcessingId(null);
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
      Pending: "⏳ Chờ xử lý",
      Approved: "✅ Đã chấp nhận",
      Rejected: "❌ Đã từ chối",
      Processing: "🔄 Đang hoàn tiền",
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
          Quản lý yêu cầu đổi trả (Seller)
        </h4>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/app/seller/dashboard")}
        >
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
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
            Chờ xử lý ({returns.filter((r) => r.status === "Pending").length})
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
                        Người mua: {returnReq.buyer_name} | Ngày gửi: {formatDate(returnReq.request_date)}
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
                      <strong>Mô tả từ khách:</strong> {returnReq.description}
                    </div>
                  )}

                  {returnReq.seller_response && (
                    <div className="alert alert-info py-2 mb-2">
                      <strong>Phản hồi của bạn:</strong> {returnReq.seller_response}
                      {returnReq.response_date && (
                        <small className="d-block text-muted">
                          {formatDate(returnReq.response_date)}
                        </small>
                      )}
                    </div>
                  )}

                  {returnReq.refund_amount && (
                    <div className="alert alert-success py-2 mb-2">
                      <strong>Số tiền đã hoàn:</strong>{" "}
                      {formatPrice(returnReq.refund_amount)}
                      {returnReq.refunded_at && (
                        <small className="d-block text-muted">
                          Hoàn tiền: {formatDate(returnReq.refunded_at)}
                        </small>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    {returnReq.status === "Pending" && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleRespond(returnReq.return_request_id, true)}
                          disabled={processingId === returnReq.return_request_id}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Chấp nhận
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRespond(returnReq.return_request_id, false)}
                          disabled={processingId === returnReq.return_request_id}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Từ chối
                        </button>
                      </>
                    )}

                    {returnReq.status === "Approved" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleRefund(returnReq.return_request_id, returnReq.total_amount)}
                        disabled={processingId === returnReq.return_request_id}
                      >
                        <i className="bi bi-cash-coin me-1"></i>
                        Xử lý hoàn tiền
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
