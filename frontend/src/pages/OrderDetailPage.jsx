import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { ordersAPI, formatDate, formatPrice } from "../utils/api";

const renderVariant = (variant) =>
  !variant || variant === "DEFAULT" ? "Mặc định" : variant;

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await ordersAPI.getOrderById(id);
        setOrder(res.data);
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

  return (
    <div className="container py-4">
      <button
        type="button"
        className="btn btn-link p-0 mb-3"
        onClick={() => navigate(-1)}
      >
        &laquo; Quay lại danh sách đơn hàng
      </button>

      <h4 className="fw-bold mb-3">
        <i className="bi bi-receipt me-2" />
        Chi tiết đơn hàng {order.code}
      </h4>

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
    </div>
  );
}

