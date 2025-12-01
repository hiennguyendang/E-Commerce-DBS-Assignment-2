import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await axiosInstance.get("/cart");
        setItems(res.data);
      } catch (err) {
        console.error("Không thể tải giỏ hàng:", err);
      }
    }
    fetchCart();
  }, []);

  const handleQuantityChange = (id, newQty) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, quantity: newQty } : it
    );
    setItems(updated);
  };

  const handleRemove = (id) => {
    setItems(items.filter((it) => it.id !== id));
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-cart-check me-2"></i> Giỏ hàng của bạn
      </h4>

      <div className="row g-4">
        <div className="col-lg-8">
          {items.length > 0 ? (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))
          ) : (
            <div className="alert alert-info">Giỏ hàng của bạn đang trống.</div>
          )}
        </div>

        <div className="col-lg-4">
          <CartSummary items={items} />
        </div>
      </div>
    </div>
  );
}
