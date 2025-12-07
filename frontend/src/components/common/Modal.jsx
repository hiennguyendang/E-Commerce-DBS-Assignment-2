import React from "react";

export default function Modal({ title, children, onClose, onConfirm, show, hideFooter = false }) {
  if (!show) return null;

  return (
    <div className="bk-modal__backdrop" onClick={onClose}>
      <div
        className="bk-modal__card"
        onClick={(e) => e.stopPropagation()} // ngăn tắt khi click bên trong
        style={{ 
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '1rem',
          maxWidth: '800px',
          width: '100%'
        }}
      >
        <div className="bk-modal__head d-flex justify-content-between align-items-center">
          {title}
          <button
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="bk-modal__body">{children}</div>
        {!hideFooter && onConfirm && (
          <div className="bk-modal__foot">
            <button className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-bk" onClick={onConfirm}>
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
