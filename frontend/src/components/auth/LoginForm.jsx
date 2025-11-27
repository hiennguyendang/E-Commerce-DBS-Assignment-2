// src/components/auth/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onLogin(user);
      navigate("/app", { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-card">
      <h3 className="login-heading">Đăng nhập</h3>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="mb-3 text-start">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Nhập email (vd: seller1@demo.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3 text-start">
        <label className="form-label">Mật khẩu</label>
        <input
          type="password"
          className="form-control"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-bk w-100 mt-2" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="mt-3 text-center">
        <small className="text-muted d-block mb-1">
          Tài khoản test:
        </small>
        <small className="text-muted d-block">
          <b>Seller:</b> seller1@demo.com / <b>password123</b>
        </small>
        <small className="text-muted d-block">
          <b>Admin:</b> admin1@demo.com / <b>password123</b>
        </small>
        <small className="text-muted d-block">
          <b>Buyer 1:</b> buyer1@demo.com / <b>password123</b>
        </small>
        <small className="text-muted d-block">
          <b>Buyer 2:</b> buyer2@demo.com / <b>password123</b>
        </small>
        <small className="text-muted d-block mb-1">
          <b>Buyer 3:</b> buyer3@demo.com / <b>password123</b>
        </small>
        <small className="text-muted">
          Hoặc đăng ký tài khoản Buyer mới.
        </small>
      </div>
    </form>
  );
}

