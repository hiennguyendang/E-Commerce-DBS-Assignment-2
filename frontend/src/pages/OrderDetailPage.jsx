import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { ordersAPI, formatDate, formatPrice } from "../utils/api";
import ReturnRequestModal from "../components/order/ReturnRequestModal";
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

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await ordersAPI.getOrderById(id);
        setOrder(res.data);

        // Check if return request exists for this order
        try {
          const returnRes = await axiosInstance.get(`/returns/buyer`);
          const existingReturn = returnRes.data.find(
            (r) => r.order_id === parseInt(id)
          );
          if (existingReturn) {
            setReturnRequest(existingReturn);
          }
        } catch (err) {
          console.log("No return request found for this order");
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

  // Check if order is eligible for return
  const canReturn = () => {
    if (!order) return false;
    
    // Must be delivered or completed
    const status = (order.status || '').trim().toLowerCase();
    if (!['delivered', 'completed'].includes(status)) {
      console.log('❌ Cannot return - status:', order.status);
      return false;
    }

    // Must not have existing return request
    if (returnRequest) {
      console.log('❌ Cannot return - already has return request');
      return false;
    }

    // Must be within 7 days of delivery
    const deliveredDate = new Date(order.delivered_at || order.date);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
    
    console.log('✅ Can return:', { status: order.status, daysSinceDelivery });
    return daysSinceDelivery <= 7;
  };

  const getReturnButtonText = () => {
    if (returnRequest) {
      const statusMap = {
        'Pending': '⏳ Chờ xác nhận',
        'Approved': '✅ Đã chấp nhận',
        'Rejected': '❌ Đã từ chối',
        'Processing': '🔄 Đang xử lý',
        'Completed': '✓ Hoàn tất',
        'Cancelled': '🚫 Đã hủy'
      };
      return statusMap[returnRequest.status] || returnRequest.status;
    }
    
    const status = (order?.status || '').trim().toLowerCase();
    if (!['delivered', 'completed'].includes(status)) {
      return 'Chưa thể đổi trả';
    }
    
    const deliveredDate = new Date(order.delivered_at || order.date);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery > 7) {
      return 'Hết hạn đổi trả';
    }
    return 'Yêu cầu đổi trả';
  };

  const handleReturnSuccess = () => {
    // Reload order detail to get updated return request
    window.location.reload();
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
        
        <button
          type="button"
          className={`btn ${
            returnRequest 
              ? returnRequest.status === 'Rejected' || returnRequest.status === 'Cancelled'
                ? 'btn-outline-danger'
                : returnRequest.status === 'Completed'
                ? 'btn-outline-success'
                : 'btn-outline-warning'
              : canReturn()
              ? 'btn-warning'
              : 'btn-outline-secondary'
          }`}
          onClick={() => {
            alert('Nút được click!');
            console.log('🔘 Return button clicked', { 
              canReturn: canReturn(), 
              order: order,
              returnRequest: returnRequest 
            });
            if (canReturn()) {
              alert('Đang mở modal đổi trả...');
              setShowReturnModal(true);
            } else {
              alert('Đơn hàng chưa đủ điều kiện đổi trả hoặc đã quá hạn 7 ngày!');
            }
          }}
        >
          <i className="bi bi-arrow-return-left me-2"></i>
          {getReturnButtonText()}
        </button>
      </div>

      {returnRequest && (
        <div className={`alert ${
          returnRequest.status === 'Rejected' || returnRequest.status === 'Cancelled'
            ? 'alert-danger'
            : returnRequest.status === 'Completed'
            ? 'alert-success'
            : 'alert-warning'
        } py-2 mb-3`}>
          <strong>Yêu cầu đổi trả:</strong> {returnRequest.reason}
          {returnRequest.description && (
            <> - {returnRequest.description}</>
          )}
          {returnRequest.seller_response && (
            <>
              <br />
              <strong>Phản hồi từ Shop:</strong> {returnRequest.seller_response}
            </>
          )}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">Thông tin đơn hàng</h6>
              <p className="mb-1">
                <strong>Mã đơn:</strong> {order.code}
              </p>
              <p className="mb-1">
                <strong>Ngày đặt:</strong> {formatDate(order.date)}
              </p>
              <p className="mb-1">
                <strong>Trạng thái:</strong>{" "}
                <span className="badge bg-secondary">
                  {order.status_label || order.status}
                </span>
              </p>
              {order.seller && (
                <p className="mb-0">
                  <strong>Shop:</strong> {order.seller.shop_name} (
                  {order.seller.id})
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">Thông tin giao hàng</h6>
              {order.shipping_address ? (
                <>
                  <p className="mb-1">
                    <strong>Người nhận:</strong>{" "}
                    {order.shipping_address.recipient_name}
                  </p>
                  <p className="mb-1">
                    <strong>Số điện thoại:</strong>{" "}
                    {order.shipping_address.phone}
                  </p>
                  <p className="mb-1">
                    <strong>Địa chỉ:</strong>{" "}
                    {order.shipping_address.address},{" "}
                    {order.shipping_address.city}
                  </p>
                  <p className="mb-0">
                    <strong>Mã bưu chính:</strong>{" "}
                    {order.shipping_address.postal_code || "-"}
                  </p>
                </>
              ) : (
                <p className="mb-0 text-muted">
                  Không có thông tin giao hàng.
                </p>
              )}
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
            </div>
            <div className="fs-5 mt-2">
              <span className="me-2">Tổng cộng:</span>
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
    </div>
  );
}

