import React, { useState } from "react";
import Modal from "../common/Modal";
import axiosInstance from "../../utils/axiosConfig";

export default function ReturnRequestModal({ order, onClose, onSuccess }) {
  const [form, setForm] = useState({
    lineNo: order.items && order.items.length > 0 ? order.items[0].line_no : 1,
    reason: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const RETURN_REASONS = [
    "Sản phẩm bị lỗi/hư hỏng",
    "Sản phẩm không đúng mô tả",
    "Sản phẩm không đúng size/màu",
    "Sản phẩm thiếu phụ kiện",
    "Giao sai sản phẩm",
    "Không còn nhu cầu sử dụng",
    "Lý do khác"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.reason) {
      setError("Vui lòng chọn lý do đổi trả!");
      return;
    }

    // Ensure orderId is a number
    const orderId = parseInt(order.order_id || order.id);
    
    if (!orderId || isNaN(orderId)) {
      setError("Không tìm thấy ID đơn hàng!");
      console.error('Invalid orderId:', { order });
      return;
    }

    console.log('📤 Submitting return request:', {
      orderId,
      lineNo: form.lineNo,
      orderCode: order.code,
      reason: form.reason,
      description: form.description
    });

    setLoading(true);

    try {
      const response = await axiosInstance.post("/returns/create", {
        orderId: orderId,
        lineNo: parseInt(form.lineNo),
        reason: form.reason,
        description: form.description
      });

      console.log('✅ Return request created:', response.data);
      alert("Gửi yêu cầu đổi trả thành công! Vui lòng chờ người bán xác nhận.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Create return request error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Không thể gửi yêu cầu đổi trả!");
    } finally {
      setLoading(false);
    }
  };

  // Tính số ngày còn lại để đổi trả
  const getReturnDeadline = () => {
    if (!order.delivered_at && !order.date) return null;
    
    const deliveredDate = new Date(order.delivered_at || order.date);
    const deadline = new Date(deliveredDate);
    deadline.setDate(deadline.getDate() + 7);
    
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    return { deadline, daysLeft };
  };

  const returnInfo = getReturnDeadline();

  return (
    <Modal onClose={onClose} show={true}>
      <div className="modal-header">
        <h5 className="modal-title">
          <i className="bi bi-arrow-return-left me-2 text-warning"></i>
          Yêu cầu đổi trả đơn hàng
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="alert alert-info py-2 small mb-3">
            <strong>Mã đơn hàng:</strong> {order.code}
            <br />
            {returnInfo && (
              <>
                <strong>Thời hạn đổi trả:</strong>{" "}
                {returnInfo.daysLeft > 0 ? (
                  <span className="text-success">
                    Còn {returnInfo.daysLeft} ngày (đến{" "}
                    {returnInfo.deadline.toLocaleDateString("vi-VN")})
                  </span>
                ) : (
                  <span className="text-danger">Đã hết hạn đổi trả</span>
                )}
              </>
            )}
          </div>

          {/* Product Selection */}
          {order.items && order.items.length > 1 && (
            <div className="mb-3">
              <label className="form-label">
                Sản phẩm cần đổi trả <span className="text-danger">*</span>
              </label>
              <select
                name="lineNo"
                className="form-select"
                value={form.lineNo}
                onChange={handleChange}
                required
              >
                {order.items.map((item) => (
                  <option key={item.line_no} value={item.line_no}>
                    {item.name} - {item.variant} (x{item.qty}) - {item.unit_price?.toLocaleString('vi-VN')}₫
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Chọn sản phẩm cụ thể bạn muốn đổi trả
              </small>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">
              Lý do đổi trả <span className="text-danger">*</span>
            </label>
            <select
              name="reason"
              className="form-select"
              value={form.reason}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn lý do --</option>
              {RETURN_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả chi tiết (tùy chọn)</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              placeholder="Mô tả chi tiết về vấn đề của sản phẩm..."
              value={form.description}
              onChange={handleChange}
              maxLength={500}
            />
            <small className="text-muted">
              {form.description.length}/500 ký tự
            </small>
          </div>

          <div className="alert alert-warning py-2 small">
            <strong>Lưu ý:</strong>
            <ul className="mb-0 ps-3">
              <li>Yêu cầu đổi trả chỉ được chấp nhận trong vòng 7 ngày kể từ ngày nhận hàng</li>
              <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng</li>
              <li>Người bán sẽ xem xét và phản hồi trong vòng 24-48 giờ</li>
              <li>Nếu được chấp nhận, bạn sẽ nhận lại tiền trong 3-5 ngày làm việc</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-warning"
            disabled={loading || (returnInfo && returnInfo.daysLeft <= 0)}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
