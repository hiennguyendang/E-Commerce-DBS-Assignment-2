import React from "react";

export default function Topbar() {
  return (
    <div className="bg-light border-bottom small py-1">
      <div className="container d-flex justify-content-between">
        <div>
          <span className="me-3">Kênh người bán</span>
          <span>Trợ giúp</span>
        </div>
        <div>
          <span className="me-2">Ngôn ngữ:</span>
          <select className="form-select form-select-sm d-inline-block w-auto">
            <option>Tiếng Việt</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
