import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { ordersAPI, formatDate, formatPrice, getUser } from "../utils/api";
import ReturnRequestModal from "../components/order/ReturnRequestModal";
import ReviewModal from "../components/order/ReviewModal";
import axiosInstance from "../utils/axiosConfig";

const renderVariant = (variant) =>
  !variant || variant === "DEFAULT" ? "Mặc định" : variant;

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnRequest, setReturnRequest] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(new Set());
  const [existingReviews, setExistingReviews] = useState({});

  const [invoice, setInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceError, setInvoiceError] = useState("");
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await ordersAPI.getOrderById(id);
        setOrder(res.data);

        // Kiểm tra xem đã có yêu cầu đổi trả cho đơn này chưa
        try {
          const returnRes = await axiosInstance.get(`/returns/buyer`);
          const returnsList = Array.isArray(returnRes.data?.requests)
            ? returnRes.data.requests
            : (Array.isArray(returnRes.data) ? returnRes.data : []);
          const existingReturn = returnsList.find(
            (r) => r.order_id === parseInt(id, 10)
          );
          if (existingReturn) {
            setReturnRequest(existingReturn);
          }
        } catch {
          // bỏ qua lỗi phần đổi trả
        }

        // Kiểm tra xem đã review sản phẩm nào chưa
        try {
          const reviewRes = await axiosInstance.get(`/reviews/my-reviews`);
          const myReviews = Array.isArray(reviewRes.data?.reviews)
            ? reviewRes.data.reviews
            : (Array.isArray(reviewRes.data) ? reviewRes.data : []);
          const orderReviews = myReviews.filter((r) => r.order_id === parseInt(id, 10));
          const reviewedLineNos = new Set(orderReviews.map(r => r.line_no));
          setReviewedItems(reviewedLineNos);
          
          // Store full review objects
          const reviewsMap = {};
          orderReviews.forEach(r => {
            reviewsMap[r.line_no] = r;
          });
          setExistingReviews(reviewsMap);
        } catch {
          // bỏ qua lỗi phần review
        }
      } catch (err) {
        console.error("Không thể tải chi tiết đơn hàng:", err);
        setError(
          "Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleReturnSuccess = () => {
    setShowReturnModal(false);
    window.location.reload();
  };

  const handleReviewClick = (item) => {
    setSelectedReviewItem(item);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = async () => {
    setShowReviewModal(false);
    
    // Fetch lại danh sách reviews từ server
    try {
      const reviewRes = await axiosInstance.get(`/reviews/my-reviews`);
      const myReviews = Array.isArray(reviewRes.data?.reviews)
        ? reviewRes.data.reviews
        : (Array.isArray(reviewRes.data) ? reviewRes.data : []);
      const orderReviews = myReviews.filter((r) => r.order_id === parseInt(id, 10));
      const reviewedLineNos = new Set(orderReviews.map(r => r.line_no));
      setReviewedItems(reviewedLineNos);
      
      // Store full review objects
      const reviewsMap = {};
      orderReviews.forEach(r => {
        reviewsMap[r.line_no] = r;
      });
      setExistingReviews(reviewsMap);
    } catch (err) {
      console.error('Failed to refresh reviews:', err);
    }
    
    setSelectedReviewItem(null);
  };

  const canReview = () => {
    if (!order) return false;
    
    // Seller cannot review their own products
    const currentUser = getUser();
    if (currentUser && order.seller_id && currentUser.seller_id === order.seller_id) {
      return false;
    }
    
    // Only allow review when order is Completed or Delivered
    return order.status === 'Completed' || order.status === 'Delivered';
  };

  if (loading) {
    return <Spinner message="Đang tải chi tiết đơn hàng..." />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-3">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Không tìm thấy thông tin đơn hàng.
        </div>
      </div>
    );
  }

  const subtotal =
    typeof order.subtotal === "number"
      ? order.subtotal
      : (order.items || []).reduce(
          (sum, it) => sum + (it.line_total || 0),
          0
        );

  // Điều kiện cho phép đổi trả
  const canReturn = () => {
    if (!order) return false;

    // Check if current user is the seller of this order - sellers can't return their own orders
    const currentUser = getUser();
    if (currentUser && order.seller_id && currentUser.seller_id === order.seller_id) {
      return false;
    }

    const status = (order.status || "").trim();
    if (!["Delivered", "Completed"].includes(status)) {
      return false;
    }

    if (returnRequest) {
      return false;
    }

    const deliveredDate = new Date(order.delivered_at || order.date);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now - deliveredDate) / (1000 * 60 * 60 * 24)
    );

    return daysSinceDelivery <= 7;
  };

  const getReturnButtonText = () => {
    const currentUser = getUser();
    if (currentUser && order && order.seller_id && currentUser.seller_id === order.seller_id) {
      return null; // Don't show return button for sellers viewing their own orders
    }

    if (returnRequest) {
      const statusMap = {
        Pending: "Chờ xác nhận",
        Approved: "Đã chấp nhận",
        Rejected: "Đã từ chối",
        Processing: "Đang xử lý",
        Completed: "Hoàn tất",
        Cancelled: "Đã hủy",
      };
      return statusMap[returnRequest.status] || returnRequest.status;
    }

    const status = (order.status || "").trim();
    if (!["Delivered", "Completed"].includes(status)) {
      return "Chưa thể đổi trả";
    }

    const deliveredDate = new Date(order.delivered_at || order.date);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now - deliveredDate) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceDelivery > 7) {
      return "Hết hạn đổi trả";
    }
    return "Yêu cầu đổi trả";
  };

  const handleUpdateOrderStatus = async () => {
    if (!newStatus) {
      alert("Vui lòng chọn trạng thái mới");
      return;
    }

    setUpdatingStatus(true);
    try {
      await axiosInstance.put(`/orders/${id}/status`, { status: newStatus });
      alert("Cập nhật trạng thái đơn hàng thành công!");
      window.location.reload();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(err.response?.data?.error || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canViewInvoice = () => {
    if (!order) return false;
    // Allow viewing invoice from the moment order is created
    return true;
  };

  const handleViewInvoice = async () => {
    setInvoiceError("");
    setLoadingInvoice(true);
    try {
      const res = await axiosInstance.get(`/invoice/order/${id}`);
      setInvoice(res.data.invoice);
      setInvoiceItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      setInvoiceError(
        err.response?.data?.error ||
          "Không thể tải hóa đơn cho đơn hàng này."
      );
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <div className="container py-4">
      <button
        type="button"
        className="btn btn-link p-0 mb-3"
        onClick={() => navigate(-1)}
      >
        &laquo; Quay lại danh sách đơn hàng
      </button>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-receipt me-2" />
          Chi tiết đơn hàng {order.code}
        </h4>

        <div className="d-flex gap-2">
          {returnRequest && (
            <div className="alert alert-warning py-2 px-3 mb-0">
              <i className="bi bi-arrow-return-left me-2"></i>
              Đã gửi yêu cầu đổi trả (trạng thái: {returnRequest.status})
            </div>
          )}
          {canViewInvoice() && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleViewInvoice}
              disabled={loadingInvoice}
            >
              {loadingInvoice ? "Đang tải hóa đơn..." : "Xem hóa đơn"}
            </button>
          )}

          {getReturnButtonText() && (
            <button
              type="button"
              className={`btn ${
                returnRequest
                  ? returnRequest.status === "Rejected" ||
                    returnRequest.status === "Cancelled"
                    ? "btn-outline-danger"
                    : returnRequest.status === "Completed"
                    ? "btn-outline-success"
                    : "btn-outline-warning"
                  : canReturn()
                  ? "btn-warning"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                if (canReturn()) {
                  setShowReturnModal(true);
                } else {
                  alert(
                    "Đơn hàng chưa đủ điều kiện đổi trả hoặc đã quá 7 ngày!"
                  );
                }
              }}
            >
              <i className="bi bi-arrow-return-left me-2"></i>
              {getReturnButtonText()}
            </button>
          )}
        </div>
      </div>

      {returnRequest && (
        <div
          className={`alert ${
            returnRequest.status === "Rejected" ||
            returnRequest.status === "Cancelled"
              ? "alert-danger"
              : returnRequest.status === "Completed"
              ? "alert-success"
              : "alert-warning"
          } py-2 mb-3`}
        >
          <strong>Yêu cầu đổi trả:</strong> {returnRequest.reason}
          {returnRequest.description && <> - {returnRequest.description}</>}
          {returnRequest.seller_response && (
            <>
              <br />
              <strong>Phản hồi từ Shop:</strong>{" "}
              {returnRequest.seller_response}
            </>
          )}
        </div>
      )}

      {invoiceError && (
        <div className="alert alert-danger py-2 mb-3">{invoiceError}</div>
      )}

      {invoice && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="fw-bold mb-3">
              Hóa đơn {invoice.invoiceNumber}
            </h6>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Mã đơn:</strong> ORD
                  {String(invoice.orderId).padStart(6, "0")}
                </p>
                <p className="mb-1">
                  <strong>Ngày xuất hóa đơn:</strong>{" "}
                  {formatDate(invoice.issueDate)}
                </p>
                <p className="mb-1">
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  {invoice.paymentStatus}
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-1">
                  <strong>Tạm tính:</strong>{" "}
                  {formatPrice(invoice.subtotal || 0)}
                </p>
                <p className="mb-1">
                  <strong>Thuế ({invoice.taxRate || 0}%):</strong>{" "}
                  {formatPrice(invoice.taxAmount || 0)}
                </p>
                <p className="mb-1">
                  <strong>Phí vận chuyển:</strong>{" "}
                  {formatPrice(invoice.shippingFee || 0)}
                </p>
                <p className="mb-0 fs-5">
                  <strong>Tổng cộng:</strong>{" "}
                  {formatPrice(invoice.grandTotal || 0)}
                </p>
              </div>
            </div>

            {invoiceItems.length > 0 && (
              <div className="table-responsive mt-3">
                <table className="table table-sm mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((it) => (
                      <tr key={it.lineNo}>
                        <td>{it.lineNo}</td>
                        <td>{it.description}</td>
                        <td>{it.qty}</td>
                        <td>{formatPrice(it.unitPrice)}</td>
                        <td>{formatPrice(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Thông tin đơn hàng</h6>
              <p className="mb-2">
                <strong>Mã đơn:</strong> {order.code}
              </p>
              <p className="mb-2">
                <strong>Ngày đặt:</strong> {formatDate(order.date)}
              </p>
              {order.shipped_date && (
                <p className="mb-2">
                  <strong>Ngày gửi hàng:</strong> {formatDate(order.shipped_date)}
                </p>
              )}
              {order.delivered_date && (
                <p className="mb-2">
                  <strong>Ngày giao hàng:</strong> {formatDate(order.delivered_date)}
                </p>
              )}
              <p className="mb-2">
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`badge ${
                    order.status === "Pending"
                      ? "bg-warning"
                      : order.status === "Paid"
                      ? "bg-info"
                      : order.status === "Processing"
                      ? "bg-primary"
                      : order.status === "Completed"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p className="mb-2">
                <strong>Shop:</strong> {order.shop_name || '-'}
              </p>

              {/* Seller can update order status */}
              {(() => {
                const currentUser = getUser();
                const isSeller = currentUser && order.seller_id && currentUser.seller_id === order.seller_id;
                if (isSeller) {
                  return (
                    <div className="mt-3 pt-3 border-top">
                      <label className="form-label fw-bold">Cập nhật trạng thái đơn hàng:</label>
                      <div className="input-group">
                        <select 
                          className="form-select" 
                          value={newStatus} 
                          onChange={(e) => setNewStatus(e.target.value)}
                          disabled={updatingStatus}
                        >
                          <option value="">-- Chọn trạng thái --</option>
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Packing">Packing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleUpdateOrderStatus}
                          disabled={updatingStatus || !newStatus}
                        >
                          {updatingStatus ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">
                Thông tin giao hàng
              </h6>
              
              {/* Người gửi */}
              {order.sender_address && (
                <div className="mb-3 pb-3 border-bottom">
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-box-seam me-2"></i>Người gửi (Shop)
                  </h6>
                  <p className="mb-1">
                    <strong>Tên:</strong> {order.sender_address.recipient_name}
                  </p>
                  <p className="mb-1">
                    <strong>SĐT:</strong> {order.sender_address.phone}
                  </p>
                  <p className="mb-0">
                    <strong>Địa chỉ:</strong> {order.sender_address.address}, {order.sender_address.city}
                  </p>
                </div>
              )}
              
              {/* Người nhận */}
              <div>
                <h6 className="text-muted mb-2">
                  <i className="bi bi-geo-alt me-2"></i>Người nhận
                </h6>
                {order.shipping_address ? (
                  <>
                    <p className="mb-1">
                      <strong>Tên:</strong> {order.shipping_address.recipient_name}
                    </p>
                    <p className="mb-1">
                      <strong>SĐT:</strong> {order.shipping_address.phone}
                    </p>
                    <p className="mb-1">
                      <strong>Địa chỉ:</strong> {order.shipping_address.address}, {order.shipping_address.city}
                    </p>
                    <p className="mb-0">
                      <strong>Mã bưu chính:</strong> {order.shipping_address.postal_code || "-"}
                    </p>
                  </>
                ) : (
                  <p className="mb-0 text-muted">Không có thông tin giao hàng.</p>
                )}
              </div>
            </div>
         </div>
       </div>
     </div>

     <div className="card">
       <div className="card-body">
         <h6 className="fw-bold mb-3">Sản phẩm</h6>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>Phiên bản</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                  {canReview() && <th>Đánh giá</th>}
                </tr>
              </thead>
              <tbody>
                {order.items?.map((it) => (
                  <tr key={it.line_no}>
                    <td>{it.line_no}</td>
                    <td>{it.name}</td>
                    <td>{renderVariant(it.variant)}</td>
                    <td>{it.qty}</td>
                    <td>{formatPrice(it.unit_price)}</td>
                    <td>{formatPrice(it.line_total)}</td>
                    {canReview() && (
                      <td>
                        {reviewedItems.has(it.line_no) ? (
                          <div className="d-flex flex-column align-items-start">
                            <button
                              className="btn btn-sm btn-success mb-1"
                              type="button"
                              disabled
                              title="Bạn đã đánh giá mục này"
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Đã đánh giá
                            </button>
                            <small className="text-muted">
                              Đánh giá của bạn đã gửi.
                            </small>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleReviewClick(it)}
                          >
                            <i className="bi bi-star me-1"></i>
                            Viết đánh giá
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-end">
            <div>
              <span className="me-2">Tạm tính:</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span className="me-2">Phí vận chuyển:</span>
              <strong>{formatPrice(order.shipping_fee || 0)}</strong>
              {order.carrier_name && (
                <span className="text-muted ms-2">
                  ({order.carrier_name} - {order.service_name})
                </span>
              )}
            </div>
            <div className="fs-5 mt-2">
              <span className="me-2">Tổng tiền (chưa bao gồm thuế):</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>
        </div>
      </div>

      {showReturnModal && (
        <ReturnRequestModal
          order={order}
          onClose={() => setShowReturnModal(false)}
          onSuccess={handleReturnSuccess}
        />
      )}

      {showReviewModal && selectedReviewItem && (
        <ReviewModal
          order={order}
          orderItem={selectedReviewItem}
          existingReview={existingReviews[selectedReviewItem.line_no]}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReviewItem(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
