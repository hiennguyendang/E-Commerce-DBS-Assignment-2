import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import ProductList from "../components/product/ProductList";
import Spinner from "../components/common/Spinner";

export default function SellerShopPage({ onAddToCart }) {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/products/seller/${sellerId}`);
        setSeller(res.data.seller);
        setProducts(
          (res.data.products || []).map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price || p.min_price || 0),
            image: p.primary_image || "",
            rating: 0,
            reviews: 0,
          }))
        );
      } catch (err) {
        console.error("Không thể tải thông tin shop:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return <Spinner message="Đang tải thông tin shop..." />;
  }

  if (!seller) {
    return (
      <div className="container py-4">
        <p>Không tìm thấy shop.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 p-3 bg-white rounded shadow-sm d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1">{seller.shop_name}</h4>
          <div className="text-muted small">
            Chủ shop: {seller.owner_name || "Không rõ"}
          </div>
          <div className="text-muted small">
            Seller ID: <code>{seller.seller_id}</code>
          </div>
        </div>
        {seller.rating_avg != null && (
          <div className="text-end">
            <div className="small text-muted">Đánh giá</div>
            <div className="fw-bold">{Number(seller.rating_avg).toFixed(2)} / 5</div>
          </div>
        )}
      </div>

      <h5 className="fw-bold mb-3">Các sản phẩm của shop</h5>
      <ProductList products={products} onAddToCart={onAddToCart} />
    </div>
  );
}

