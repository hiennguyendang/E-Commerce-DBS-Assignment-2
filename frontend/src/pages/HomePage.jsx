import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import Spinner from "../components/common/Spinner";
import HeroSection from "../components/layout/HeroSection";

const PAGE_SIZE = 12;

export default function HomePage({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", maxPrice: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

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
    async function fetchCategories() {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Không thể tải danh mục:", err);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (filters.category) {
          const cat = categories.find((c) => c.name === filters.category);
          if (cat) params.category = cat.id;
        }

        if (filters.maxPrice) {
          params.maxPrice = filters.maxPrice;
        }

        const res = await axiosInstance.get("/products", { params });
        const data = res.data || {};

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(normalizeProducts(list));

        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            totalProducts: data.pagination.totalProducts,
          });
        } else {
          setPagination({
            currentPage: page,
            totalPages: 1,
            totalProducts: list.length,
          });
        }
      } catch (err) {
        console.error("Không thể tải danh sách sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters, page, categories]);

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setPage(1);
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPage((p) => p + 1);
    }
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

          <ProductList products={products} onAddToCart={onAddToCart} />

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Trang {pagination.currentPage}/{pagination.totalPages} •{" "}
                {pagination.totalProducts} sản phẩm
              </div>
              <div>
                <button
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage <= 1}
                >
                  Trang trước
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleNextPage}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

