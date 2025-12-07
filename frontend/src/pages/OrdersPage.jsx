import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { ordersAPI, formatDate, formatPrice } from "../utils/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await ordersAPI.getOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Không thể tải danh sách đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <Spinner message="Đang tải đơn hàng..." />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-bag-check me-2"></i> Đơn hàng của bạn
      </h4>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {orders.length === 0 ? (
        <div className="alert alert-info">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="table-responsive bg-white shadow-sm rounded">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: "15%" }}>Mã đơn</th>
                <th style={{ width: "25%" }}>Ngày đặt</th>
                <th style={{ width: "20%" }}>Tổng tiền</th>
                <th style={{ width: "20%" }}>Trạng thái</th>
                <th style={{ width: "20%" }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/orders/${o.id}`)}
                >
                  <td>{o.code}</td>
                  <td>{formatDate(o.date)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === "Đã giao"
                          ? "bg-success"
                          : o.status === "Đã hủy"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/orders/${o.id}`);
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

