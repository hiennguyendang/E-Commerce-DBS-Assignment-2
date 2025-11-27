import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";

const EMPTY_FORM = {
  title: "",
  description: "",
  category_ids: [],
  variants: [{ name: "Mặc định", price: 0, stock: 0 }],
  imagesText: "",
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

const mapOrderStatus = (status) => {
  const map = {
    Pending: "Đang xử lý",
    Paid: "Đã thanh toán",
    Packing: "Đang đóng gói",
    Shipped: "Đã gửi hàng",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
    Refunded: "Hoàn tiền",
  };
  return map[status] || status;
};

export default function SellerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [productRes, statsRes, ordersRes, categoryRes] = await Promise.all([
        axiosInstance.get("/seller/products"),
        axiosInstance.get("/reports/seller/stats"),
        axiosInstance.get("/seller/orders"),
        axiosInstance.get("/categories"),
      ]);

      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setStats(statsRes.data || null);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Lỗi tải dữ liệu seller:", err);
      setMessage({
        type: "error",
        text: "Không thể tải dữ liệu seller. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.product_name || product.title || "",
      description: product.description || "",
      category_ids: [],
      variants: [{ name: "Mặc định", price: product.min_price || 0, stock: product.total_stock || 0 }],
      imagesText: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleVariantChange = (index, field, value) => {
    const list = [...form.variants];
    list[index] = { ...list[index], [field]: value };
    setForm({ ...form, variants: list });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { name: "", price: 0, stock: 0 }],
    });
  };

  const removeVariant = (index) => {
    if (form.variants.length === 1) return;
    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== index),
    });
  };

  const handleToggleStatus = async (product) => {
    try {
      const nextActive = !(product.status === "Active");
      await axiosInstance.put(`/seller/products/${product.product_id}`, {
        product_name: product.product_name || product.title,
        description: product.description,
        is_active: nextActive,
      });
      setMessage({
        type: "success",
        text: nextActive ? "Đã hiển thị sản phẩm." : "Đã ẩn sản phẩm.",
      });
      await loadDashboard();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Lỗi cập nhật trạng thái sản phẩm:", err);
      setMessage({
        type: "error",
        text: "Không thể cập nhật trạng thái sản phẩm.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProduct) {
        await axiosInstance.put(`/seller/products/${editingProduct.product_id}`, {
          product_name: form.title,
          description: form.description,
        });
        setMessage({
          type: "success",
          text: "Cập nhật sản phẩm thành công.",
        });
      } else {
        const variantPayload = form.variants.map((v, index) => ({
          variant_code: `VAR${String(index + 1).padStart(3, "0")}`,
          list_price: Number(v.price) || 0,
          stock_qty: Number(v.stock) || 0,
        }));

        const images =
          form.imagesText
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean) || [];

        await axiosInstance.post("/seller/products", {
          title: form.title,
          description: form.description,
          category_ids: form.category_ids,
          variants: variantPayload,
          images,
        });
        setMessage({
          type: "success",
          text: "Tạo sản phẩm mới thành công.",
        });
      }

      closeModal();
      await loadDashboard();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Lỗi lưu sản phẩm:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Không thể lưu sản phẩm.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner message="Đang tải dữ liệu seller..." />;
  }

  const safeStats = stats || { products: 0, orders: 0, revenue: 0 };

  return (
    <div className="container py-4">
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

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <h5>Sản phẩm</h5>
              <h2>{safeStats.products}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <h5>Đơn hàng</h5>
              <h2>{safeStats.orders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body text-center">
              <h5>Doanh thu</h5>
              <h2>{formatCurrency(safeStats.revenue)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <h5>Đánh giá</h5>
              <h2>4.5</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Product management */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-shop me-2" />
          Quản lý sản phẩm
        </h4>
        <Button label="+ Thêm sản phẩm mới" onClick={openCreateModal} />
      </div>

      <div className="table-responsive bg-white rounded shadow-sm mb-4">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Biến thể</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.product_id}>
                  <td>
                    <img
                      src={
                        p.image_url || "https://via.placeholder.com/80?text=No+Image"
                      }
                      alt={p.product_name || p.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                      className="rounded"
                    />
                  </td>
                  <td>
                    <strong>{p.product_name || p.title}</strong>
                    {p.description && (
                      <>
                        <br />
                        <small className="text-muted">
                          {p.description.substring(0, 60)}
                          {p.description.length > 60 ? "..." : ""}
                        </small>
                      </>
                    )}
                  </td>
                  <td>
                    {p.min_price === p.max_price
                      ? formatCurrency(p.min_price)
                      : `${formatCurrency(p.min_price)} - ${formatCurrency(
                          p.max_price
                        )}`}
                  </td>
                  <td>{p.total_stock || 0}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {p.variant_count || 0} biến thể
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "Active"
                          ? "bg-success"
                          : p.status === "Hidden"
                          ? "bg-secondary"
                          : "bg-danger"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.status === "Active" ? "Ẩn" : "Hiển thị"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => openEditModal(p)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    {/* Có thể thêm nút xóa cứng nếu cần trong tương lai */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order history */}
      <div className="mt-4">
        <h4 className="fw-bold mb-3">
          <i className="bi bi-receipt-cutoff me-2" />
          Lịch sử đơn hàng của shop
        </h4>
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Số sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Chưa có đơn hàng nào cho shop này.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id}>
                    <td>{`ORD${String(o.order_id).padStart(6, "0")}`}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.customer_email}</td>
                    <td>{o.item_count}</td>
                    <td>{formatCurrency(o.total_amount)}</td>
                    <td>{mapOrderStatus(o.order_status)}</td>
                    <td>
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString("vi-VN")
                        : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal create / edit product */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        hideFooter
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên sản phẩm *</label>
            <input
              type="text"
              className="form-control"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Danh mục</label>
            <select
              multiple
              className="form-control"
              value={form.category_ids}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => Number(opt.value)
                );
                setForm({ ...form, category_ids: selected });
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <small className="text-muted">
              Giữ Ctrl để chọn nhiều danh mục
            </small>
          </div>

          {!editingProduct && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">
                  Biến thể sản phẩm
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={addVariant}
                >
                  + Thêm biến thể
                </button>
              </div>

              {form.variants.map((v, index) => (
                <div
                  key={index}
                  className="border rounded p-2 p-md-3 mb-2 bg-light"
                >
                  <div className="row g-2">
                    <div className="col-12 col-md-4">
                      <label className="form-label small mb-1">
                        Tên biến thể
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ví dụ: Màu đen, Size M"
                        value={v.name}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-1">
                        Giá (VNĐ) *
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={v.price}
                        min="0"
                        required
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-1">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={v.stock}
                        min="0"
                        required
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-12 col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm w-100"
                        disabled={form.variants.length === 1}
                        onClick={() => removeVariant(index)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!editingProduct && (
            <div className="mb-3">
              <label className="form-label">
                URL hình ảnh (mỗi URL một dòng)
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                value={form.imagesText}
                onChange={(e) =>
                  setForm({ ...form, imagesText: e.target.value })
                }
              />
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row gap-2 mt-3 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-primary flex-fill"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : editingProduct ? "Cập nhật" : "Tạo sản phẩm"}
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-fill flex-sm-grow-0"
              onClick={closeModal}
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
