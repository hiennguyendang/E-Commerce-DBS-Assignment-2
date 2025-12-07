import React from "react";

export default function RatingStars({ rating = 0, size = 18 }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center">
      {[...Array(fullStars)].map((_, i) => (
        <i key={`f${i}`} className="bi bi-star-fill text-warning" style={{ fontSize: size }}></i>
      ))}
      {halfStar && <i className="bi bi-star-half text-warning" style={{ fontSize: size }}></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`e${i}`} className="bi bi-star text-warning" style={{ fontSize: size }}></i>
      ))}
    </div>
  );
}
