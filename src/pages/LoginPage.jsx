// src/pages/LoginPage.jsx
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
            src={require("../assets/imgs/logoBK.png")}
            alt="Shopee Logo"
            style={{ height: "36px", width: "auto" }}
          />
          <h3 className="m-0 text-white fw-bold">Shopee Clone</h3>
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
        © 2025 Shopee Clone - Nhóm 09 | Đại học Bách Khoa TP.HCM
      </footer>
    </div>
  );
}
