import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import { ordersAPI } from "../utils/api";

// Danh sach tinh/thanh (khong dau de tranh loi UTF-8)
const VN_CITIES = [
  "Ho Chi Minh",
  "Ha Noi",
  "Da Nang",
  "Hai Phong",
  "Can Tho",
  "An Giang",
  "Ba Ria - Vung Tau",
  "Bac Giang",
  "Bac Kan",
  "Bac Lieu",
  "Bac Ninh",
  "Ben Tre",
  "Binh Dinh",
  "Binh Duong",
  "Binh Phuoc",
  "Binh Thuan",
  "Ca Mau",
  "Cao Bang",
  "Dak Lak",
  "Dak Nong",
  "Dien Bien",
  "Dong Nai",
  "Dong Thap",
  "Gia Lai",
  "Ha Giang",
  "Ha Nam",
  "Ha Tinh",
  "Hai Duong",
  "Hau Giang",
  "Hoa Binh",
  "Hung Yen",
  "Khanh Hoa",
  "Kien Giang",
  "Kon Tum",
  "Lai Chau",
  "Lam Dong",
  "Lang Son",
  "Lao Cai",
  "Long An",
  "Nam Dinh",
  "Nghe An",
  "Ninh Binh",
  "Ninh Thuan",
  "Phu Tho",
  "Phu Yen",
  "Quang Binh",
  "Quang Nam",
  "Quang Ngai",
  "Quang Ninh",
  "Quang Tri",
  "Soc Trang",
  "Son La",
  "Tay Ninh",
  "Thai Binh",
  "Thai Nguyen",
  "Thanh Hoa",
  "Thua Thien Hue",
  "Tien Giang",
  "Tra Vinh",
  "Tuyen Quang",
  "Vinh Long",
  "Vinh Phuc",
  "Yen Bai",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    recipient_name: "",
    address: "",
    phone: "",
    city: VN_CITIES[0],
    postal_code: "",
    country: "VN",
  });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (
      state &&
      Array.isArray(state.selectedItems) &&
      state.selectedItems.length > 0
    ) {
      setCartItems(state.selectedItems);
      setLoading(false);
    } else {
      setLoading(false);
      setMessage({
        text: "Vui long quay lai gio hang va chon san pham can thanh toan.",
        type: "error",
      });
    }
  }, [location.state]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.recipient_name || !form.phone || !form.address || !form.city) {
      setError("Vui long dien day du thong tin giao hang.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Khong co san pham nao de thanh toan.");
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError("");
      setShowModal(false);

      const state = location.state || {};
      const payload = {
        shipping_address: {
          recipient_name: form.recipient_name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal_code: form.postal_code || "",
          country: form.country || "VN",
        },
        selected_items: Array.isArray(state.selectedItemIds)
          ? state.selectedItemIds
          : [],
      };

      const res = await ordersAPI.createOrder(payload);
      setMessage({
        text: "Dat hang thanh cong: " + res.data.order.code,
        type: "success",
      });

      setTimeout(() => {
        navigate("/app/orders");
      }, 2000);
    } catch (e) {
      console.error("Order failed:", e);
      setError(e?.response?.data?.error || "Khong the tao don hang.");
      setSubmitting(false);
    }
  };

  const calcSub = () =>
    cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const calcShip = () => (calcSub() > 500000 ? 0 : 50000);
  const calcTotal = () => calcSub() + calcShip();

  if (loading) return <Spinner message="Dang tai gio hang..." />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">Thanh toan</h4>

      {message && (
        <div
          className={
            "alert alert-" + (message.type === "success" ? "success" : "danger")
          }
        >
          {message.text}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h5>Khong co san pham nao de thanh toan.</h5>
          <Button
            label="Quay lai gio hang"
            onClick={() => navigate("/app/cart")}
          />
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-3">Thong tin giao hang</h5>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="recipient_name"
                    placeholder="Ho ten nguoi nhan"
                    value={form.recipient_name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="tel"
                    className="form-control mb-2"
                    name="phone"
                    placeholder="So dien thoai"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    className="form-control mb-2"
                    name="address"
                    placeholder="Dia chi chi tiet"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                  <select
                    className="form-select mb-2"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  >
                    {VN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="postal_code"
                    placeholder="Ma buu chinh (khong bat buoc)"
                    value={form.postal_code}
                    onChange={handleChange}
                  />
                  <Button label="Dat hang" type="submit" disabled={submitting} />
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3">Tom tat don hang</h5>
                <p>
                  Tam tinh: {calcSub().toLocaleString("vi-VN")}
                  {" VND"}
                </p>
                <p>
                  Phi van chuyen:{" "}
                  {calcShip() === 0
                    ? "Mien phi"
                    : calcShip().toLocaleString("vi-VN") + " VND"}
                </p>
                <h4>
                  Tong cong: {calcTotal().toLocaleString("vi-VN")}
                  {" VND"}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Xac nhan dat hang"
      >
        <p>Nguoi nhan: {form.recipient_name}</p>
        <p>So dien thoai: {form.phone}</p>
        <p>
          Dia chi: {form.address}, {form.city}
        </p>
        <h5>
          Tong cong: {calcTotal().toLocaleString("vi-VN")}
          {" VND"}
        </h5>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={submitting}
        >
          Xac nhan
        </button>
      </Modal>
    </div>
  );
}

