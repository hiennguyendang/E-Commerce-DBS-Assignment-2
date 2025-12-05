import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import Spinner from "../components/common/Spinner";
import HeroSection from "../components/layout/HeroSection";

export default function HomePage({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", maxPrice: "" });

  const normalizeProducts = (list) =>
    list.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || p.min_price || 0),
      image: p.primary_image || p.image || "",
      rating: p.rating_average || 0,
      reviews: p.rating_count || 0,
      category_id: p.category_id,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/categories"),
        ]);

        const list = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || [];

        const mapped = normalizeProducts(list);

        setProducts(mapped);
        setFiltered(mapped);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Không thể tải dữ liệu sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      if (!filters.category && !filters.maxPrice) {
        if (products.length > 0) setFiltered(products);
        return;
      }

      try {
        const params = {};
        if (filters.category) {
          const cat = categories.find((c) => c.name === filters.category);
          if (cat) params.category = cat.id;
        }
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;

        const res = await axiosInstance.get("/products", { params });
        const list = res.data?.products || [];
        setFiltered(normalizeProducts(list));
      } catch (err) {
        console.error("Filter error:", err);
      }
    };

    if (products.length > 0) {
      applyFilters();
    }
  }, [filters, categories, products]);

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  if (loading) {
    return <Spinner message="Đang tải sản phẩm..." />;
  }

  const hasFilter = !!(filters.category || filters.maxPrice);

  return (
    <>
      <HeroSection />
      <div className="row g-4">
        <div className="col-lg-3">
          <ProductFilter categories={categories} onFilter={handleFilter} />
        </div>
        <div className="col-lg-9">
          <h5 className="fw-bold mb-3">
            {hasFilter ? "Kết quả lọc sản phẩm" : "Tất cả sản phẩm"}
          </h5>
          <ProductList products={filtered} onAddToCart={onAddToCart} />
        </div>
      </div>
    </>
  );
}
