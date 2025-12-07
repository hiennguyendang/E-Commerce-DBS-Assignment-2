import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import axiosInstance from "../../utils/axiosConfig";

export default function ReviewModal({ order, orderItem, existingReview, onClose, onSuccess }) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [content, setContent] = useState(existingReview?.content || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const isReadOnly = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await axiosInstance.post("/reviews", {
        order_id: order.id,
        line_no: orderItem.line_no,
        rating,
        content: content.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(
        err.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={true}
      onClose={onClose}
      title={isReadOnly ? "Đánh giá của bạn" : "Đánh giá sản phẩm"}
      hideFooter
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">Sản phẩm:</label>
          <p className="mb-0">{orderItem.name}</p>
          {orderItem.variant && orderItem.variant !== "DEFAULT" && (
            <small className="text-muted">Phiên bản: {orderItem.variant}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Đánh giá của bạn: <span className="text-danger">*</span>
          </label>
          <div className="d-flex gap-2 fs-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi bi-star${
                  star <= (hoveredRating || rating) ? "-fill" : ""
                } text-warning`}
                style={{ cursor: isReadOnly ? "default" : "pointer" }}
                onClick={() => !isReadOnly && setRating(star)}
                onMouseEnter={() => !isReadOnly && setHoveredRating(star)}
                onMouseLeave={() => !isReadOnly && setHoveredRating(0)}
              ></i>
            ))}
          </div>
          <small className="text-muted">
            {rating === 5
              ? "Tuyệt vời"
              : rating === 4
              ? "Hài lòng"
              : rating === 3
              ? "Bình thường"
              : rating === 2
              ? "Không hài lòng"
              : "Rất tệ"}
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Nhận xét của bạn:
          </label>
          <textarea
            className="form-control"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            maxLength="1000"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          <small className="text-muted">
            {content.length}/1000 ký tự
          </small>
        </div>
        
        {isReadOnly && (
          <div className="alert alert-info py-2">
            <i className="bi bi-info-circle me-2"></i>
            Bạn đã đánh giá sản phẩm này vào {new Date(existingReview.created_at).toLocaleDateString('vi-VN')}
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <div className="d-flex gap-2 justify-content-end">
          {isReadOnly ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <Button
                type="submit"
                label={submitting ? "Đang gửi..." : "Gửi đánh giá"}
                disabled={submitting}
              />
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
