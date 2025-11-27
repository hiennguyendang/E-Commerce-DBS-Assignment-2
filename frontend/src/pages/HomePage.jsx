import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import Spinner from "../components/common/Spinner";

export default function HomePage({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeProducts = (list) =>
    list.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || p.min_price || 0),
      image: p.primary_image || p.image || "",
      rating: p.rating_average || 0,
      reviews: p.rating_count || 0,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, featuredRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/categories"),
          axiosInstance.get("/products/featured/list"),
        ]);

        const list = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || [];

        const mapped = normalizeProducts(list);

        setProducts(mapped);
        setFiltered(mapped);
        setCategories(catRes.data || []);
        setFeatured(
          Array.isArray(featuredRes.data)
            ? normalizeProducts(featuredRes.data)
            : []
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Không thể tải dữ liệu sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = async (type, value) => {
    if (type === "category") {
      if (!value) {
        setFiltered(products);
        return;
      }

      try {
        const cat = categories.find((c) => c.name === value);
        if (!cat) {
          setFiltered(products);
          return;
        }

        const res = await axiosInstance.get("/products", {
          params: { category: cat.id },
        });

        const list = res.data?.products || [];
        setFiltered(normalizeProducts(list));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Lọc theo danh mục lỗi:", err);
        setFiltered(products);
      }
      return;
    }

    if (type === "maxPrice") {
      const max = Number(value || 0);
      if (!max) {
        setFiltered(products);
        return;
      }
      setFiltered(products.filter((p) => p.price <= max));
    }
  };

  if (loading) {
    return <Spinner message="Đang tải sản phẩm..." />;
  }

  return (
    <div className="row g-4">
      <div className="col-lg-3">
        <ProductFilter categories={categories} onFilter={handleFilter} />
      </div>
      <div className="col-lg-9">
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="row g-3">
              {categories.slice(0, 3).map((cat) => (
                <div key={cat.id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="fw-bold mb-1">{cat.name}</h6>
                      <p className="small text-muted mb-2">
                        {cat.description ||
                          "Khám phá các sản phẩm nổi bật trong danh mục này."}
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-bk"
                        onClick={() => handleFilter("category", cat.name)}
                      >
                        Xem ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {featured.length > 0 && (
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Gợi ý hôm nay cho bạn</h5>
            <ProductList products={featured} onAddToCart={onAddToCart} />
          </div>
        )}

        <h5 className="fw-bold mb-3">Tất cả sản phẩm</h5>
        <ProductList products={filtered} onAddToCart={onAddToCart} />
      </div>
    </div>
  );
}

