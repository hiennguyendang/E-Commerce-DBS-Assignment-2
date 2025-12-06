import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import ProductDetail from "../components/product/ProductDetail";

export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        const p = res.data;
        const image = p.images?.[0]?.image_url || p.primary_image || "";
        setProduct({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price || p.min_price || 0),
          image,
          rating: p.rating_average || 0,
          reviews: p.rating_count || 0,
          seller: p.seller || null,
        });
      } catch (err) {
        console.error("Failed to load product:", err);
      }
    }
    fetchProduct();
  }, [id]);

  return (
    <div className="container py-4">
      <ProductDetail product={product} onAddToCart={onAddToCart} />
    </div>
  );
}

