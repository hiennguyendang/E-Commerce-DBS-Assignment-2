import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { clearAuthData } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function SellerRegisterForm({ existingUser }) {
  const [form, setForm] = useState({
    shopName: "",
    businessEmail: "",
    businessPhone: "",
    taxId: "",
    businessLicenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.shopName) {
      setError("Vui lòng nhập tên shop!");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/auth/upgrade-to-seller", {
        shopName: form.shopName,
        businessEmail: form.businessEmail,
        businessPhone: form.businessPhone,
        taxId: form.taxId,
        businessLicenseNumber: form.businessLicenseNumber,
      });

      alert(
        "Đăng ký shop thành công! Đang chuyển đến trang quản lý..."
      );

      // Đăng xuất và chuyển đến trang đăng nhập
      try {
        clearAuthData();
      } catch (e) {
        console.error("Failed to clear auth data after upgrade:", e);
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.removeItem("token");
            window.sessionStorage.removeItem("user");
          } catch (_) {}
        }
      }

      // Redirect với message
      window.location.href = "/login?message=upgrade_success";
    } catch (err) {
      console.error("Seller registration error:", err);
      setError(
        err.response?.data?.error || "Đăng ký shop thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!existingUser) {
    return (
      <div className="container py-5">
        <div className="login-card mx-auto" style={{ maxWidth: "500px" }}>
          <h3 className="login-heading">Kênh Người Bán</h3>
          <div className="alert alert-warning">
            <strong>Bạn chưa đăng nhập!</strong>
            <p className="mb-2">
              Vui lòng đăng nhập với tài khoản Buyer để nâng cấp lên
              Seller.
            </p>
            <a href="/login" className="btn btn-primary btn-sm w-100">
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <form
        onSubmit={handleSubmit}
        className="login-card mx-auto"
        style={{ maxWidth: "600px" }}
      >
        <h3 className="login-heading">Đăng ký Kênh Người Bán</h3>
        <p className="login-sub">
          Xin chào <strong>{existingUser.name}</strong>! Bắt đầu kinh doanh
          trên Shopzada ngay hôm nay!
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="alert alert-info py-2 small">
          <strong>Tài khoản hiện tại:</strong> {existingUser.userName} (ID:{" "}
          {existingUser.id})
        </div>

        <div className="mb-3 text-start">
          <label className="form-label">Tên Shop *</label>
          <input
            type="text"
            className="form-control"
            name="shopName"
            placeholder="VD: TechStore Official"
            value={form.shopName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3 text-start">
            <label className="form-label">Email kinh doanh</label>
            <input
              type="email"
              className="form-control"
              name="businessEmail"
              placeholder="Email liên hệ"
              value={form.businessEmail}
              onChange={handleChange}
              disabled={loading}
            />
            <small className="text-muted">
              Mặc định dùng email tài khoản
            </small>
          </div>

          <div className="col-md-6 mb-3 text-start">
            <label className="form-label">SĐT kinh doanh</label>
            <input
              type="tel"
              className="form-control"
              name="businessPhone"
              placeholder="Số điện thoại"
              value={form.businessPhone}
              onChange={handleChange}
              disabled={loading}
            />
            <small className="text-muted">
              Mặc định dùng SĐT tài khoản
            </small>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3 text-start">
            <label className="form-label">Mã số thuế</label>
            <input
              type="text"
              className="form-control"
              name="taxId"
              placeholder="VD: 0123456789"
              value={form.taxId}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="col-md-6 mb-3 text-start">
            <label className="form-label">Số GPKD</label>
            <input
              type="text"
              className="form-control"
              name="businessLicenseNumber"
              placeholder="Giấy phép kinh doanh"
              value={form.businessLicenseNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-warning w-100 mt-3 fw-bold"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng ký làm Seller ngay"}
        </button>

        <div className="mt-3 text-center">
          <small className="text-muted">
            <a href="/app">Quay lại trang chủ</a>
          </small>
        </div>
      </form>
    </div>
  );
}

