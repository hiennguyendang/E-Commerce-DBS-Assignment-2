import React from "react";

export default function HeroSection() {
  return (
    <div
      className="p-5 mb-4 rounded-3"
      style={{
        background: "#1f2937",
        color: "#e5e7eb",
      }}
    >
      <div className="container-fluid py-4">
        <h1 className="display-6 fw-bold mb-2">Siêu Sale Hàng Hiệu</h1>
        <p className="col-md-8 fs-5 mb-3">
          Săn deal hot mỗi ngày cùng Shopzada. Miễn phí vận chuyển cho đơn
          hàng từ 0đ.
        </p>
        <button className="btn btn-light btn-lg fw-bold text-danger" type="button">
          Mua ngay
        </button>
      </div>
    </div>
  );
}
