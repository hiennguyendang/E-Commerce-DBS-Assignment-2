import React from "react";
import { Link } from "react-router-dom";
import SellerRegisterForm from "../components/auth/SellerRegisterForm";

export default function SellerRegisterPage({ existingUser }) {
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

      {/* ===== Seller Register Form ===== */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="login-container">
          <SellerRegisterForm existingUser={existingUser} />

          {/* Link quay lại */}
          <div className="text-center mt-3">
            <span className="text-muted">Quay lại </span>
            <Link to="/" className="text-primary fw-bold text-decoration-none">
              Trang chủ
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
