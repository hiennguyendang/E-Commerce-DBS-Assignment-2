import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import { setAuthData } from "../../utils/api";

export default function LoginForm({ onLogin }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
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
        emailOrUsername,
        password,
      });

      const { token, user } = response.data;

      setAuthData(token, user);
      onLogin(user);
      navigate("/app", { replace: true });
    } catch (err) {
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
        <label className="form-label">Tên đăng nhập hoặc Email</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tên đăng nhập hoặc email"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
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

      <button
        type="submit"
        className="btn btn-bk w-100 mt-2"
        disabled={loading}
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="mt-3 text-center">
        <small className="text-muted d-block mb-1">Tài khoản test:</small>
        <small className="text-muted d-block">
          <b>Seller:</b> seller1@demo.com / <b>123</b>
        </small>
        <small className="text-muted d-block">
          <b>Admin:</b> admin1@demo.com / <b>123</b>
        </small>
        <small className="text-muted d-block">
          <b>sManager (DBA):</b> smanager@demo.com / <b>123</b>
        </small>
        <small className="text-muted d-block">
          <b>Buyer 1:</b> buyer1@demo.com / <b>123</b>
        </small>
        <small className="text-muted d-block">
          <b>Buyer 2:</b> buyer2@demo.com / <b>123</b>
        </small>
        <small className="text-muted d-block mb-1">
          <b>Buyer 3:</b> buyer3@demo.com / <b>123</b>
        </small>
        <small className="text-muted">
          Hoặc đăng ký tài khoản Buyer mới.
        </small>
      </div>
    </form>
  );
}
