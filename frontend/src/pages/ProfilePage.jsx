import React, { useState } from "react";
import Button from "../components/common/Button";

export default function ProfilePage({ user }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    alert("Thông tin đã được cập nhật!");
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-person-circle me-2"></i> Thông tin tài khoản
      </h4>

      <form onSubmit={handleSave} className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Họ và tên</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <Button label="Lưu thay đổi" type="submit" />
      </form>
    </div>
  );
}
