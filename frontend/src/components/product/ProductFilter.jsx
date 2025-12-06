import React from "react";

export default function ProductFilter({ categories, onFilter }) {
  return (
    <div className="filter-card mb-4">
      <h6 className="fw-bold mb-3">Bộ lọc sản phẩm</h6>
      <div className="mb-3">
        <label className="form-label">Danh mục</label>
        <select
          className="form-select"
          onChange={(e) => onFilter("category", e.target.value)}
        >
          <option value="">Tất cả</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Giá tối đa</label>
        <input
          type="number"
          className="form-control"
          placeholder="Nhập giá (VNĐ)"
          onChange={(e) => onFilter("maxPrice", e.target.value)}
        />
      </div>
    </div>
  );
}

