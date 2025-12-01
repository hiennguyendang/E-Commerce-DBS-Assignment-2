import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import axiosInstance from "../../utils/axiosConfig";

export default function Header({ user, onLogout  }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await axiosInstance.get('/cart/items');
      const totalItems = (res.data.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };
  return (
    <header className="bk-topbar shadow-sm sticky-top">
      <div className="inner">
        <div className="topbar-rail">
          {/* Cột trái: logo + tiêu đề */}
          <div className="left-rail">
            <Link to="/app" className="d-flex align-items-center text-white text-decoration-none">
              <img src="/shopzada-logo.svg" alt="Shopzada" style={{ height: '40px', background: 'white', borderRadius: '8px', padding: '2px 8px' }} />
            </Link>
          </div>

          {/* Cột giữa: thanh tìm kiếm */}
          <div className="flex-grow-1 mx-4 d-none d-md-block">
            <SearchBar
              placeholder="Tìm sản phẩm, danh mục hoặc shop..."
              onSearch={(kw) => console.log("Từ khóa:", kw)}
            />
          </div>

          {/* Cột phải: giỏ hàng + tài khoản */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/app/cart" className="text-white fs-5 text-decoration-none position-relative">
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
                <div className="dropdown">
                    <button
                    className="btn btn-light dropdown-toggle"
                    data-bs-toggle="dropdown"
                    >
                    {user.name}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="/app/profile"><i className="bi bi-person me-2"></i>Tài khoản</a></li>
                    <li><a className="dropdown-item" href="/app/orders"><i className="bi bi-bag me-2"></i>Đơn hàng</a></li>
                    {user.role === "Seller" && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item text-primary" href="/app/seller"><i className="bi bi-shop me-2"></i>Quản lý Shop</a></li>
                      </>
                    )}
                    {user.role === "Admin" && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item text-warning" href="/app/admin"><i className="bi bi-shield-check me-2"></i>Admin Dashboard</a></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item text-danger" onClick={onLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                        </button>
                    </li>
                    </ul>
                </div>
                ) : (
                <Link to="/" className="btn btn-light btn-sm fw-bold">
                    Đăng nhập
                </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
