import React, { useState } from "react";

export default function SearchBar({ placeholder, onSearch }) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex align-items-center bg-white rounded-pill shadow-sm px-3 py-1"
      style={{ maxWidth: "500px" }}
    >
      <input
        type="text"
        className="form-control border-0"
        placeholder={placeholder || "Tìm kiếm sản phẩm..."}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ fontSize: "0.95rem" }}
      />
      <button
        type="submit"
        className="btn text-white fw-bold"
        style={{ background: "#2563eb", borderRadius: "50px" }}
      >
        <i className="bi bi-search"></i>
      </button>
    </form>
  );
}
