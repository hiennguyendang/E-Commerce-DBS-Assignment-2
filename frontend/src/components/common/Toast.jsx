import React, { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast-notification toast-${type} animate-slide-in`}>
      <div className="toast-icon">
        {type === "success" && <i className="bi bi-check-circle-fill"></i>}
        {type === "error" && <i className="bi bi-x-circle-fill"></i>}
        {type === "info" && <i className="bi bi-info-circle-fill"></i>}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
}
