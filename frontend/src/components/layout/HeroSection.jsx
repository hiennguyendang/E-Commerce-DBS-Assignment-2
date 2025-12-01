import React from 'react';

export default function HeroSection() {
  return (
    <div className="p-5 mb-4 bg-light rounded-3" style={{ 
      background: 'linear-gradient(135deg, #ee4d2d 0%, #ff7337 100%)',
      color: 'white'
    }}>
      <div className="container-fluid py-5">
        <h1 className="display-5 fw-bold">Siêu Sale Hàng Hiệu</h1>
        <p className="col-md-8 fs-4">Săn deal hot mỗi ngày cùng Shopzada. Miễn phí vận chuyển cho đơn hàng từ 0đ.</p>
        <button className="btn btn-light btn-lg fw-bold text-danger" type="button">Mua Ngay</button>
      </div>
    </div>
  );
}
