import React from "react";
import { Facebook, Instagram, Youtube, Twitter } from "react-bootstrap-icons";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row">
          {/* Column 1: About */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase fw-bold mb-3 text-warning">Shopzada</h5>
            <p className="small">
              Shopzada là nền tảng thương mại điện tử hàng đầu, mang đến trải nghiệm mua sắm
              trực tuyến dễ dàng, an toàn và nhanh chóng.
            </p>
            <p className="small">
              Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM<br />
              Email: support@shopzada.com<br />
              Hotline: 1900 1234
            </p>
          </div>

          {/* Column 2: Customer Service */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Chăm sóc khách hàng</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Trung tâm trợ giúp</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Hướng dẫn mua hàng</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Thanh toán</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Vận chuyển</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Trả hàng & Hoàn tiền</a></li>
            </ul>
          </div>

          {/* Column 3: About Us */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Về Shopzada</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Giới thiệu</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Tuyển dụng</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Điều khoản</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Chính sách bảo mật</a></li>
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Kênh người bán</a></li>
            </ul>
          </div>

          {/* Column 4: Social & Newsletter */}
          <div className="col-md-4 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Theo dõi chúng tôi</h6>
            <div className="d-flex gap-3 mb-4">
              <a href="#" className="text-white fs-5"><Facebook /></a>
              <a href="#" className="text-white fs-5"><Instagram /></a>
              <a href="#" className="text-white fs-5"><Youtube /></a>
              <a href="#" className="text-white fs-5"><Twitter /></a>
            </div>
            <h6 className="text-uppercase fw-bold mb-3">Đăng ký nhận tin</h6>
            <div className="input-group">
              <input type="text" className="form-control form-control-sm" placeholder="Email của bạn" />
              <button className="btn btn-warning btn-sm" type="button">Đăng ký</button>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 small text-white-50">© 2025 Shopzada. Tất cả các quyền được bảo lưu.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0 small text-white-50">
              Quốc gia & Khu vực: Việt Nam | Singapore | Thái Lan | Malaysia | Philippines | Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
