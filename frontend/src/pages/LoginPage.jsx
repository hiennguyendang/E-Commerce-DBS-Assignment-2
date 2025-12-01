import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage({ onLogin }) {
  return (
    <div className="login-page d-flex flex-column min-vh-100">
      {/* ===== Header ===== */}
      <header className="login-header py-3">
        <div className="container d-flex align-items-center justify-content-center gap-2">
          <img
            src="/shopzada-logo.svg"
            alt="Shopzada Logo"
            style={{ height: "50px", width: "auto", background: 'white', borderRadius: '8px', padding: '4px 12px' }}
          />
        </div>
      </header>

      {/* ===== Login Form Section ===== */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="login-container">
          <LoginForm onLogin={onLogin} />

          {/* Nút đăng ký */}
          <div className="text-center mt-3">
            <span className="text-muted">Chưa có tài khoản? </span>
            <Link to="/register" className="text-primary fw-bold text-decoration-none">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="login-footer text-center py-3 text-white">
        © 2025 Shopzada - Mua sắm trực tuyến
      </footer>
    </div>
  );
}
