import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../utils/api";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true);
        const res = await cartAPI.getCart();
        setItems(res.data || []);
        setSelectedIds([]);
      } catch (err) {
        console.error("Không thể tải giỏ hàng:", err);
        setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
      setLoading(false);
    }
    fetchCart();
  }, []);

  const handleQuantityChange = async (id, newQty) => {
    try {
      await cartAPI.updateItem(id, newQty);
      const updated = items.map((it) =>
        it.id === id ? { ...it, quantity: newQty } : it
      );
      setItems(updated);
    } catch (err) {
      console.error("Cập nhật số lượng thất bại:", err);
      setError("Cập nhật số lượng thất bại. Vui lòng thử lại.");
    }
  };

  const handleRemove = async (id) => {
    try {
      await cartAPI.removeItem(id);
      setItems(items.filter((it) => it.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("Xóa sản phẩm thất bại:", err);
      setError("Không thể xóa sản phẩm khỏi giỏ hàng.");
    }
  };

  const handleToggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSeller = (sellerId, checked) => {
    const sellerItemIds = items
      .filter((it) => it.seller_id === sellerId)
      .map((it) => it.id);

    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (checked) {
        sellerItemIds.forEach((id) => set.add(id));
      } else {
        sellerItemIds.forEach((id) => set.delete(id));
      }
      return Array.from(set);
    });
  };

  const groupedBySeller = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = item.seller_id || "UNKNOWN";
      if (!map.has(key)) {
        map.set(key, {
          sellerId: key,
          sellerName: item.seller_name || "Shop",
          items: [],
        });
      }
      map.get(key).items.push(item);
    }
    return Array.from(map.values());
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((it) => selectedIds.includes(it.id)),
    [items, selectedIds]
  );

  const handleProceedToCheckout = () => {
    setError("");
    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    const sellerSet = new Set(selectedItems.map((it) => it.seller_id));
    if (sellerSet.size > 1) {
      setError(
        "Mỗi đơn hàng chỉ hỗ trợ sản phẩm từ một shop. Vui lòng chọn các sản phẩm cùng shop."
      );
      return;
    }

    navigate("/app/checkout", {
      state: {
        selectedItems: selectedItems,
        selectedItemIds: selectedItems.map((it) => it.id),
      },
    });
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-cart-check me-2"></i> Giỏ hàng của bạn
      </h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          {loading ? (
            <div className="alert alert-info">Đang tải giỏ hàng...</div>
          ) : items.length > 0 ? (
            groupedBySeller.map((group) => {
              const allSelected = group.items.every((it) =>
                selectedIds.includes(it.id)
              );
              return (
                <div key={group.sellerId} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-bold">
                      Shop: {group.sellerName} ({group.sellerId})
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) =>
                          handleToggleSeller(group.sellerId, e.target.checked)
                        }
                      />
                      <label className="form-check-label small">
                        Chọn tất cả sản phẩm của shop
                      </label>
                    </div>
                  </div>
                  {group.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.includes(item.id)}
                      onToggleSelected={() => handleToggleItem(item.id)}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <div className="alert alert-info">
              Giỏ hàng của bạn đang trống.
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <CartSummary
            items={selectedItems}
            onCheckout={handleProceedToCheckout}
          />
        </div>
      </div>
    </div>
  );
}

