import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import Spinner from "../components/common/Spinner";

const formatCurrencyVN = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " ₫";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Đang xử lý" },
  { value: "processing", label: "Đang đóng gói" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const mapDbStatusToClient = (status) => {
  const map = {
    Pending: "pending",
    Packing: "processing",
    Shipped: "shipped",
    Completed: "delivered",
    Cancelled: "cancelled",
  };
  return map[status] || "pending";
};

const mapDbStatusToLabel = (status) => {
  const map = {
    Pending: "Đang xử lý",
    Paid: "Đã thanh toán",
    Packing: "Đang đóng gói",
    Shipped: "Đang giao",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
    Refunded: "Hoàn tiền",
  };
  return map[status] || status;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats"); // stats | users | products | orders
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const showError = (text) => setMessage({ type: "error", text });
  const showSuccess = (text) => setMessage({ type: "success", text });

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/stats");
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi tải thống kê admin:", err);
      showError("Không thể tải thống kê hệ thống.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { search: searchTerm.trim() || undefined },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Lỗi tải danh sách users:", err);
      showError("Không thể tải danh sách người dùng.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products", {
        params: { search: searchTerm.trim() || undefined },
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách sản phẩm:", err);
      showError("Không thể tải danh sách sản phẩm.");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/admin/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn hàng:", err);
      showError("Không thể tải danh sách đơn hàng.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      showSuccess("Xóa user thành công.");
      fetchUsers();
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      showError(
        err.response?.data?.error || "Không thể xóa user. Vui lòng thử lại."
      );
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      await axiosInstance.put(`/admin/products/${productId}/toggle`);
      showSuccess("Cập nhật trạng thái sản phẩm thành công.");
      fetchProducts();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái sản phẩm:", err);
      showError("Không thể cập nhật trạng thái sản phẩm.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await axiosInstance.delete(`/admin/products/${productId}`);
      showSuccess("Xóa sản phẩm thành công.");
      fetchProducts();
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      showError("Không thể xóa sản phẩm.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      showSuccess("Cập nhật trạng thái đơn hàng thành công.");
      fetchOrders();
    } catch (err) {
      console.error("Lỗi cập nhật đơn hàng:", err);
      showError("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  if (loading) {
    return <Spinner message="Đang tải dữ liệu admin..." />;
  }

  const safeStats = stats || {
    users: 0,
    sellers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    ordersByStatus: [],
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-shield-lock me-2" />
        Admin Dashboard
      </h4>

      {message && (
        <div
          className={`alert alert-${
            message.type === "success" ? "success" : "danger"
          } alert-dismissible fade show`}
          role="alert"
        >
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage(null)}
          />
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Thống kê
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Quản lý Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Quản lý sản phẩm
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Quản lý đơn hàng
          </button>
        </li>
      </ul>

      {/* Stats */}
      {activeTab === "stats" && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body text-center">
                <h5>Tổng Users</h5>
                <h2>{safeStats.users}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body text-center">
                <h5>Sellers</h5>
                <h2>{safeStats.sellers}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <h5>Sản phẩm</h5>
                <h2>{safeStats.products}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body text-center">
                <h5>Đơn hàng</h5>
                <h2>{safeStats.orders}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-dark text-white h-100">
              <div className="card-body text-center">
                <h5>Tổng doanh thu</h5>
                <h2>{formatCurrencyVN(safeStats.revenue)}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Đơn hàng theo trạng thái</h5>
                <ul className="list-group">
                  {safeStats.ordersByStatus?.length === 0 && (
                    <li className="list-group-item text-muted">
                      Chưa có dữ liệu.
                    </li>
                  )}
                  {safeStats.ordersByStatus?.map((item) => (
                    <li
                      key={item.status}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>{mapDbStatusToLabel(item.status)}</span>
                      <span className="badge bg-primary">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm user (email, tên)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchUsers();
              }}
            />
          </div>

          <div className="table-responsive bg-white rounded shadow-sm">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Tên hiển thị</th>
                  <th>Role</th>
                  <th>Shop</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-muted"
                    >
                      Không tìm thấy user nào.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.email}</td>
                      <td>{user.display_name}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            user.role === "Admin"
                              ? "danger"
                              : user.role === "Seller"
                              ? "warning"
                              : "secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.shop_name || "-"}</td>
                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchProducts();
              }}
            />
          </div>

          <div className="table-responsive bg-white rounded shadow-sm">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-4 text-muted"
                    >
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.product_id}>
                      <td>{p.product_id}</td>
                      <td>{p.product_name}</td>
                      <td>{p.seller_name}</td>
                      <td>{p.shop_name}</td>
                      <td>
                        {p.min_price === p.max_price
                          ? formatCurrencyVN(p.min_price)
                          : `${formatCurrencyVN(
                              p.min_price
                            )} - ${formatCurrencyVN(p.max_price)}`}
                      </td>
                      <td>{p.total_stock || 0}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            p.is_active ? "success" : "secondary"
                          }`}
                        >
                          {p.is_active ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() =>
                            navigate(`/app/product/${p.product_id}`)
                          }
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            p.is_active ? "btn-warning" : "btn-success"
                          } me-1`}
                          onClick={() => handleToggleProduct(p.product_id)}
                        >
                          <i
                            className={`bi bi-${
                              p.is_active ? "eye-slash" : "eye"
                            }`}
                          />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(p.product_id)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders */}
      {activeTab === "orders" && (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-muted"
                  >
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const clientStatus = mapDbStatusToClient(
                    order.order_status
                  );
                  return (
                    <tr key={order.order_id}>
                      <td>{`ORD${String(order.order_id).padStart(
                        6,
                        "0"
                      )}`}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.email}</td>
                      <td>{formatCurrencyVN(order.total_amount)}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={clientStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.order_id,
                              e.target.value
                            )
                          }
                        >
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() =>
                            navigate(`/app/orders/${order.order_id}`)
                          }
                        >
                          <i className="bi bi-eye" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

