import React from "react";

export default function Spinner({ size = "md", message = "Đang tải..." }) {
  const sizeClass =
    size === "sm" ? "spinner-border-sm" : size === "lg" ? "spinner-border-lg" : "";

  return (
    <div className="text-center py-5 text-secondary">
      <div className={`spinner-border ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
}
