import React from "react";

export default function Button({
  label,
  type = "button",
  variant = "primary", // "primary" | "outline" | "danger"
  size = "md", // "sm" | "md" | "lg"
  loading = false,
  onClick,
  className = "",
}) {
  const getClass = () => {
    const base = "btn fw-bold rounded-pill ";
    const color =
      variant === "outline"
        ? "btn-outline-primary"
        : variant === "danger"
        ? "btn-danger"
        : "btn-bk"; // mapped to primary color in index.css

    const sizeClass =
      size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

    return `${base} ${color} ${sizeClass} ${className}`;
  };

  return (
    <button
      type={type}
      className={getClass()}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Dang xu ly...
        </>
      ) : (
        label
      )}
    </button>
  );
}

