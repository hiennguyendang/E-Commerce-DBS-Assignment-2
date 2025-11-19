import React, { useState } from "react";
import { Link } from "react-router-dom";
import shopeeWhite from "../../assets/imgs/logoBK.png";

export default function Header({ user, onLogout, onSearch }) {
  const [keyword, setKeyword] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <header className="bk-topbar shadow-sm sticky-top">
      <div className="inner">
        <div className="topbar-rail">

          {/* Logo */}
          <div className="left-rail">
            <Link
              to="/app"
              className="d-flex align-items-center text-white text-decoration-none"
            >
              <img src={shopeeWhite} alt="logo" className="bk-logo me-2" />
              <span className="bk-title">Shopee Clone</span>
            </Link>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex-grow-1 mx-4 d-none d-md-block">
            <form
              onSubmit={submitSearch}
              className="d-flex align-items-center bg-white rounded-pill px-3"
              style={{ height: "44px" }}
            >
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Tìm sản phẩm, danh mục hoặc shop..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  onSearch(e.target.value); // realtime
                }}
              />
              <button
                type="submit"
                className="btn btn-link text-danger fs-5"
              >
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>

          {/* Giỏ hàng + tài khoản */}
          <div className="d-flex align-items-center gap-3">

            <Link
              to="/app/cart"
              className="text-white fs-5 text-decoration-none"
            >
              <i className="bi bi-cart3"></i>
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
                  <li><Link className="dropdown-item" to="/app/profile">Tài khoản</Link></li>
                  <li><Link className="dropdown-item" to="/app/orders">Đơn hàng</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={onLogout}>
                      Đăng xuất
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
