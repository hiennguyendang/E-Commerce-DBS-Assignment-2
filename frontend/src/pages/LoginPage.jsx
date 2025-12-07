import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage({ onLogin }) {
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("message") === "upgrade_success") {
      setSuccessMessage("🎉 Đăng ký Seller thành công! Vui lòng đăng nhập lại để truy cập kênh người bán.");
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [searchParams]);

  return (
    <div className="login-page d-flex flex-column min-vh-100">
      {/* Header */}
      <header className="login-header py-3">
        <div className="container d-flex align-items-center justify-content-center gap-2">
          <img
            src="/shopzada-logo.svg"
            alt="Shopzada Logo"
            style={{
              height: "50px",
              width: "auto",
              background: "white",
              borderRadius: "8px",
              padding: "4px 12px",
            }}
          />
        </div>
      </header>

      {/* Login form */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="login-container">
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          <LoginForm onLogin={onLogin} />

          <div className="text-center mt-3">
            <span className="text-muted">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="text-primary fw-bold text-decoration-none"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer text-center py-3 text-white">
        © 2025 Shopzada - Mua sắm trực tuyến
      </footer>
    </div>
  );
}

