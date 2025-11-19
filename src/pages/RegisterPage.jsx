// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate cơ bản
    if (!form.name || !form.username || !form.password || !form.confirm) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Giả lập lưu user mới vào localStorage
    const newUser = {
      name: form.name,
      username: form.username,
      password: form.password,
      role: "Buyer",
    };

    const stored = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    stored.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(stored));

    setSuccess("Đăng ký thành công! Chuyển hướng sang trang đăng nhập...");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="login-page d-flex flex-column min-vh-100">
      {/* ===== Header ===== */}
      <header className="login-header py-3">
        <div className="container d-flex align-items-center justify-content-center gap-2">
          <img
            src={require("../assets/imgs/logoBK.png")}
            alt="Shopee Logo"
            style={{ height: "36px", width: "auto" }}
          />
          <h3 className="m-0 text-white fw-bold">Shopee Clone</h3>
        </div>
      </header>

      {/* ===== Register Form ===== */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-card">
            <h3 className="login-heading text-center">Register</h3>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}

            <div className="mb-3 text-start">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Nhập họ tên"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Tên đăng nhập</label>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Ví dụ: hoang123"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control"
                name="confirm"
                placeholder="Nhập lại mật khẩu"
                value={form.confirm}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-bk w-100 mt-2">
              Đăng ký
            </button>
          </form>

          {/* Link quay lại đăng nhập */}
          <div className="text-center mt-3">
            <span className="text-muted">Đã có tài khoản? </span>
            <Link to="/" className="text-primary fw-bold text-decoration-none">
              Login
            </Link>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="login-footer text-center py-3 text-white">
        © 2025 Shopee Clone - Nhóm 09 | Đại học Bách Khoa TP.HCM
      </footer>
    </div>
  );
}
