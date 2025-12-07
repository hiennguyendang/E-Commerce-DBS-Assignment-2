import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    userName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
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

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userName: form.userName,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: "Buyer"
      };

      await axiosInstance.post("/auth/register", payload);
      
      alert("Đăng ký tài khoản thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.error || "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: '500px' }}>
      <h3 className="login-heading">Đăng ký</h3>
      <p className="login-sub">Tạo tài khoản để bắt đầu mua sắm</p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Thông tin cơ bản */}
      <div className="row">
        <div className="col-md-6 mb-3 text-start">
          <label className="form-label">Tên đăng nhập *</label>
          <input
            type="text"
            className="form-control"
            name="userName"
            placeholder="Ví dụ: hoang123"
            value={form.userName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="col-md-6 mb-3 text-start">
          <label className="form-label">Họ và tên *</label>
          <input
            type="text"
            className="form-control"
            name="displayName"
            placeholder="Nguyễn Văn A"
            value={form.displayName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3 text-start">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className="form-control"
          name="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3 text-start">
        <label className="form-label">Số điện thoại</label>
        <input
          type="tel"
          className="form-control"
          name="phoneNumber"
          placeholder="0123456789"
          value={form.phoneNumber}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3 text-start">
          <label className="form-label">Mật khẩu *</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="col-md-6 mb-3 text-start">
          <label className="form-label">Xác nhận mật khẩu *</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-bk w-100 mt-2" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>

      <div className="mt-3 text-center">
        <small className="text-muted">
          Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
        </small>
      </div>
    </form>
  );
}
