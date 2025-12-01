import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import Spinner from "../components/common/Spinner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, products, orders
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🔍 AdminDashboard mounted');
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      console.log('📡 Fetching admin stats...');
      const res = await axiosInstance.get("/admin/stats");
      console.log('✅ Stats:', res.data);
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Không thể tải thống kê:", err);
      setMessage({ text: "Không thể tải thống kê", type: "error" });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { search: searchTerm }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Lỗi tải users:", err);
      setMessage({ text: "Không thể tải danh sách users", type: "error" });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products", {
        params: { search: searchTerm }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải products:", err);
      setMessage({ text: "Không thể tải danh sách sản phẩm", type: "error" });
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải orders:", err);
      setMessage({ text: "Không thể tải danh sách đơn hàng", type: "error" });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      setMessage({ text: "Xóa user thành công!", type: "success" });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      setMessage({ text: err.response?.data?.error || "Không thể xóa user", type: "error" });
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      await axiosInstance.put(`/admin/products/${productId}/toggle`);
      setMessage({ text: "Cập nhật trạng thái sản phẩm thành công!", type: "success" });
      fetchProducts();
    } catch (err) {
      console.error("Lỗi toggle product:", err);
      setMessage({ text: "Không thể cập nhật trạng thái", type: "error" });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await axiosInstance.delete(`/admin/products/${productId}`);
      setMessage({ text: "Xóa sản phẩm thành công!", type: "success" });
      fetchProducts();
    } catch (err) {
      console.error("Lỗi xóa product:", err);
      setMessage({ text: "Không thể xóa sản phẩm", type: "error" });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setMessage({ text: "Cập nhật trạng thái đơn hàng thành công!", type: "success" });
      fetchOrders();
    } catch (err) {
      console.error("Lỗi update order:", err);
      setMessage({ text: "Không thể cập nhật trạng thái đơn hàng", type: "error" });
    }
  };

  if (loading) return <Spinner message="Đang tải dữ liệu admin..." />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-shield-lock me-2"></i> Admin Dashboard
      </h4>

      {/* Message notification */}
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Thống kê
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Quản lý Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Quản lý Sản phẩm
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛍️ Quản lý Đơn hàng
          </button>
        </li>
      </ul>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h5>👥 Tổng Users</h5>
                <h2>{stats.users}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h5>🏪 Sellers</h5>
                <h2>{stats.sellers}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h5>📦 Sản phẩm</h5>
                <h2>{stats.products}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h5>🛍️ Đơn hàng</h5>
                <h2>{stats.orders}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-dark text-white">
              <div className="card-body text-center">
                <h5>💰 Tổng Doanh thu</h5>
                <h2>{(stats.revenue || 0).toLocaleString("vi-VN")}đ</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5>📊 Đơn hàng theo trạng thái</h5>
                <ul className="list-group">
                  {stats.ordersByStatus?.map(item => (
                    <li key={item.order_status} className="list-group-item d-flex justify-content-between">
                      <span>{item.order_status}</span>
                      <span className="badge bg-primary">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm kiếm user (email, tên)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
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
                  <th>Shop Name</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Không tìm thấy user nào
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.email}</td>
                      <td>{user.display_name}</td>
                      <td>
                        <span className={`badge bg-${user.role === 'Admin' ? 'danger' : user.role === 'Seller' ? 'warning' : 'secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.shop_name || '-'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          <i className="bi bi-trash"></i>
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

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchProducts()}
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
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.product_id}>
                      <td>{p.product_id}</td>
                      <td>{p.product_name}</td>
                      <td>{p.seller_name}</td>
                      <td>{p.shop_name}</td>
                      <td>
                        {p.min_price === p.max_price 
                          ? `${(p.min_price || 0).toLocaleString("vi-VN")}đ`
                          : `${(p.min_price || 0).toLocaleString("vi-VN")}đ - ${(p.max_price || 0).toLocaleString("vi-VN")}đ`
                        }
                      </td>
                      <td>{p.total_stock || 0}</td>
                      <td>
                        <span className={`badge bg-${p.is_active ? 'success' : 'secondary'}`}>
                          {p.is_active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${p.is_active ? 'btn-warning' : 'btn-success'} me-1`}
                          onClick={() => handleToggleProduct(p.product_id)}
                        >
                          <i className={`bi bi-${p.is_active ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(p.product_id)}
                        >
                          <i className="bi bi-trash"></i>
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

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã ĐH</th>
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
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.email}</td>
                    <td>{(order.total_amount || 0).toLocaleString("vi-VN")}đ</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.order_status}
                        onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn btn-sm btn-info">
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
