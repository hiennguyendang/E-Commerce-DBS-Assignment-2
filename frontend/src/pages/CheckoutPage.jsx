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
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [shipLoadError, setShipLoadError] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [form, setForm] = useState({
    recipient_name: "",
    address: "",
    line2: "",
    ward: "",
    district: "",
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
    } else {
      setMessage({
        text: "Vui long quay lai gio hang va chon san pham can thanh toan.",
        type: "error",
      });
    }
    setLoading(false);
  }, [location.state]);

  const loadShippingServices = () => {
    if (servicesLoaded || loadingServices) return;
    
    setLoadingServices(true);
    setShipLoadError("");
    
    ordersAPI.getShippingServices()
      .then((res) => {
        const services = res.data.services || [];
        setShippingServices(services);
        setServicesLoaded(true);
        if (services.length === 0) {
          setShipLoadError("Không có dịch vụ vận chuyển khả dụng.");
        } else if (services.length > 0 && !selectedService) {
          setSelectedService(services[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load shipping services:', err);
        setShipLoadError("Không thể tải dịch vụ vận chuyển. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoadingServices(false);
      });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.recipient_name || !form.phone || !form.address || !form.city || !form.district) {
      setError("Vui long dien day du thong tin giao hang (dia chi, phuong/xa, quan/huyen).");
      return;
    }

    if (!selectedService) {
      setError("Vui long chon don vi van chuyen.");
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
          line2: form.line2 || "",
          ward: form.ward,
          district: form.district,
          city: form.city,
          postal_code: form.postal_code || "",
          country: form.country || "VN",
        },
        service_id: selectedService.service_id,
        payment_method: paymentMethod,
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
  const calcShip = () => selectedService ? Number(selectedService.base_fee) : 0;
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
      {shipLoadError && <div className="alert alert-warning">{shipLoadError}</div>}

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
                    placeholder="Dia chi chi tiet (line1)"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="line2"
                    placeholder="Thong tin bo sung (line2, neu co)"
                    value={form.line2}
                    onChange={handleChange}
                  />
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control mb-2"
                        name="ward"
                        placeholder="Phuong/Xa"
                        value={form.ward}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control mb-2"
                        name="district"
                        placeholder="Quan/Huyen"
                        value={form.district}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
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
                  
                  <label className="form-label mt-2"><strong>Don vi van chuyen:</strong></label>
                  <select
                    className="form-select mb-3"
                    value={selectedService?.service_id || ''}
                    onChange={(e) => {
                      const service = shippingServices.find(s => s.service_id === parseInt(e.target.value));
                      setSelectedService(service);
                    }}
                    onFocus={loadShippingServices}
                    required
                    disabled={loadingServices}
                  >
                    {loadingServices && (
                      <option value="">Đang tải dịch vụ vận chuyển...</option>
                    )}
                    {!loadingServices && shippingServices.length === 0 && (
                      <option value="">Click để tải dịch vụ vận chuyển</option>
                    )}
                    {!loadingServices && shipLoadError && (
                      <option value="">{shipLoadError}</option>
                    )}
                    {!loadingServices && shippingServices.map((service) => (
                      <option key={service.service_id} value={service.service_id}>
                        {service.carrier} - {service.service_name} ({service.est_days_min}-{service.est_days_max} ngay) - {Number(service.base_fee).toLocaleString('vi-VN')} VND
                      </option>
                    ))}
                  </select>
                  
                  <label className="form-label mt-2"><strong>Phương thức thanh toán:</strong></label>
                  <select
                    className="form-select mb-3"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="Cash">Tiền mặt (COD)</option>
                    <option value="BankTransfer">Chuyển khoản ngân hàng</option>
                    <option value="Momo">Ví MoMo</option>
                    <option value="ZaloPay">ZaloPay</option>
                    <option value="VNPay">VNPay</option>
                    <option value="CreditCard">Thẻ tín dụng</option>
                    <option value="DebitCard">Thẻ ghi nợ</option>
                  </select>
                  
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
        <p>Phuong thuc thanh toan: <strong>{paymentMethod === 'Cash' ? 'Tiền mặt (COD)' : 
          paymentMethod === 'BankTransfer' ? 'Chuyển khoản ngân hàng' :
          paymentMethod === 'Momo' ? 'Ví MoMo' :
          paymentMethod === 'ZaloPay' ? 'ZaloPay' :
          paymentMethod === 'VNPay' ? 'VNPay' :
          paymentMethod === 'CreditCard' ? 'Thẻ tín dụng' :
          paymentMethod === 'DebitCard' ? 'Thẻ ghi nợ' : paymentMethod}</strong></p>
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
