import React from "react";

export default function CartSummary({ items, onCheckout }) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-3 bg-white shadow-sm rounded-3">
      <h6 className="fw-bold mb-3">Tạm tính đơn hàng</h6>
      <div className="d-flex justify-content-between mb-2">
        <span>Tổng tiền hàng</span>
        <span>{total.toLocaleString("vi-VN")} ₫</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span>Phí vận chuyển</span>
        <span>Miễn phí</span>
      </div>
      <hr />
      <div className="d-flex justify-content-between fw-bold mb-3">
        <span>Tổng thanh toán</span>
        <span className="text-danger fs-5">
          {total.toLocaleString("vi-VN")} ₫
        </span>
      </div>
      <button
        className="btn btn-bk w-100 py-2"
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        Tiến hành thanh toán
      </button>
    </div>
  );
}

